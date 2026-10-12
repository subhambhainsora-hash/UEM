import * as React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronDown, ChevronRight, Copy, Link2, ListChecks, MoreVertical, RefreshCw, Search, Trash2, Upload, X } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Input } from '../components/ui/input';
import { AppIcon, CountBadge, IconButton, SigningBadge, UButton, UMenu, UMenuItem, UMenuSeparator } from '../components/uem';
import { cn } from '../components/ui/utils';
import { libraryApps as seed, plural, signingState, todayLabel, type Build, type LibraryApp, type ReadBuild } from '../data';
import { UndoRow, tabListClass, tabTriggerClass } from '../components/ds';
import { useToast } from '../components/toast';
import { AddInhouseDrawer } from './Drawers';
import { LicenseAssignmentsDrawer } from './VppDrawers';
import { failedCount, vppApps as vppSeed, type Assignment, type VppApp } from '../vpp';

type Filter = 'all' | 'attention';

/* L1 · App Groups: the in-house app library */
export function AppLibraryPage({ initialTab = 'inhouse' }: { initialTab?: 'inhouse' | 'vpp' }) {
  const toast = useToast();
  const [apps, setApps] = React.useState<LibraryApp[]>(seed);
  const [openRow, setOpenRow] = React.useState<string | null>('crm');
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState<Filter>('all');
  /* One inline confirm at a time: retiring a build, or removing an app. 'last' is the blocker for the only available build. */
  const [confirm, setConfirm] = React.useState<{ app: string; kind: 'retire' | 'last' | 'remove'; version?: string } | null>(null);
  const [drawer, setDrawer] = React.useState<{ mode: 'upload' | 'manifest'; forApp?: LibraryApp } | null>(null);
  const [undo, setUndo] = React.useState<{ app: LibraryApp; index: number } | null>(null);
  /* VPP licences: what Apple Business Manager exposes through the connected token. */
  const [vpp, setVpp] = React.useState<VppApp[]>(vppSeed);
  const [vq, setVq] = React.useState('');
  const [vFailedOnly, setVFailedOnly] = React.useState(false);
  const [assignFor, setAssignFor] = React.useState<VppApp | null>(null);
  const [syncing, setSyncing] = React.useState(false);
  const [syncedAgo, setSyncedAgo] = React.useState('2 hours ago');
  const [tokenState] = React.useState<'ok' | 'expired'>('ok');
  const vRows = vpp.filter((a) => (!vFailedOnly || failedCount(a) > 0) && (a.name + a.bundleId).toLowerCase().includes(vq.trim().toLowerCase()));
  const failedApps = vpp.filter((a) => failedCount(a) > 0);
  const failedTotal = vpp.reduce((n, a) => n + failedCount(a), 0);
  const sync = () => { setSyncing(true); window.setTimeout(() => { setSyncing(false); setSyncedAgo('just now'); toast({ title: 'Synced with Apple Business Manager', sub: `${vpp.length} licensed apps, counts refreshed.` }); }, 1200); };
  const retry = (a: VppApp, x: Assignment) => {
    setVpp((v) => v.map((y) => (y.id === a.id ? { ...y, assignments: y.assignments.map((z) => (z === x ? { ...z, status: 'Pending' as const, reason: undefined } : z)) } : y)));
    setAssignFor((cur) => (cur && cur.id === a.id ? { ...cur, assignments: cur.assignments.map((z) => (z === x ? { ...z, status: 'Pending' as const, reason: undefined } : z)) } : cur));
    toast({ title: `Retrying ${a.name} on ${x.device}`, sub: a.available === 0 ? 'It will fail again until licences are available.' : 'The licence is assigned at the device’s next check-in.', tone: 'info' });
  };
  const searchRef = React.useRef<HTMLInputElement>(null);

  const needsAttention = (a: LibraryApp) => ['expired', 'expiring'].includes(signingState(a.signingExpires).kind);
  const attention = apps.filter(needsAttention);
  const expired = apps.filter((a) => signingState(a.signingExpires).kind === 'expired');
  const expiring = apps.filter((a) => signingState(a.signingExpires).kind === 'expiring');
  const rows = apps.filter((a) => (filter === 'all' || needsAttention(a)) && (a.name + a.bundleId).toLowerCase().includes(q.trim().toLowerCase()));

  const patch = (id: string, fn: (a: LibraryApp) => LibraryApp) => setApps((x) => x.map((a) => (a.id === id ? fn(a) : a)));
  const setStatus = (appId: string, version: string, status: Build['status']) =>
    patch(appId, (a) => ({ ...a, builds: a.builds.map((b) => (b.version === version ? { ...b, status } : b)) }));
  const askRetire = (a: LibraryApp, version: string) => {
    if (a.builds.filter((b) => b.status === 'Available').length <= 1) { setConfirm({ app: a.id, kind: 'last', version }); return; }
    setConfirm({ app: a.id, kind: 'retire', version });
  };
  const retire = (a: LibraryApp, version: string) => {
    const fallback = a.builds.find((b) => b.status === 'Available' && b.version !== version)?.version ?? '';
    setStatus(a.id, version, 'Retired'); setConfirm(null);
    toast({ title: `${version} retired`, sub: a.usedBy.devices ? `${plural(a.usedBy.devices, 'device')} roll back to ${fallback} at next check-in.` : 'No device is affected.', action: { label: 'Undo', onClick: () => setStatus(a.id, version, 'Available') } });
  };
  const restore = (a: LibraryApp, version: string) => {
    setStatus(a.id, version, 'Available');
    toast({ title: `${version} restored`, sub: a.usedBy.devices ? `${plural(a.usedBy.devices, 'device')} in ${plural(a.usedBy.profiles, 'profile')} get it at next check-in.` : 'No profile uses this app, so no device changes.' });
  };
  const copyBundle = (a: LibraryApp) => { navigator.clipboard?.writeText(a.bundleId)?.catch(() => {}); toast({ title: 'Bundle ID copied', sub: a.bundleId, tone: 'info' }); };
  const addBuild = (a: LibraryApp, b: ReadBuild) => {
    patch(a.id, (x) => ({ ...x, build: b.version, signingExpires: b.signingExpires, builds: [{ version: b.version, status: 'Available', uploaded: todayLabel }, ...x.builds] }));
    setOpenRow(a.id);
    toast({ title: `${b.version} added to ${a.name}`, sub: a.usedBy.devices ? `${plural(a.usedBy.devices, 'device')} install it at next check-in.` : 'Add the app to a profile to install it.' });
  };
  const addApp = (b: ReadBuild, source: 'ipa' | 'manifest') => {
    const id = b.bundleId.split('.').pop() + '-' + Date.now();
    const app: LibraryApp = { id, name: b.appName, bundleId: b.bundleId, initials: b.appName.slice(0, 2).toUpperCase(), color: '#455a64', build: b.version, delivery: source === 'ipa' ? 'Hosted .ipa' : 'Manifest URL', signingExpires: b.signingExpires, usedBy: { profiles: 0, devices: 0 }, builds: [{ version: b.version, status: 'Available', uploaded: todayLabel }] };
    setApps((x) => [app, ...x]); setOpenRow(id); setQ(''); setFilter('all');
    toast({ title: `${b.appName} ${b.version} added to App Groups`, sub: 'Add it to devices from a profile’s App Catalog.', action: { label: 'Open Sales Baseline', onClick: () => { window.location.hash = '#/d4'; } } });
  };
  const removeApp = (a: LibraryApp) => {
    setUndo({ app: a, index: apps.findIndex((y) => y.id === a.id) });
    setApps((x) => x.filter((y) => y.id !== a.id)); setConfirm(null);
  };
  const undoRemove = () => {
    if (!undo) return;
    setApps((x) => { const l = [...x]; l.splice(Math.min(undo.index, l.length), 0, undo.app); return l; });
    setUndo(null);
  };

  const th = 'px-4 py-3 text-left text-[14px] font-semibold';
  const chip = (on: boolean) => cn('h-8 rounded-full border px-3 text-[13px] font-medium', on ? 'border-uem bg-uem-soft text-uem' : 'border-line bg-white text-ink hover:bg-[#f3f3f5]');

  return (
    <AppShell page="library">
      <div className="flex min-h-0 grow flex-col overflow-y-auto px-[50px] pt-8 pb-4">
        <h1 className="m-0 text-[24px] leading-8 font-bold text-heading">App Groups</h1>
        <p className="mt-1.5 mb-0 text-[15px] text-muted">
          In-house apps and Apps and Books licences your Apple profiles can install. Manage builds and licences here; add apps to devices from a profile's App Catalog.
        </p>
        <Tabs defaultValue={initialTab} className="mt-4 gap-0">
          <TabsList className={tabListClass}>
            <TabsTrigger value="inhouse" className={tabTriggerClass}>In-house apps <CountBadge n={apps.length} />{attention.length > 0 && <AlertTriangle aria-label={`${attention.length} need attention`} className="size-3.5 text-[#b45309]" strokeWidth={1.7} />}</TabsTrigger>
            <TabsTrigger value="vpp" className={tabTriggerClass}>VPP licences <CountBadge n={vpp.length} />{failedTotal > 0 && <AlertTriangle aria-label={`${failedTotal} failed assignments`} className="size-3.5 text-bad" strokeWidth={1.7} />}</TabsTrigger>
          </TabsList>
          <TabsContent value="inhouse">
        {attention.length > 0 && (
          <div role="status" className="mt-4 flex items-start gap-2.5 rounded-[4px] border border-[#f5d8b8] bg-[#fff3e0] px-3.5 py-2.5 text-[14px] text-[#7b341e]">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={1.7} />
            <span className="grow">
              {expired.length > 0 && <><b className="font-semibold">{plural(expired.length, 'app')} can't install</b> because the signing profile has expired: {expired.map((a) => a.name).join(', ')}. Devices keep the installed copy, but new devices get nothing. </>}
              {expiring.length > 0 && <>{plural(expiring.length, 'app')} expires within 60 days: {expiring.map((a) => `${a.name} (${signingState(a.signingExpires).label})`).join(', ')}. Upload a re-signed build before then.</>}
            </span>
            <button type="button" onClick={() => { setFilter('attention'); setQ(''); }} className="shrink-0 border-0 bg-transparent p-0 text-[13px] font-semibold text-[#7b341e] underline">Show {attention.length}</button>
          </div>
        )}
            <div className="mt-5 flex items-center gap-3">
              <label className="flex h-10 w-[340px] items-center gap-2.5 rounded-[6px] border border-line px-3 focus-within:border-uem">
                <Search className="size-4 text-muted" strokeWidth={1.7} />
                <Input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && setQ('')} placeholder="Search by name or bundle ID" aria-label="Search apps" className="h-auto border-0 bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0" />
                {q && <button type="button" aria-label="Clear search" onClick={() => { setQ(''); searchRef.current?.focus(); }} className="flex border-0 bg-transparent p-0 text-muted hover:text-ink"><X className="size-4" strokeWidth={1.7} /></button>}
              </label>
              {attention.length > 0 && (
                <div role="group" aria-label="Filter" className="flex gap-1.5">
                  <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')} className={chip(filter === 'all')}>All · {apps.length}</button>
                  <button type="button" aria-pressed={filter === 'attention'} onClick={() => setFilter('attention')} className={chip(filter === 'attention')}>Needs attention · {attention.length}</button>
                </div>
              )}
              <span className="grow" />
              <UButton tone="outline" size="lg" onClick={() => setDrawer({ mode: 'manifest' })}><Link2 strokeWidth={1.7} />Add by manifest URL</UButton>
              <UButton size="lg" onClick={() => setDrawer({ mode: 'upload' })}><Upload strokeWidth={1.7} />Upload .ipa</UButton>
            </div>
            <div className="mt-4 overflow-hidden rounded-[6px] border border-line">
              <table className="w-full border-collapse font-sans">
                <thead className="bg-[#fafafa]">
                  <tr>
                    <th className={cn(th, 'pl-[56px]')}>App</th><th className={th}>Bundle ID</th><th className={th}>Latest build</th>
                    <th className={th}>Delivery</th><th className={th}>Signing expires</th><th className={th}>Used by</th><th className="w-12"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-10 text-center text-[14px] text-muted">
                      {q ? <>No apps match “{q}”. <button type="button" onClick={() => setQ('')} className="border-0 bg-transparent p-0 font-semibold text-uem hover:underline">Clear search</button></> : filter === 'attention' ? 'Every signing profile is valid for more than 60 days.' : 'No in-house apps yet. Upload an .ipa or add one by manifest URL.'}
                    </td></tr>
                  )}
                  {rows.map((a) => {
                    const open = openRow === a.id;
                    const list = a.builds;
                    const latest = list.find((b) => b.status === 'Available')?.version ?? 'none';
                    const used = a.usedBy.profiles > 0;
                    return (
                      <React.Fragment key={a.id}>
                        <tr className={cn('border-t border-row text-[14px] transition-colors hover:bg-[#fafafa]', open && 'bg-[#f0f7ff] hover:bg-[#f0f7ff]')}>
                          <td className="px-4 py-3">
                            <button type="button" aria-expanded={open} aria-controls={`builds-${a.id}`} onClick={() => setOpenRow(open ? null : a.id)} className="flex items-center gap-3 border-0 bg-transparent p-0 text-left text-ink">
                              <span className="flex size-4 items-center justify-center">{open ? <ChevronDown className="size-4" strokeWidth={1.7} /> : <ChevronRight className="size-4" strokeWidth={1.7} />}</span>
                              <AppIcon logo={a.logo} name={a.name} color={a.color} size={32} />
                              <span className="text-[15px] font-semibold">{a.name}</span>
                            </button>
                          </td>
                          <td className="px-4 text-muted">{a.bundleId}</td>
                          <td className="px-4">{latest}</td>
                          <td className="px-4"><span className="rounded-[10px] bg-[#f5f5f5] px-2 py-0.5 text-[12px]">{a.delivery}</span></td>
                          <td className="px-4"><SigningBadge expires={a.signingExpires} /></td>
                          <td className="px-4">
                            {used ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button type="button" className="border-0 bg-transparent p-0 text-[14px] text-uem underline hover:no-underline">{plural(a.usedBy.profiles, 'profile')}</button>
                                </PopoverTrigger>
                                <PopoverContent align="start" sideOffset={6} className="w-[280px] rounded-[8px] border-line p-1 font-sans shadow-[0_4px_8px_-2px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]">
                                  <p className="m-0 px-2.5 pt-1.5 pb-1 text-[12px] font-semibold tracking-wide text-muted uppercase">Installs {a.name}</p>
                                  {(a.usedBy.in ?? []).map((p) => (
                                    <Link key={p.name} to="/d4" className="flex items-center justify-between rounded-[6px] px-2.5 py-2 text-[14px] text-ink no-underline hover:bg-[#f3f3f5]">
                                      <span className="font-medium">{p.name}</span><span className="text-[12px] text-muted">{plural(p.devices, 'device')}</span>
                                    </Link>
                                  ))}
                                </PopoverContent>
                              </Popover>
                            ) : <span className="text-muted">Not used</span>}
                            {used && <span className="ml-1.5 text-[12px] text-muted">· {plural(a.usedBy.devices, 'device')}</span>}
                          </td>
                          <td className="px-2">
                            <UMenu trigger={<IconButton label={`More actions for ${a.name}`}><MoreVertical className="size-4" strokeWidth={1.7} /></IconButton>}>
                              <UMenuItem icon={Upload} onSelect={() => setDrawer({ mode: 'upload', forApp: a })}>Add build</UMenuItem>
                              <UMenuItem icon={Copy} onSelect={() => copyBundle(a)}>Copy bundle ID</UMenuItem>
                              <UMenuSeparator />
                              <UMenuItem icon={Trash2} danger disabled={used} hint={used ? `Remove it from ${plural(a.usedBy.profiles, 'profile')} first` : undefined} onSelect={() => { setOpenRow(a.id); setConfirm({ app: a.id, kind: 'remove' }); }}>Remove from App Groups</UMenuItem>
                            </UMenu>
                          </td>
                        </tr>
                        {confirm?.app === a.id && confirm.kind === 'remove' && (
                          <tr className="bg-[#fafafa]">
                            <td colSpan={7} className="px-4 pb-3 pl-[60px]">
                              <div role="alert" className="flex flex-col gap-2 text-[13px] text-muted">
                                <span className="min-w-0">Remove {a.name} from App Groups? No profile uses it, so no device is affected. {plural(a.builds.length, 'build')} and the signing details go with it; upload the .ipa again to bring it back.</span>
                                <span className="flex flex-wrap gap-2">
                                  <UButton tone="danger" size="sm" onClick={() => removeApp(a)}><Trash2 strokeWidth={1.7} />Remove app</UButton>
                                  <UButton tone="neutral" size="sm" autoFocus onClick={() => setConfirm(null)}>Cancel</UButton>
                                </span>
                              </div>
                            </td>
                          </tr>
                        )}
                        {open && (
                          <tr className="bg-white" id={`builds-${a.id}`}>
                            <td colSpan={7} className="pt-3 pr-4 pb-4 pl-[60px]">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-[14px] font-semibold">Builds</span>
                                <UButton tone="outline" size="sm" onClick={() => setDrawer({ mode: 'upload', forApp: a })}><Upload strokeWidth={1.7} />Add build</UButton>
                              </div>
                              <div className="overflow-hidden rounded-[6px] border border-line">
                                {list.map((b) => {
                                  const only = b.status === 'Available' && list.filter((x) => x.status === 'Available').length === 1;
                                  const asking = confirm?.app === a.id && confirm.version === b.version && confirm.kind !== 'remove';
                                  const fallback = list.find((x) => x.status === 'Available' && x.version !== b.version)?.version ?? '';
                                  return (
                                    <div key={b.version} className={cn('flex flex-col border-b border-row px-3.5 py-2 text-[13px] last:border-0', asking && 'bg-[#fafafa]')}>
                                      <div className="flex items-center gap-6">
                                        <span className="w-12 font-semibold">{b.version}</span>
                                        <span className={cn('rounded-[10px] px-2 py-px', b.status === 'Available' ? 'bg-[#e8f5e9] text-ok' : 'bg-[#f5f5f5] text-muted')}>{b.status}</span>
                                        <span className="grow text-muted">
                                          {b.status === 'Available' ? `Devices get this build · uploaded ${b.uploaded}` : 'Restore to roll devices back to this build'}
                                          {only && <span className="ml-2 text-[#7b341e]">· only available build</span>}
                                        </span>
                                        <UButton tone="outline" size="sm" onClick={() => (asking ? setConfirm(null) : b.status === 'Available' ? askRetire(a, b.version) : restore(a, b.version))}>
                                          {b.status === 'Available' ? 'Retire' : 'Restore'}
                                        </UButton>
                                      </div>
                                      {asking && confirm.kind === 'retire' && (
                                        <div role="alert" className="mt-2 flex flex-col gap-2 text-muted">
                                          <span className="min-w-0">Retire {b.version}? {used ? `${plural(a.usedBy.profiles, 'profile')} and ${plural(a.usedBy.devices, 'device')} roll back to ${fallback} at next check-in.` : 'No profile uses this app, so no device is affected.'} You can restore it at any time.</span>
                                          <span className="flex flex-wrap gap-2">
                                            <UButton tone="danger" size="sm" onClick={() => retire(a, b.version)}>Retire build</UButton>
                                            <UButton tone="neutral" size="sm" autoFocus onClick={() => setConfirm(null)}>Keep {b.version}</UButton>
                                          </span>
                                        </div>
                                      )}
                                      {asking && confirm.kind === 'last' && (
                                        <div role="alert" className="mt-2 flex flex-col gap-2 text-muted">
                                          <span className="flex min-w-0 items-start gap-2"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#7b341e]" strokeWidth={1.7} /><span><b className="font-semibold text-ink">Can’t retire the only available build.</b> Every profile that uses {a.name} would have nothing to deliver. Restore an older build or add a new one first.</span></span>
                                          <span className="flex flex-wrap gap-2">
                                            <UButton tone="outline" size="sm" onClick={() => { setConfirm(null); setDrawer({ mode: 'upload', forApp: a }); }}><Upload strokeWidth={1.7} />Add build</UButton>
                                            <UButton tone="neutral" size="sm" autoFocus onClick={() => setConfirm(null)}>OK</UButton>
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <p className="mt-2 mb-0 text-[13px] text-[#7b341e]">
                                {used
                                  ? `Retiring or restoring a build changes what ${plural(a.usedBy.devices, 'device')} in ${plural(a.usedBy.profiles, 'profile')} get at next check-in.`
                                  : 'No profile uses this app yet, so build changes don’t reach any device.'}
                              </p>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {undo && <div className="mt-3"><UndoRow onUndo={undoRemove}>Removed: <span className="text-ink">{undo.app.name}</span> and its {plural(undo.app.builds.length, 'build')}. No device was affected.</UndoRow></div>}
            <p className="mt-3 text-[13px] text-muted" aria-live="polite">Showing {rows.length} of {apps.length} apps{filter === 'attention' ? ' that need attention' : ''}</p>
          </TabsContent>
          <TabsContent value="vpp">
            <div className="mt-5 flex flex-col gap-4">
              {tokenState === 'expired' && <div role="alert" className="flex items-center gap-2.5 rounded-[4px] border border-[#f5c6c2] bg-[#fdecea] px-3.5 py-2.5 text-[14px] text-bad"><AlertTriangle className="size-4 shrink-0" strokeWidth={1.7} /><span className="grow">Your VPP token is expired. New licences can't be assigned.</span><Link to="/v3" className="font-semibold text-bad underline">Open VPP Token</Link></div>}
              {failedTotal > 0 && (
                <div role="status" className="flex items-center gap-2.5 rounded-[4px] border border-[#f5d8b8] bg-[#fff3e0] px-3.5 py-2.5 text-[14px] text-[#7b341e]">
                  <AlertTriangle className="size-4 shrink-0" strokeWidth={1.7} />
                  <span className="grow"><b className="font-semibold">{plural(failedTotal, 'licence assignment')} failed</b> across {plural(failedApps.length, 'app')}: {failedApps.map((a) => a.name).join(', ')}. Usually the licence pool is empty; buy more in Apple Business Manager, then retry.</span>
                  <button type="button" onClick={() => setVFailedOnly(true)} className="shrink-0 border-0 bg-transparent p-0 text-[13px] font-semibold text-[#7b341e] underline">Show failed</button>
                </div>
              )}
              <p className="m-0 text-[14px] text-muted">Apps and licences purchased in Apple Business Manager. Assign them to devices from an Apple profile › App Catalog › VPP.</p>
              <div className="flex items-center gap-3">
                <label className="flex h-10 w-[340px] items-center gap-2.5 rounded-[6px] border border-line px-3 focus-within:border-uem">
                  <Search className="size-4 text-muted" strokeWidth={1.7} />
                  <Input value={vq} onChange={(e) => setVq(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && setVq('')} placeholder="Search by name or bundle ID" aria-label="Search VPP apps" className="h-auto border-0 bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0" />
                  {vq && <button type="button" aria-label="Clear search" onClick={() => setVq('')} className="flex border-0 bg-transparent p-0 text-muted hover:text-ink"><X className="size-4" strokeWidth={1.7} /></button>}
                </label>
                {failedTotal > 0 && (
                  <div role="group" aria-label="Filter" className="flex gap-1.5">
                    <button type="button" aria-pressed={!vFailedOnly} onClick={() => setVFailedOnly(false)} className={chip(!vFailedOnly)}>All · {vpp.length}</button>
                    <button type="button" aria-pressed={vFailedOnly} onClick={() => setVFailedOnly(true)} className={chip(vFailedOnly)}>Failed assignments · {failedApps.length}</button>
                  </div>
                )}
                <span className="grow" />
                <span className="text-[13px] text-muted">Last synced {syncedAgo}</span>
                <UButton tone="outline" size="lg" disabled={syncing} onClick={sync}><RefreshCw className={cn(syncing && 'animate-spin')} strokeWidth={1.7} />{syncing ? 'Syncing…' : 'Sync'}</UButton>
              </div>
              <div className="overflow-hidden rounded-[6px] border border-line">
                <table className="w-full border-collapse font-sans">
                  <thead className="bg-[#fafafa]"><tr><th className={th}>App</th><th className={th}>Platform</th><th className={th}>Licences</th><th className={th}>Assignments</th><th className="w-12"><span className="sr-only">Actions</span></th></tr></thead>
                  <tbody>
                    {vRows.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-[14px] text-muted">{vq ? <>No apps match “{vq}”. <button type="button" onClick={() => setVq('')} className="border-0 bg-transparent p-0 font-semibold text-uem hover:underline">Clear search</button></> : 'No failed assignments.'}</td></tr>}
                    {vRows.map((a) => {
                      const failed = failedCount(a);
                      const installed = a.assignments.filter((x) => x.status === 'Installed').length;
                      return (
                        <tr key={a.id} className="border-t border-row text-[14px] transition-colors hover:bg-[#fafafa]">
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-3">
                              <AppIcon logo={a.logo} name={a.name} color={a.color} size={32} />
                              <span className="flex min-w-0 flex-col"><span className="text-[15px] font-semibold">{a.name}</span><span className={cn('text-[12px] text-muted', a.metadataMissing && 'italic')}>{a.bundleId}</span></span>
                            </span>
                          </td>
                          <td className="px-4">{a.platforms.join(', ')}</td>
                          <td className="px-4">
                            {a.total === null ? 'Unlimited' : <><b className={cn('font-semibold', a.available === 0 && 'text-[#7b341e]')}>{a.available}</b> <span className="text-muted">of {a.total} available</span></>}
                            {a.available === 0 && <span className="mt-0.5 block text-[12px] text-[#7b341e]">Pool empty · new devices won't get it</span>}
                            {a.userLicenseOnly && <span className="mt-0.5 block text-[12px] text-muted">User licences only</span>}
                          </td>
                          <td className="px-4">
                            {a.assignments.length === 0 ? <span className="text-muted">None yet</span> : <span>{plural(installed, 'install')}{failed > 0 && <span className="ml-1.5 inline-flex items-center gap-1 rounded-[8px] bg-[#fdecea] px-2 py-px text-[12px] font-medium text-bad"><AlertTriangle className="size-3" strokeWidth={2} />{failed} failed</span>}</span>}
                          </td>
                          <td className="px-2">
                            <UMenu trigger={<IconButton label={`More actions for ${a.name}`}><MoreVertical className="size-4" strokeWidth={1.7} /></IconButton>}>
                              <UMenuItem icon={ListChecks} onSelect={() => setAssignFor(a)}>View licence assignments</UMenuItem>
                              <UMenuItem icon={Copy} onSelect={() => { navigator.clipboard?.writeText(a.bundleId)?.catch(() => {}); toast({ title: 'Bundle ID copied', sub: a.bundleId, tone: 'info' }); }} disabled={a.metadataMissing}>Copy bundle ID</UMenuItem>
                            </UMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="m-0 text-[13px] text-muted" aria-live="polite">Showing {vRows.length} of {vpp.length} licensed apps{vFailedOnly ? ' with failed assignments' : ''}</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <LicenseAssignmentsDrawer app={assignFor} onOpenChange={(o) => !o && setAssignFor(null)} onRetry={retry} initialFilter={vFailedOnly ? 'Failed' : 'all'} />
      <AddInhouseDrawer
        open={!!drawer}
        onOpenChange={(o) => !o && setDrawer(null)}
        context="library"
        initialMode={drawer?.mode ?? 'upload'}
        forApp={drawer?.forApp}
        onUpload={(b, src) => (drawer?.forApp ? addBuild(drawer.forApp, b) : addApp(b, src))}
      />
    </AppShell>
  );
}
