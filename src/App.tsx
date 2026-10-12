import * as React from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Copy as CopyIcon, Download, LayoutGrid, MoreVertical, PencilLine, Plus, Search, Send, Trash2, X } from 'lucide-react';
import { ToastProvider, useToast } from './components/toast';
import { ProfilePage, type ProfileState } from './screens/ProfilePage';
import { CreateProfilePage } from './screens/CreateProfile';
import { AppLibraryPage } from './screens/AppLibrary';
import { VppTokenPage } from './screens/VppToken';
import type { TokenState } from './vpp';
import { AppShell } from './components/AppShell';
import { PageTitle, UndoRow } from './components/ds';
import { IconButton, UButton, UMenu, UMenuItem, UMenuSeparator } from './components/uem';
import { Input } from './components/ui/input';
import { cn } from './components/ui/utils';
import { profile, plural } from './data';

const screens: { id: string; label: string; state?: ProfileState; library?: boolean; libraryTab?: 'inhouse' | 'vpp'; token?: TokenState }[] = [
  { id: 'd1', label: 'App Store tab', state: {} },
  { id: 'd2', label: 'Add App Store apps drawer', state: { drawer: 'store' } },
  { id: 'd3', label: 'Configure drawer', state: { drawer: 'settings' } },
  { id: 'd4', label: 'Enterprise tab', state: { tab: 'enterprise' } },
  { id: 'd5', label: 'Add in-house apps · from library', state: { tab: 'enterprise', drawer: 'library' } },
  { id: 'd6', label: 'Add in-house apps · upload .ipa', state: { tab: 'enterprise', drawer: 'upload' } },
  { id: 'd7', label: 'VPP tab (later)', state: { tab: 'vpp' } },
  { id: 'd8', label: 'App Store tab · 1366 × 768', state: {} },
  { id: 'd9', label: 'Change App Store country', state: { dialog: 'country' } },
  { id: 'l1', label: 'Applications (App Library)', library: true },
  { id: 's1', label: 'Settings drawer · App Store app', state: { drawer: 'settings' } },
  { id: 's2', label: 'Settings drawer · in-house app', state: { tab: 'enterprise', drawer: 'settings-enterprise' } },
  { id: 'k1', label: 'Kiosk · Single App', state: { section: 'Kiosk', kiosk: 'single', kioskPicker: true } },
  { id: 'k2', label: 'Kiosk · Multi App', state: { section: 'Kiosk', kiosk: 'multi' } },
  { id: 'k3', label: 'Extensible SSO', state: { section: 'Extensible SSO' } },
  { id: 'k4', label: 'Remove an app Kiosk or SSO uses', state: { tab: 'enterprise', dialog: 'remove' } },
  { id: 'p1', label: 'Email configuration', state: { section: 'Email' } },
  { id: 'p2', label: 'Web Shortcuts', state: { section: 'Web Shortcuts' } },
  { id: 'p3', label: 'Web Content Filter', state: { section: 'Web Content Filter' } },
  { id: 'v1', label: 'VPP token · not connected', token: 'none' },
  { id: 'v2', label: 'VPP token · connected', token: 'connected' },
  { id: 'v3', label: 'VPP token · expiring / revoked / expired', token: 'expiring' },
  { id: 'v4', label: 'App Catalog · VPP tab', state: { tab: 'vpp' } },
  { id: 'v5', label: 'App Catalog · VPP tab, no token', state: { tab: 'vpp', vppToken: 'none' } },
  { id: 'v6', label: 'Add VPP apps drawer', state: { tab: 'vpp', drawer: 'vpp' } },
  { id: 'v7', label: 'App Groups · VPP licences', library: true, libraryTab: 'vpp' },
  { id: 'r1', label: 'Restriction · Device Functionality', state: { section: 'Restriction' } },
  { id: 'r2', label: 'Restriction · Security', state: { section: 'Restriction', restrictionTab: 'Security' } },
  { id: 'r3', label: 'Restriction · Apps', state: { section: 'Restriction', restrictionTab: 'Apps' } },
  { id: 'r4', label: 'Restriction · Date & Time', state: { section: 'Restriction', restrictionTab: 'Date & Time' } },
  { id: 'pc1', label: 'Passcode · empty', state: { section: 'Passcode' } },
  { id: 'pc2', label: 'Passcode · add restriction', state: { section: 'Passcode', passcode: 'form' } },
  { id: 'pc3', label: 'Passcode · list', state: { section: 'Passcode', passcode: 'list' } },
  { id: 'w1', label: 'Wifi · empty', state: { section: 'Wifi' } },
  { id: 'w2', label: 'Wifi · add network', state: { section: 'Wifi', wifi: 'form' } },
  { id: 'w3', label: 'Wifi · list', state: { section: 'Wifi', wifi: 'list' } },
  { id: 'n1', label: 'Per-App VPN', state: { section: 'Per-App VPN', vpn: 'miniorange' } },
  { id: 'r5', label: 'Restriction · loading', state: { section: 'Restriction', load: 'loading' } },
  { id: 'r6', label: 'Restriction · load failed', state: { section: 'Restriction', load: 'failed' } },
  { id: 'pc4', label: 'Passcode · loading', state: { section: 'Passcode', passcode: 'list', load: 'loading' } },
  { id: 'w4', label: 'Wifi · load failed', state: { section: 'Wifi', wifi: 'list', load: 'failed' } },
];

/* Profiles list · the page the sidebar's "Profiles" item opens --------------- */
interface ProfileRow { id: string; name: string; platform: 'iOS' | 'iPadOS'; devices: number; apps: number; groups: string[]; created: string; createdBy: string; updated: string; by: string; status: 'Published' | 'Draft' }
const seedProfiles: ProfileRow[] = [
  { id: 'sales', name: profile.name, platform: 'iOS', devices: profile.deviceCount, apps: 5, groups: ['Field Sales'], created: '14 Aug 2026', createdBy: 'Abhijeet T.', updated: '12 Oct 2026', by: 'Abhijeet T.', status: 'Published' },
  { id: 'kiosk', name: 'Warehouse Kiosk', platform: 'iOS', devices: 36, apps: 2, groups: ['Warehouse Kiosks'], created: '2 Jun 2026', createdBy: 'Vedika S.', updated: '3 Oct 2026', by: 'Vedika S.', status: 'Published' },
  { id: 'exec', name: 'Exec iPads', platform: 'iPadOS', devices: 12, apps: 7, groups: [], created: '28 Sep 2026', createdBy: 'Abhijeet T.', updated: '28 Sep 2026', by: 'Abhijeet T.', status: 'Draft' },
];

function StatusChip({ status }: { status: ProfileRow['status'] }) {
  return status === 'Published' ? (
    <span className="inline-flex items-center gap-1 rounded-[8px] bg-[#e3fcef] px-2.5 py-0.5 text-[12px] font-medium text-[#006644]"><CheckCircle2 className="size-3.5" strokeWidth={2} />Published</span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-[8px] bg-chip px-2.5 py-0.5 text-[12px] font-medium text-[#262626]"><PencilLine className="size-3.5" strokeWidth={1.7} />Draft</span>
  );
}

function ProfilesPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = React.useState<ProfileRow[]>(seedProfiles);
  const [q, setQ] = React.useState('');
  /* One inline confirm at a time, under the row that owns the action. */
  const [confirm, setConfirm] = React.useState<{ id: string; kind: 'publish' | 'delete' } | null>(null);
  const [undo, setUndo] = React.useState<{ row: ProfileRow; index: number } | null>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const shown = rows.filter((p) => (p.name + ' ' + p.platform + ' ' + p.status).toLowerCase().includes(q.trim().toLowerCase()));
  const th = 'px-4 py-3 text-left text-[14px] font-semibold text-heading';

  const duplicate = (p: ProfileRow) => {
    const copy: ProfileRow = { ...p, id: `${p.id}-${Date.now()}`, name: `${p.name} copy`, devices: 0, groups: [], status: 'Draft', created: '12 Oct 2026', createdBy: 'Abhijeet T.', updated: '12 Oct 2026', by: 'Abhijeet T.' };
    setRows((r) => [copy, ...r]);
    toast({ title: `${copy.name} created as a draft`, sub: 'Same apps and settings, no devices assigned yet.', action: { label: 'Open it', onClick: () => navigate('/d1') } });
  };
  const publish = (p: ProfileRow) => {
    setRows((r) => r.map((x) => (x.id === p.id ? { ...x, status: 'Published', updated: '12 Oct 2026', by: 'Abhijeet T.' } : x)));
    setConfirm(null);
    toast({ title: `${p.name} published`, sub: p.devices ? `${plural(p.devices, 'device')} receive it at next check-in.` : 'Assign a device group to roll it out.' });
  };
  const remove = (p: ProfileRow) => {
    setUndo({ row: p, index: rows.findIndex((x) => x.id === p.id) });
    setRows((r) => r.filter((x) => x.id !== p.id));
    setConfirm(null);
  };
  const undoRemove = () => {
    if (!undo) return;
    setRows((r) => { const l = [...r]; l.splice(Math.min(undo.index, l.length), 0, undo.row); return l; });
    setUndo(null);
  };
  /* The profile as a document an auditor can read. */
  const exportProfile = (p: ProfileRow) => {
    const lines = [p.name, `Exported ${new Date().toLocaleString()}`, '', `Platform: ${p.platform}`, `Status: ${p.status}`, `Devices: ${p.devices}`, `Apps: ${p.apps}`, `Last updated: ${p.updated} by ${p.by}`, '', `Device groups: ${p.groups.join(', ') || 'none'}`, `Created: ${p.created} by ${p.createdBy}`, '', 'Sections: App Catalog, Restriction, Passcode, Per-App VPN, Wifi, Email, Web Shortcuts, Web Content Filter, Kiosk, Extensible SSO'];
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `${p.name.replace(/\s+/g, '-').toLowerCase()}-profile.txt`; document.body.appendChild(a); a.click();
    window.setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
    toast({ title: `${p.name} exported`, sub: 'A text summary for audits and reviews.', tone: 'info' });
  };

  return (
    <AppShell page="profiles">
      <div className="flex min-h-0 grow flex-col overflow-y-auto px-[50px] pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <PageTitle>Profiles</PageTitle>
            <p className="mt-1.5 mb-0 text-[15px] text-muted">Apple device profiles. Each one bundles apps, restrictions and settings for a device group.</p>
          </div>
          <UButton size="lg" asChild>
            <Link to="/new"><Plus strokeWidth={1.7} />Create profile</Link>
          </UButton>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <label className="flex h-11 w-[340px] items-center gap-2.5 rounded-[6px] border border-line px-3 focus-within:border-uem">
            <Search className="size-4 text-muted" strokeWidth={1.7} />
            <Input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && setQ('')} placeholder="Search profiles" aria-label="Search profiles" className="h-auto border-0 bg-transparent p-0 text-[14px] shadow-none focus-visible:ring-0" />
            {q && <button type="button" aria-label="Clear search" onClick={() => { setQ(''); searchRef.current?.focus(); }} className="flex border-0 bg-transparent p-0 text-muted hover:text-ink"><X className="size-4" strokeWidth={1.7} /></button>}
          </label>
          <span className="text-[13px] text-muted">{rows.filter((p) => p.status === 'Published').length} published · {rows.filter((p) => p.status === 'Draft').length} draft</span>
        </div>
        <div className="mt-4 overflow-hidden rounded-[6px] border border-line">
          <table className="w-full border-collapse tabular-nums">
            <thead className="bg-[#fafafa]">
              <tr>
                <th className={th}>Profile</th><th className={th}>Platform</th><th className={th}>Device groups</th><th className={th}>Apps</th><th className={th}>Status</th><th className={th}>Created</th><th className={th}>Last updated</th><th className="w-12"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-[14px] text-muted">
                  {q ? <>No profiles match “{q}”. <button type="button" onClick={() => setQ('')} className="border-0 bg-transparent p-0 font-semibold text-uem hover:underline">Clear search</button></> : 'No profiles yet. Create one to start managing Apple devices.'}
                </td></tr>
              )}
              {shown.map((p) => (
                <React.Fragment key={p.id}>
                <tr className={cn('border-t border-row text-[14px] transition-colors', confirm?.id === p.id ? 'bg-[#fafafa]' : 'cursor-pointer hover:bg-[#fafafa]')} onClick={() => confirm?.id !== p.id && navigate('/d1')}>
                  <td className="px-4 py-3"><Link to="/d1" onClick={(e) => e.stopPropagation()} className="font-semibold text-uem no-underline hover:underline">{p.name}</Link></td>
                  <td className="px-4">{p.platform}</td>
                  <td className="px-4">{p.groups.length ? <>{p.groups.join(', ')}<span className="block text-[12px] text-muted">{plural(p.devices, 'device')}</span></> : <span className="text-muted">None assigned</span>}</td>
                  <td className="px-4">{plural(p.apps, 'app')}</td>
                  <td className="px-4"><StatusChip status={p.status} /></td>
                  <td className="px-4 text-muted">{p.created}<span className="block text-[12px]">{p.createdBy}</span></td>
                  <td className="px-4 text-muted">{p.updated}<span className="block text-[12px]">{p.by}</span></td>
                  <td className="px-2" onClick={(e) => e.stopPropagation()}>
                    <UMenu trigger={<IconButton label={`More actions for ${p.name}`}><MoreVertical className="size-4" strokeWidth={1.7} /></IconButton>}>
                      <UMenuItem icon={PencilLine} onSelect={() => navigate('/d1')}>Open</UMenuItem>
                      <UMenuItem icon={CopyIcon} onSelect={() => duplicate(p)}>Duplicate as draft</UMenuItem>
                      {p.status === 'Draft' && <UMenuItem icon={Send} onSelect={() => setConfirm({ id: p.id, kind: 'publish' })}>Publish…</UMenuItem>}
                      <UMenuItem icon={Download} onSelect={() => exportProfile(p)}>Export summary</UMenuItem>
                      <UMenuSeparator />
                      <UMenuItem icon={Trash2} danger onSelect={() => setConfirm({ id: p.id, kind: 'delete' })}>Delete…</UMenuItem>
                    </UMenu>
                  </td>
                </tr>
                {confirm?.id === p.id && (
                  <tr className="bg-[#fafafa]">
                    <td colSpan={8} className="px-4 pb-3">
                      <div role="alert" className="flex flex-col gap-2 text-[13px] text-muted">
                        {confirm.kind === 'delete' ? (
                          <>
                            <span className="min-w-0">
                              Delete {p.name}? {p.status === 'Published' && p.devices ? <><b className="font-semibold text-[#7b341e]">{plural(p.devices, 'device')} have this profile</b>; at next check-in they remove its apps, restrictions and settings and stay enrolled.</> : 'It is a draft, so no device is affected.'} Its history goes with it.
                            </span>
                            <span className="flex flex-wrap gap-2">
                              <UButton tone="danger" size="sm" onClick={() => remove(p)}><Trash2 strokeWidth={1.7} />{p.status === 'Published' && p.devices ? `Delete and remove from ${plural(p.devices, 'device')}` : 'Delete'}</UButton>
                              <UButton tone="neutral" size="sm" autoFocus onClick={() => setConfirm(null)}>Cancel</UButton>
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="min-w-0">
                              Publish {p.name}? {p.devices ? `${plural(p.devices, 'device')} in its device group receive it at next check-in, usually within 15 minutes. Recorded in the audit log.` : 'No device is assigned yet, so nothing is sent until you assign a device group.'}
                            </span>
                            <span className="flex flex-wrap gap-2">
                              <UButton size="sm" onClick={() => publish(p)}><Send strokeWidth={1.7} />{p.devices ? `Publish to ${plural(p.devices, 'device')}` : 'Publish'}</UButton>
                              <UButton tone="neutral" size="sm" autoFocus onClick={() => setConfirm(null)}>Keep as draft</UButton>
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {undo && <div className="mt-3"><UndoRow onUndo={undoRemove}>Deleted: <span className="text-ink">{undo.row.name}</span>.{undo.row.status === 'Published' && undo.row.devices ? ` ${plural(undo.row.devices, 'device')} remove its settings at next check-in unless you undo.` : ' No device was affected.'}</UndoRow></div>}
        <p className="mt-3 text-[13px] text-muted" aria-live="polite">Showing {shown.length} of {rows.length} profiles</p>
      </div>
    </AppShell>
  );
}

/* Screen switcher · a small chip, out of the way of the UI ------------------ */
function ScreenNav() {
  const { pathname } = useLocation();
  const [open, setOpen] = React.useState(false);
  const current = screens.find((s) => `/${s.id}` === pathname);
  return (
    <div className="fixed top-[13px] left-[262px] z-50 font-sans">
      {open && (
        <div className="absolute top-9 left-0 w-[300px] overflow-hidden rounded-[8px] border border-line bg-white shadow-[0_8px_24px_rgba(0,0,0,0.16)]">
          <div className="flex items-center justify-between border-b border-line px-3 py-2 text-[12px] font-semibold tracking-wide text-muted uppercase">
            Prototype screens
            <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="border-0 bg-transparent p-0 text-muted"><X className="size-4" /></button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto py-1">
            <Link to="/" onClick={() => setOpen(false)} className={cn('block px-3 py-1.5 text-[13px] text-ink no-underline hover:bg-[#f3f3f5]', pathname === '/' && 'bg-nav-bg')}>Profiles list</Link>
            <Link to="/new" onClick={() => setOpen(false)} className={cn('block px-3 py-1.5 text-[13px] text-ink no-underline hover:bg-[#f3f3f5]', pathname === '/new' && 'bg-nav-bg')}>Create profile · step 1</Link>
            <Link to="/new2" onClick={() => setOpen(false)} className={cn('block px-3 py-1.5 text-[13px] text-ink no-underline hover:bg-[#f3f3f5]', pathname === '/new2' && 'bg-nav-bg')}>Create profile · device groups</Link>
            {screens.map((s) => (
              <Link key={s.id} to={`/${s.id}`} onClick={() => setOpen(false)} className={cn('block px-3 py-1.5 text-[13px] text-ink no-underline hover:bg-[#f3f3f5]', current?.id === s.id && 'bg-nav-bg')}>
                <span className="mr-2 inline-block w-6 text-[11px] font-semibold text-muted uppercase">{s.id}</span>{s.label}
              </Link>
            ))}
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex h-7 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-[12px] font-semibold text-muted hover:bg-[#f3f3f5] hover:text-ink"
      >
        <LayoutGrid className="size-3.5" strokeWidth={1.7} />
        Prototype · {current ? current.id.toUpperCase() : 'Profiles'}
      </button>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
    <div className="app-root">
      <Routes>
        <Route path="/" element={<ProfilesPage />} />
        <Route path="/new" element={<CreateProfilePage />} />
        <Route path="/new2" element={<CreateProfilePage initialStep={2} />} />
        {screens.map((s) => (
          <Route key={s.id} path={`/${s.id}`} element={s.token ? <VppTokenPage key={s.id} initial={s.token} /> : s.library ? <AppLibraryPage key={s.id} initialTab={s.libraryTab} /> : <ProfilePage key={s.id} initial={s.state} />} />
        ))}
      </Routes>
      <ScreenNav />
    </div>
    </ToastProvider>
  );
}
