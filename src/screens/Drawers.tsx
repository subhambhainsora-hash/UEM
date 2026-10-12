import * as React from 'react';
import { AlertTriangle, Search, Upload, X } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { AppIcon, CountBadge, Drawer, SigningBadge, SourceBadge, ToggleRow, UButton, UCheckbox } from '../components/uem';
import emptyGlobe from '../assets/ds/empty-globe.svg';
import emptyPuzzle from '../assets/ds/empty-puzzle.svg';
import { AddRow, EmptyState, Field, InfoAlert, tabListClass, tabTriggerClass } from '../components/ds';
import { cn } from '../components/ui/utils';
import { storeSearchResults, libraryApps, signingState, plural, readIpa, readManifest, bumpPatch, type CatalogApp, type LibraryApp, type ReadBuild } from '../data';

/* D2 · Add App Store apps -------------------------------------------------- */
export function AddStoreDrawer({
  open,
  onOpenChange,
  country,
  existing,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  country: string;
  existing: string[];
  onAdd: (ids: string[]) => void;
}) {
  const [q, setQ] = React.useState('microsoft');
  const [sel, setSel] = React.useState<string[]>(['teams', 'auth']);
  const results = storeSearchResults.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Add App Store apps"
      subtitle={`From the ${country} App Store, this profile's country`}
      width={600}
      footer={
        <>
          <span className="grow text-[14px]">{sel.length} selected</span>
          <UButton tone="outline" onClick={() => onOpenChange(false)}>Cancel</UButton>
          <UButton disabled={!sel.length} onClick={() => onAdd(sel)}>
            Add {sel.length} {sel.length === 1 ? 'app' : 'apps'}
          </UButton>
        </>
      }
    >
      <div className="border-t border-soft px-6 pt-4">
        <label className="flex h-10 items-center gap-2.5 rounded-[4px] border border-uem px-3">
          <Search className="size-4 text-muted" strokeWidth={1.7} />
          <Input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search App Store" className="h-auto border-0 bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0" />
        </label>
        <p className="mt-4 mb-2 text-[12px] text-muted">{results.length} results</p>
        <div className="overflow-hidden rounded-[6px] border border-line">
          {results.length === 0 && <EmptyState icon={emptyGlobe} title={`No apps match “${q}”`} sub="Try the app’s exact name, or check the App Store country." className="min-h-[160px] rounded-none border-0" />}
          {results.map((r) => {
            const inProfile = existing.includes(r.id);
            const on = inProfile || sel.includes(r.id);
            return (
              <label key={r.id} className={cn('flex items-center gap-3.5 border-b border-row px-4 py-2 last:border-0', sel.includes(r.id) && 'bg-[#f0f7ff]')}>
                <UCheckbox checked={on} disabled={inProfile} onCheckedChange={() => toggle(r.id)} aria-label={r.name} />
                <AppIcon logo={r.logo} name={r.name} color={r.color} size={34} />
                <span className="flex grow flex-col">
                  <span className="text-[15px] text-heading">{r.name}</span>
                  <span className="text-[12px] text-muted">Microsoft Corporation</span>
                </span>
                {inProfile && <span className="text-[12px] text-muted">In this profile</span>}
              </label>
            );
          })}
        </div>
      </div>
    </Drawer>
  );
}

/* D5 / D6 · Add in-house apps ---------------------------------------------- */
const isManifestUrl = (v: string) => /^https:\/\/[^\s]+\.plist$/i.test(v.trim());

function BuildSummary({ b, note }: { b: ReadBuild; note?: string }) {
  return (
    <div className="mt-4 rounded-[8px] border border-line px-4 py-3 text-[13px] leading-5">
      <p className="m-0 font-semibold text-heading">{note ?? `Read from ${b.appName}`}</p>
      <p className="mt-1 mb-0 text-muted">{b.bundleId} · version {b.version} · iOS {b.minIos} and later</p>
      <p className="mt-1.5 mb-0"><SigningBadge expires={b.signingExpires} /></p>
    </div>
  );
}

export function AddInhouseDrawer({
  open,
  onOpenChange,
  initialMode = 'library',
  inProfile = [],
  onAdd,
  context = 'profile',
  forApp,
  onUpload,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initialMode?: 'library' | 'upload' | 'manifest';
  /** Profile context: library apps already in this profile. */
  inProfile?: string[];
  /** Profile context: add these library apps to the profile. */
  onAdd?: (ids: string[]) => void;
  /** Where the drawer was opened from. Changes copy and the save label. */
  context?: 'profile' | 'library';
  /** Adding a build to an existing library app, not a new app. */
  forApp?: LibraryApp;
  /** A new app (or new build) was read from an .ipa or manifest. */
  onUpload?: (b: ReadBuild, source: 'ipa' | 'manifest') => void;
}) {
  const [mode, setMode] = React.useState(initialMode);
  const [sel, setSel] = React.useState<string[]>([]);
  const [q, setQ] = React.useState('');
  const [file, setFile] = React.useState<ReadBuild | null>(null);
  const [fileName, setFileName] = React.useState('');
  const [reading, setReading] = React.useState(false);
  const [url, setUrl] = React.useState('');
  const [manifest, setManifest] = React.useState<ReadBuild | null>(null);
  const [libName, setLibName] = React.useState('');
  const fileRef = React.useRef<HTMLInputElement>(null);
  const latest = forApp?.builds.find((b) => b.status === 'Available')?.version;

  React.useEffect(() => {
    if (!open) return;
    setMode(forApp ? 'upload' : initialMode); setSel([]); setQ(''); setFile(null); setFileName(''); setReading(false); setUrl(''); setManifest(null); setLibName('');
  }, [initialMode, open, forApp]);

  /* Reading the manifest is simulated: a valid URL resolves after a short delay. */
  React.useEffect(() => {
    if (!isManifestUrl(url)) { setManifest(null); return; }
    setReading(true);
    const t = window.setTimeout(() => { setManifest(forApp ? { ...readManifest(url), appName: forApp.name, bundleId: forApp.bundleId, version: bumpPatch(latest ?? '1.0.0') } : readManifest(url)); setReading(false); }, 500);
    return () => window.clearTimeout(t);
  }, [url, forApp, latest]);

  const pick = (f: File | undefined) => {
    if (!f) return;
    setFileName(f.name); setReading(true); setFile(null);
    window.setTimeout(() => {
      const b = forApp ? { ...readIpa(f.name), appName: forApp.name, bundleId: forApp.bundleId, version: bumpPatch(latest ?? '1.0.0') } : readIpa(f.name);
      setFile(b); setLibName(b.appName); setReading(false);
    }, 600);
  };

  const libRows = libraryApps.filter((a) => (a.name + a.bundleId).toLowerCase().includes(q.toLowerCase()));
  const canSave = mode === 'library' ? sel.length > 0 : mode === 'upload' ? !!file && !reading : !!manifest && !reading;
  const save = () => {
    if (mode === 'library') { onAdd?.(sel); return; }
    const b = mode === 'upload' ? file! : manifest!;
    onUpload?.({ ...b, appName: mode === 'upload' && libName.trim() ? libName.trim() : b.appName }, mode === 'upload' ? 'ipa' : 'manifest');
    onOpenChange(false);
  };
  const saveLabel = forApp ? 'Add build' : mode === 'library' ? `Add ${plural(sel.length, 'app')}` : context === 'profile' ? 'Save and add to profile' : 'Add to App Groups';
  const title = forApp ? `Add build to ${forApp.name}` : context === 'profile' ? 'Add in-house apps' : 'Add an in-house app';
  const subtitle = forApp
    ? (forApp.usedBy.devices ? `${plural(forApp.usedBy.devices, 'device')} in ${plural(forApp.usedBy.profiles, 'profile')} get the new build at next check-in` : 'No profile uses this app yet, so nothing reaches devices')
    : context === 'profile' ? 'Pick from App Groups, or add a new app' : 'Upload a signed .ipa, or point at a manifest';

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      subtitle={subtitle}
      width={520}
      footer={
        <>
          <span className="grow text-[14px] text-muted">{mode === 'library' ? `${sel.length} selected` : reading ? 'Reading…' : ''}</span>
          <UButton tone="outline" onClick={() => onOpenChange(false)}>Cancel</UButton>
          <UButton disabled={!canSave} onClick={save}>{saveLabel}</UButton>
        </>
      }
    >
      <div className="border-t border-soft px-6 pt-2">
        <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)} className="gap-0">
          <TabsList className={tabListClass}>
            {!forApp && context === 'profile' && <TabsTrigger value="library" className={tabTriggerClass}>From App Groups</TabsTrigger>}
            <TabsTrigger value="upload" className={tabTriggerClass}>Upload .ipa</TabsTrigger>
            <TabsTrigger value="manifest" className={tabTriggerClass}>Manifest URL</TabsTrigger>
          </TabsList>
        </Tabs>

        {mode === 'library' && (
          <>
            <label className="mt-[18px] flex h-10 items-center gap-2.5 rounded-[6px] border border-line px-3 focus-within:border-uem">
              <Search className="size-4 text-muted" strokeWidth={1.7} />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search App Groups" aria-label="Search App Groups" className="h-auto border-0 bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0" />
              {q && <button type="button" aria-label="Clear search" onClick={() => setQ('')} className="flex border-0 bg-transparent p-0 text-muted hover:text-ink"><X className="size-4" strokeWidth={1.7} /></button>}
            </label>
            <div className="mt-4 overflow-hidden rounded-[6px] border border-line">
              {libRows.length === 0 && <EmptyState icon={emptyPuzzle} title={`No apps match “${q}”`} sub="Try the bundle ID, or upload the app on the next tab." className="min-h-[160px] rounded-none border-0" />}
              {libRows.map((a) => {
                const here = inProfile.includes(a.id);
                const sibling = !here && a.id === 'crm-beta' && inProfile.includes('crm');
                const expired = signingState(a.signingExpires).kind === 'expired';
                const checked = here || sel.includes(a.id);
                return (
                  <label key={a.id} className={cn('flex items-center gap-3.5 border-b border-row px-4 py-2.5 last:border-0', sel.includes(a.id) && 'bg-[#f0f7ff]', !(here || sibling || expired) && 'cursor-pointer hover:bg-[#fafafa]')}>
                    <UCheckbox
                      checked={checked}
                      disabled={here || sibling || expired}
                      onCheckedChange={() => setSel((s) => (s.includes(a.id) ? s.filter((x) => x !== a.id) : [...s, a.id]))}
                      aria-label={a.name}
                    />
                    <AppIcon logo={a.logo} name={a.name} color={a.color} size={36} />
                    <span className="flex grow flex-col">
                      <span className="text-[15px] font-medium text-heading">{a.name}</span>
                      <span className="text-[12px] text-muted">{a.bundleId} · build {a.build}</span>
                    </span>
                    <span className="max-w-[170px] text-right text-[12px] text-muted">
                      {here ? 'In this profile' : sibling ? 'Another channel of this app is in the profile' : expired ? (
                        <span className="flex flex-col items-end gap-0.5"><SigningBadge expires={a.signingExpires} short /><span>Upload a re-signed build to add it</span></span>
                      ) : signingState(a.signingExpires).kind === 'expiring' ? <SigningBadge expires={a.signingExpires} short /> : ''}
                    </span>
                  </label>
                );
              })}
            </div>
          </>
        )}

        {mode === 'upload' && (
          <>
            <input ref={fileRef} type="file" accept=".ipa" className="sr-only" aria-label="Choose an .ipa file" onChange={(e) => pick(e.target.files?.[0])} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files?.[0]); }}
              className="mt-[18px] flex min-h-[160px] w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[12px] border-[1.5px] border-dashed border-dash bg-white px-6 py-6 text-center hover:bg-[#fafafa] focus-visible:border-uem"
            >
              <Upload className="size-8 text-uem" strokeWidth={1.5} />
              <span className="text-[15px] font-semibold text-heading">{fileName ? fileName : <>Drop an .ipa file here, or <span className="text-uem underline">browse</span></>}</span>
              <span className="text-[12px] text-muted">{fileName ? 'Choose a different file' : 'Up to 4 GB. Signed for in-house distribution.'}</span>
            </button>
            {reading && <p className="mt-4 mb-0 text-[13px] text-muted" aria-live="polite">Reading {fileName}…</p>}
            {file && (
              <>
                <BuildSummary b={file} note={`Read from ${fileName}`} />
                {forApp ? (
                  <p className="mt-3 mb-0 text-[12px] text-muted">Becomes the available build. {latest ? `${latest} stays available until you retire it.` : ''}</p>
                ) : (
                  <>
                    <Field className="mt-5" label="App name in App Groups" value={libName} onChange={(e) => setLibName(e.target.value)} />
                    <p className="mt-2.5 mb-0 text-[12px] text-muted">{context === 'profile' ? 'The app is saved to App Groups and added to this profile.' : 'The app is saved to App Groups. Add it to devices from a profile’s App Catalog.'}</p>
                  </>
                )}
              </>
            )}
          </>
        )}

        {mode === 'manifest' && (
          <>
            <Field className="mt-5" label="Manifest URL" required info="A public plist that points to the signed .ipa" placeholder="https://apps.acme.com/expense/manifest.plist" value={url} onChange={(e) => setUrl(e.target.value)} inputMode="url"
              error={url && !isManifestUrl(url) ? 'Needs to be an https:// address ending in .plist' : undefined} />
            {reading && <p className="mt-3 mb-0 text-[13px] text-muted" aria-live="polite">Reading manifest…</p>}
            {manifest && <BuildSummary b={manifest} note="Read from manifest" />}
            {!url && <p className="mt-2.5 mb-0 text-[12px] text-muted">We read the bundle ID and version from the manifest. {context === 'profile' ? 'The app is saved to App Groups and added to this profile.' : 'The app is saved to App Groups.'}</p>}
          </>
        )}
      </div>
    </Drawer>
  );
}

/* D3 / S1 / S2 · App settings -------------------------------------------- */
const plistKeys = (v: string) => (v.match(/<key>/g) ?? []).length;

const toggleDefs = [
  ['removable', 'Removable', 'Allows the user to uninstall the app · iOS 14 and later'],
  ['hideable', 'Hideable', 'Allows the user to hide the app'],
  ['lockable', 'Lockable', 'Allows the user to lock the app'],
  ['backup', 'Prevent backup', 'Keeps the app data out of iCloud and device backups'],
  ['vpn', 'Requires VPN for networking', 'Routes the app through the miniOrange per-app VPN'],
  ['tap', 'Tap to Pay screen lock', 'Locks the device after each Tap to Pay transaction'],
] as const;

export function AppSettingsDrawer({ app, onOpenChange, onSave }: { app: CatalogApp | null; onOpenChange: (o: boolean) => void; onSave?: () => void }) {
  const enterprise = app?.source === 'Enterprise';
  const lib = app ? libraryApps.find((l) => l.id === app.id) : undefined;
  const [lastBuild, setLastBuild] = React.useState<string | null>(null);
  const [state, setState] = React.useState<Record<string, boolean>>({});
  const [domains, setDomains] = React.useState<string[]>([]);
  const [domainDraft, setDomainDraft] = React.useState('');
  const [config, setConfig] = React.useState('');
  React.useEffect(() => { setDomains(app?.chips.some((c) => c.includes('associated domain')) ? ['crm.acme.com'] : []); setDomainDraft(''); setConfig(''); }, [app?.id]);
  const configError = config.trim() && !(/<dict>[\s\S]*<\/dict>/.test(config.trim())) ? 'Needs a <dict> … </dict> block, as in a plist' : config.trim() && (config.match(/<key>/g) ?? []).length !== (config.match(/<\/key>/g) ?? []).length ? 'A <key> is missing its closing </key>' : '';
  React.useEffect(() => {
    setState(enterprise ? { backup: true, vpn: true } : { removable: true, backup: true });
  }, [app?.id, enterprise]);
  const [builds, setBuilds] = React.useState<Record<string, string>>({});
  React.useEffect(() => {
    setBuilds(Object.fromEntries((lib?.builds ?? []).map((b) => [b.version, b.status])));
  }, [lib]);
  const toggleBuild = (v: string, s: string) => {
    if (s === 'Available' && Object.values(builds).filter((x) => x === 'Available').length <= 1) { setLastBuild(v); return; }
    setBuilds((b) => ({ ...b, [v]: s === 'Available' ? 'Retired' : 'Available' }));
    onSave?.();
  };
  return (
    <Drawer
      open={!!app}
      onOpenChange={onOpenChange}
      title="App settings"
      width={600}
      footer={
        <>
          <span className="grow" />
          <UButton tone="outline" onClick={() => onOpenChange(false)}>Cancel</UButton>
          <UButton disabled={!!configError} onClick={() => { onSave?.(); onOpenChange(false); }}>Save settings</UButton>
        </>
      }
    >
      {app && (
        <>
          <div className="px-6">
            <div className="flex items-center gap-3.5">
              <AppIcon logo={app.logo} name={app.name} color={app.color} size={48} />
              <div className="flex grow flex-col">
                <span className="text-[16px] font-semibold text-heading">{app.name}</span>
                <span className="text-[13px] text-muted">{app.bundleId}</span>
              </div>
              <SourceBadge source={app.source} size="md" />
            </div>
            {enterprise ? (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[14px] font-semibold">Builds</span>
                  <UButton tone="outline" size="sm"><Upload strokeWidth={1.7} />Add build</UButton>
                </div>
                <div className="overflow-hidden rounded-[6px] border border-line">
                  {Object.entries(builds).map(([v, s]) => (
                    <div key={v} className={cn('flex flex-col border-b border-row px-3 py-2 text-[13px] last:border-0', s === 'Available' && 'bg-[#f0f7ff]')}>
                      <div className="flex items-center gap-4">
                        <span className="w-14 font-semibold">{v}</span>
                        <span className={cn('rounded-[10px] px-2 py-px', s === 'Available' ? 'bg-[#e8f5e9] text-ok' : 'bg-[#f5f5f5] text-muted')}>{s}</span>
                        <span className="grow text-muted">{s === 'Available' ? <span className="inline-flex items-center gap-2">Devices get this build · <SigningBadge expires={app.signingExpires} /></span> : 'Restore to roll devices back to this build'}</span>
                        <UButton tone="outline" size="sm" onClick={() => (lastBuild === v ? setLastBuild(null) : toggleBuild(v, s))}>
                          {s === 'Available' ? 'Retire' : 'Restore'}
                        </UButton>
                      </div>
                      {lastBuild === v && (
                        <div role="alert" className="mt-2 flex flex-col gap-2 text-muted">
                          <span className="flex items-start gap-2"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#7b341e]" strokeWidth={1.7} /><span><b className="font-semibold text-ink">Can’t retire the only available build.</b> Every profile that uses {app.name} would have nothing to deliver. Restore an older build or add a new one first.</span></span>
                          <span><UButton tone="neutral" size="sm" autoFocus onClick={() => setLastBuild(null)}>OK</UButton></span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[12px] text-[#7b341e]">
                  Builds belong to the channel {app.name}. Retiring one affects {lib ? `${plural(lib.usedBy.profiles, 'profile')} and ${plural(lib.usedBy.devices, 'device')}` : 'every profile that uses this channel'}.
                </p>
              </div>
            ) : (
              <div className="mt-4">
                <InfoAlert>United States listing, version 24.10.10. The App Store always installs its latest version. Without VPP the user is asked for an Apple ID.</InfoAlert>
              </div>
            )}
          </div>
          <Tabs defaultValue="settings" className="mt-4 gap-0">
            <TabsList className={cn(tabListClass, 'px-6')}>
              <TabsTrigger value="settings" className={tabTriggerClass}>Settings</TabsTrigger>
              <TabsTrigger value="domains" className={tabTriggerClass}>Domains {domains.length > 0 && <CountBadge n={domains.length} />}</TabsTrigger>
              <TabsTrigger value="config" className={tabTriggerClass}>Config {config.trim() && <CountBadge n={plistKeys(config)} />}</TabsTrigger>
            </TabsList>
            <TabsContent value="settings" className="px-6 pt-2">
              {toggleDefs.map(([k, t, h]) => (
                <ToggleRow key={k} title={t} hint={h} checked={!!state[k]} onChange={(v) => setState((s) => ({ ...s, [k]: v }))} />
              ))}
            </TabsContent>
            <TabsContent value="domains" className="px-6 pt-4 text-[14px]">
              <AddRow label="Associated domains" info="Lets the app open links and share credentials for these domains" placeholder="acme.com" buttonLabel="Add domain" value={domainDraft} onChange={setDomainDraft}
                onAdd={(v) => { const d = v.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, ''); if (d && !domains.includes(d)) setDomains((x) => [...x, d]); }} />
              {domains.length === 0 ? (
                <p className="mt-3 mb-0 text-[12px] text-muted">No domains yet. Universal links to this app open in Safari until you add one.</p>
              ) : (
                <ul className="mt-3 m-0 list-none overflow-hidden rounded-[6px] border border-line p-0">
                  {domains.map((d) => (
                    <li key={d} className="flex items-center gap-3 border-b border-row px-3 py-2.5 text-[14px] last:border-0">
                      <span className="grow">{d}</span>
                      <button type="button" aria-label={`Remove ${d}`} onClick={() => setDomains((x) => x.filter((y) => y !== d))} className="flex border-0 bg-transparent p-0 text-muted hover:text-ink"><X className="size-4" strokeWidth={1.7} /></button>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
            <TabsContent value="config" className="px-6 pt-4 text-[14px] text-muted">
              <div className="flex flex-col gap-2">
                <label htmlFor="managed-config" className="text-[14px] font-semibold text-heading">Managed app configuration</label>
                <textarea id="managed-config" value={config} onChange={(e) => setConfig(e.target.value)} placeholder={'<dict>\n  <key>serverUrl</key>\n  <string>https://crm.acme.com</string>\n</dict>'} aria-invalid={!!configError}
                  className={cn('h-40 w-full rounded-[6px] border p-2.5 font-mono text-[13px] text-ink placeholder:text-placeholder focus-visible:border-uem focus-visible:outline-none', configError ? 'border-bad' : 'border-line')} />
                {configError ? <span className="text-[12px] text-bad">{configError}</span> : config.trim() ? <span className="text-[12px] text-ok">Valid plist · {plural(plistKeys(config), 'key')} sent to the app at install</span> : <span className="text-[12px] text-muted">Sent to the app as key-value pairs at install.</span>}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </Drawer>
  );
}
