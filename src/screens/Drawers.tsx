import * as React from 'react';
import { Info, Search, Upload } from 'lucide-react';
import { Input } from '../components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { AppIcon, Drawer, SourceBadge, ToggleRow, UButton, UCheckbox } from '../components/uem';
import { cn } from '../components/ui/utils';
import { storeSearchResults, libraryApps, type CatalogApp } from '../data';

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
        <label className="flex h-10 items-center gap-2.5 rounded-[4px] border-2 border-uem px-3">
          <Search className="size-4 text-muted" strokeWidth={1.7} />
          <Input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search App Store" className="h-auto border-0 bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0" />
        </label>
        <p className="mt-4 mb-2 text-[12px] text-muted">{results.length} results</p>
        <div className="overflow-hidden rounded-[6px] border border-line">
          {results.map((r) => {
            const inProfile = existing.includes(r.id);
            const on = inProfile || sel.includes(r.id);
            return (
              <label key={r.id} className={cn('flex items-center gap-3.5 border-b border-row px-4 py-2 last:border-0', sel.includes(r.id) && 'bg-[#f0f7ff]')}>
                <UCheckbox checked={on} disabled={inProfile} onCheckedChange={() => toggle(r.id)} aria-label={r.name} />
                <AppIcon initials={r.initials} color={r.color} size={34} />
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
  const seg = 'h-[38px] flex-1 rounded-[6px] text-[14px] font-medium text-ink data-[state=on]:bg-white data-[state=on]:text-uem data-[state=on]:shadow-[0_1px_2px_rgba(0,0,0,0.12)]';
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
      <div className="border-t border-soft px-6 pt-[18px]">
        <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as typeof mode)} className="flex w-full rounded-[8px] bg-[#f5f5f5] p-0.5">
          <ToggleGroupItem value="library" className={seg}>From library</ToggleGroupItem>
          <ToggleGroupItem value="upload" className={seg}>Upload .ipa</ToggleGroupItem>
          <ToggleGroupItem value="manifest" className={seg}>Manifest URL</ToggleGroupItem>
        </ToggleGroup>

        {mode === 'library' && (
          <>
            <label className="mt-[18px] flex h-10 items-center gap-2.5 rounded-[4px] border border-[#c4c4c4] px-3">
              <Search className="size-4 text-muted" strokeWidth={1.7} />
              <Input placeholder="Search the App Library" className="h-auto border-0 bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0" />
            </label>
            <div className="mt-4 overflow-hidden rounded-[6px] border border-line">
              {libraryApps.map((a) => {
                const here = inProfile.includes(a.id);
                const sibling = !here && a.id === 'crm-beta';
                const checked = here || sel.includes(a.id);
                return (
                  <label key={a.id} className={cn('flex items-center gap-3.5 border-b border-row px-4 py-2.5 last:border-0', sel.includes(a.id) && 'bg-[#f0f7ff]')}>
                    <UCheckbox
                      checked={checked}
                      disabled={here || sibling}
                      onCheckedChange={() => setSel((s) => (s.includes(a.id) ? s.filter((x) => x !== a.id) : [...s, a.id]))}
                      aria-label={a.name}
                    />
                    <AppIcon initials={a.initials} color={a.color} size={36} />
                    <span className="flex grow flex-col">
                      <span className="text-[15px] font-medium text-heading">{a.name}</span>
                      <span className="text-[12px] text-muted">{a.bundleId} · build {a.build}</span>
                    </span>
                    <span className={cn('max-w-[140px] text-right text-[12px]', a.signingWarn ? 'text-[#c2410c]' : 'text-muted')}>
                      {here ? 'In this profile' : sibling ? 'Another channel of this app is in the profile' : a.signingWarn ? 'Signing expires 12 Nov 2026' : ''}
                    </span>
                  </label>
                );
              })}
            </div>
          </>
        )}

        {mode === 'upload' && (
          <>
            <div className="mt-[18px] flex flex-col items-center rounded-[6px] border-2 border-dashed border-[#90caf9] bg-[#f5faff] px-4 py-7 text-center">
              <Upload className="size-6 text-uem" strokeWidth={1.7} />
              <p className="mt-3 mb-0 text-[15px]">
                Drop an .ipa file here, or <a href="#" className="text-uem underline">browse</a>
              </p>
              <p className="mt-2 mb-0 text-[12px] text-muted">Up to 4 GB. Signed for in-house distribution.</p>
            </div>
            <div className="mt-4 rounded-[6px] border border-line px-4 py-3 text-[13px]">
              <p className="m-0 font-semibold">Read from AcmeExpense.ipa</p>
              <p className="mt-1.5 mb-0">com.acme.expense · version 2.0.3 · iOS 16.0 and later</p>
              <p className="mt-1.5 mb-0 text-[#c2410c]">Signing profile expires 12 Nov 2026</p>
            </div>
            <div className="relative mt-5">
              <label className="absolute -top-2 left-2.5 bg-white px-1 text-[12px] text-muted">App name in the library</label>
              <Input defaultValue="Acme Expense" className="h-[42px] rounded-[4px] border-[#c4c4c4] bg-white text-[15px]" />
            </div>
            <p className="mt-2.5 text-[12px] text-muted">The app is saved to the App Library and added to this profile.</p>
          </>
        )}

        {mode === 'manifest' && (
          <>
            <div className="relative mt-5">
              <label className="absolute -top-2 left-2.5 bg-white px-1 text-[12px] text-muted">Manifest URL</label>
              <Input placeholder="https://apps.acme.com/expense/manifest.plist" className="h-[42px] rounded-[4px] border-[#c4c4c4] bg-white text-[15px]" />
            </div>
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

export function AppSettingsDrawer({ app, onOpenChange }: { app: CatalogApp | null; onOpenChange: (o: boolean) => void }) {
  const enterprise = app?.source === 'Enterprise';
  const [state, setState] = React.useState<Record<string, boolean>>({});
  React.useEffect(() => {
    setState(enterprise ? { backup: true, vpn: true } : { removable: true, backup: true });
  }, [app?.id, enterprise]);
  const [builds, setBuilds] = React.useState({ '3.4.1': 'Available', '3.4.0': 'Retired' } as Record<string, string>);
  const tab = 'h-12 flex-none rounded-none border-0 border-b-2 border-transparent bg-transparent px-3.5 text-[14px] font-normal text-ink shadow-none data-[state=active]:border-uem data-[state=active]:font-medium data-[state=active]:text-uem data-[state=active]:shadow-none';
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
          <UButton onClick={() => onOpenChange(false)}>Save settings</UButton>
        </>
      }
    >
      {app && (
        <>
          <div className="px-6">
            <div className="flex items-center gap-3.5">
              <AppIcon initials={app.initials} color={app.color} size={48} />
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
                      <span className="grow text-muted">{s === 'Available' ? 'Devices get this build · signing expires 31 Mar 2027' : 'Restore to roll devices back to this build'}</span>
                      <UButton tone="neutral" size="sm" className="h-[30px]" onClick={() => setBuilds((b) => ({ ...b, [v]: s === 'Available' ? 'Retired' : 'Available' }))}>
                        {s === 'Available' ? 'Retire' : 'Restore'}
                      </UButton>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[12px] text-[#7b341e]">
                  Builds belong to the channel {app.name}. Retiring one affects every profile that uses this channel.
                </p>
              </div>
            ) : (
              <div className="mt-4 flex gap-2 rounded-[4px] bg-[#e3f2fd] px-3.5 py-2.5 text-[13px] text-[#1565c0]">
                <Info className="mt-0.5 size-4 shrink-0" strokeWidth={1.7} />
                United States listing, version 24.10.10. The App Store always installs its latest version. Without VPP the user is asked for an Apple ID.
              </div>
            )}
          </div>
          <Tabs defaultValue="settings" className="mt-4 gap-0">
            <TabsList className="h-auto w-full justify-start rounded-none border-y border-soft bg-transparent px-6 py-0">
              <TabsTrigger value="settings" className={tab}>Settings</TabsTrigger>
              <TabsTrigger value="domains" className={tab}>Domains</TabsTrigger>
              <TabsTrigger value="config" className={tab}>Config</TabsTrigger>
            </TabsList>
            <TabsContent value="settings" className="px-6 pt-2">
              {toggleDefs.map(([k, t, h]) => (
                <ToggleRow key={k} title={t} hint={h} checked={!!state[k]} onChange={(v) => setState((s) => ({ ...s, [k]: v }))} />
              ))}
            </TabsContent>
            <TabsContent value="domains" className="px-6 pt-4 text-[14px] text-muted">
              Associated domains let the app open links and use credentials for these domains.
              <Input placeholder="Add domain, e.g. acme.com" className="mt-3 h-10 rounded-[4px] border-[#c4c4c4] bg-white" />
            </TabsContent>
            <TabsContent value="config" className="px-6 pt-4 text-[14px] text-muted">
              Managed app configuration is sent to the app as key-value pairs.
              <textarea placeholder="<dict>…</dict>" className="mt-3 h-40 w-full rounded-[4px] border border-[#c4c4c4] p-3 font-mono text-[13px]" />
            </TabsContent>
          </Tabs>
        </>
      )}
    </Drawer>
  );
}
