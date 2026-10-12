import * as React from 'react';
import { Search, Upload } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { AppIcon, Drawer, SigningBadge, SourceBadge, ToggleRow, UButton, UCheckbox } from '../components/uem';
import { LastBuildDialog } from './Dialogs';
import emptyGlobe from '../assets/ds/empty-globe.svg';
import { EmptyState, Field, InfoAlert, tabListClass, tabTriggerClass } from '../components/ds';
import { cn } from '../components/ui/utils';
import { storeSearchResults, libraryApps, signingState, plural, type CatalogApp } from '../data';

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
export function AddInhouseDrawer({
  open,
  onOpenChange,
  initialMode = 'library',
  inProfile,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initialMode?: 'library' | 'upload' | 'manifest';
  inProfile: string[];
  onAdd: (ids: string[]) => void;
}) {
  const [mode, setMode] = React.useState(initialMode);
  const [sel, setSel] = React.useState<string[]>(['expense']);
  React.useEffect(() => setMode(initialMode), [initialMode, open]);
  const footer =
    mode === 'library' ? (
      <>
        <span className="grow text-[14px]">{sel.length} selected</span>
        <UButton tone="outline" onClick={() => onOpenChange(false)}>Cancel</UButton>
        <UButton disabled={!sel.length} onClick={() => onAdd(sel)}>Add {sel.length} app</UButton>
      </>
    ) : (
      <>
        <span className="grow" />
        <UButton tone="outline" onClick={() => onOpenChange(false)}>Cancel</UButton>
        <UButton onClick={() => onAdd(['expense'])}>Save and add</UButton>
      </>
    );
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Add in-house apps" subtitle="Pick from your App Library, or add a new app" width={520} footer={footer}>
      <div className="border-t border-soft px-6 pt-2">
        <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)} className="gap-0">
          <TabsList className={tabListClass}>
            <TabsTrigger value="library" className={tabTriggerClass}>From library</TabsTrigger>
            <TabsTrigger value="upload" className={tabTriggerClass}>Upload .ipa</TabsTrigger>
            <TabsTrigger value="manifest" className={tabTriggerClass}>Manifest URL</TabsTrigger>
          </TabsList>
        </Tabs>

        {mode === 'library' && (
          <>
            <label className="mt-[18px] flex h-10 items-center gap-2.5 rounded-[6px] border border-line px-3">
              <Search className="size-4 text-muted" strokeWidth={1.7} />
              <Input placeholder="Search the App Library" className="h-auto border-0 bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0" />
            </label>
            <div className="mt-4 overflow-hidden rounded-[6px] border border-line">
              {libraryApps.map((a) => {
                const here = inProfile.includes(a.id);
                const sibling = !here && a.id === 'crm-beta' && inProfile.includes('crm');
                const expired = signingState(a.signingExpires).kind === 'expired';
                const checked = here || sel.includes(a.id);
                return (
                  <label key={a.id} className={cn('flex items-center gap-3.5 border-b border-row px-4 py-2.5 last:border-0', sel.includes(a.id) && 'bg-[#f0f7ff]')}>
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
            <label className="mt-[18px] flex min-h-[160px] w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[12px] border-[1.5px] border-dashed border-dash px-6 py-6 text-center hover:bg-[#fafafa]">
              <input type="file" accept=".ipa" className="sr-only" />
              <Upload className="size-8 text-uem" strokeWidth={1.5} />
              <span className="text-[15px] font-semibold text-heading">Drop an .ipa file here, or <span className="text-uem underline">browse</span></span>
              <span className="text-[12px] text-muted">Up to 4 GB. Signed for in-house distribution.</span>
            </label>
            <div className="mt-4 rounded-[8px] border border-line px-4 py-3 text-[13px] leading-5">
              <p className="m-0 font-semibold text-heading">Read from AcmeExpense.ipa</p>
              <p className="mt-1 mb-0 text-muted">com.acme.expense · version 2.0.3 · iOS 16.0 and later</p>
              <p className="mt-1.5 mb-0"><SigningBadge expires="2026-11-12" /></p>
            </div>
            <Field className="mt-5" label="App name in the library" defaultValue="Acme Expense" />
            <p className="mt-2.5 text-[12px] text-muted">The app is saved to the App Library and added to this profile.</p>
          </>
        )}

        {mode === 'manifest' && (
          <>
            <Field className="mt-5" label="Manifest URL" required info="A public plist that points to the signed .ipa" placeholder="https://apps.acme.com/expense/manifest.plist" />
            <p className="mt-2.5 text-[12px] text-muted">We read the bundle ID and version from the manifest. The app is saved to the App Library and added to this profile.</p>
          </>
        )}
      </div>
    </Drawer>
  );
}

/* D3 / S1 / S2 · App settings -------------------------------------------- */
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
          <UButton onClick={() => { onSave?.(); onOpenChange(false); }}>Save settings</UButton>
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
                    <div key={v} className={cn('flex items-center gap-4 border-b border-row px-3 py-2 text-[13px] last:border-0', s === 'Available' && 'bg-[#f0f7ff]')}>
                      <span className="w-14 font-semibold">{v}</span>
                      <span className={cn('rounded-[10px] px-2 py-px', s === 'Available' ? 'bg-[#e8f5e9] text-ok' : 'bg-[#f5f5f5] text-muted')}>{s}</span>
                      <span className="grow text-muted">{s === 'Available' ? <span className="inline-flex items-center gap-2">Devices get this build · <SigningBadge expires={app.signingExpires} /></span> : 'Restore to roll devices back to this build'}</span>
                      <UButton tone="outline" size="sm" onClick={() => toggleBuild(v, s)}>
                        {s === 'Available' ? 'Retire' : 'Restore'}
                      </UButton>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[12px] text-[#7b341e]">
                  Builds belong to the channel {app.name}. Retiring one affects {lib ? `${plural(lib.usedBy.profiles, 'profile')} and ${plural(lib.usedBy.devices, 'device')}` : 'every profile that uses this channel'}.
                </p>
                <LastBuildDialog open={!!lastBuild} appName={app.name} version={lastBuild ?? ''} onClose={() => setLastBuild(null)} />
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
              <TabsTrigger value="domains" className={tabTriggerClass}>Domains</TabsTrigger>
              <TabsTrigger value="config" className={tabTriggerClass}>Config</TabsTrigger>
            </TabsList>
            <TabsContent value="settings" className="px-6 pt-2">
              {toggleDefs.map(([k, t, h]) => (
                <ToggleRow key={k} title={t} hint={h} checked={!!state[k]} onChange={(v) => setState((s) => ({ ...s, [k]: v }))} />
              ))}
            </TabsContent>
            <TabsContent value="domains" className="px-6 pt-4 text-[14px] text-muted">
              <Field label="Associated domains" info="Lets the app open links and share credentials for these domains" placeholder="acme.com" />
            </TabsContent>
            <TabsContent value="config" className="px-6 pt-4 text-[14px] text-muted">
              <div className="flex flex-col gap-2">
                <span className="text-[14px] font-semibold text-heading">Managed app configuration</span>
                <textarea placeholder="<dict>…</dict>" className="h-40 w-full rounded-[6px] border border-line p-2.5 font-mono text-[13px] text-ink placeholder:text-placeholder focus-visible:border-uem focus-visible:outline-none" />
                <span className="text-[12px] text-muted">Sent to the app as key-value pairs at install.</span>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </Drawer>
  );
}
