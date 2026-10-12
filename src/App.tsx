import * as React from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { LayoutGrid, Plus, Search, X } from 'lucide-react';
import { ProfilePage, type ProfileState } from './screens/ProfilePage';
import { AppLibraryPage } from './screens/AppLibrary';
import { AppShell } from './components/AppShell';
import { PageTitle } from './components/ds';
import { UButton } from './components/uem';
import { Input } from './components/ui/input';
import { cn } from './components/ui/utils';
import { profile, plural } from './data';

const screens: { id: string; label: string; state?: ProfileState; library?: boolean }[] = [
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
];

/* Profiles list · the page the sidebar's "Profiles" item opens --------------- */
const profiles = [
  { name: profile.name, platform: 'iOS', devices: profile.deviceCount, apps: 5, updated: '12 Oct 2026', by: 'Abhijeet T.', status: 'Published' },
  { name: 'Warehouse Kiosk', platform: 'iOS', devices: 36, apps: 2, updated: '3 Oct 2026', by: 'Vedika S.', status: 'Published' },
  { name: 'Exec iPads', platform: 'iPadOS', devices: 12, apps: 7, updated: '28 Sep 2026', by: 'Abhijeet T.', status: 'Draft' },
];

function ProfilesPage() {
  const th = 'px-4 py-3 text-left text-[14px] font-semibold text-heading';
  return (
    <AppShell page="profiles">
      <div className="flex min-h-0 grow flex-col overflow-y-auto px-[50px] pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <PageTitle>Profiles</PageTitle>
            <p className="mt-1.5 mb-0 text-[15px] text-muted">Apple device profiles. Each one bundles apps, restrictions and settings for a device group.</p>
          </div>
          <UButton size="lg" asChild>
            <Link to="/d1"><Plus strokeWidth={1.7} />Create profile</Link>
          </UButton>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <label className="flex h-11 w-[340px] items-center gap-2.5 rounded-[6px] border border-line px-3">
            <Search className="size-4 text-muted" strokeWidth={1.7} />
            <Input placeholder="Search profiles" className="h-auto border-0 bg-transparent p-0 text-[14px] shadow-none focus-visible:ring-0" />
          </label>
        </div>
        <div className="mt-4 overflow-hidden rounded-[6px] border border-line">
          <table className="w-full border-collapse">
            <thead className="bg-[#fafafa]">
              <tr>
                <th className={th}>Profile</th><th className={th}>Platform</th><th className={th}>Devices</th><th className={th}>Apps</th><th className={th}>Status</th><th className={th}>Last updated</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.name} className="border-t border-row text-[14px]">
                  <td className="px-4 py-3"><Link to="/d1" className="font-semibold text-uem no-underline hover:underline">{p.name}</Link></td>
                  <td className="px-4">{p.platform}</td>
                  <td className="px-4">{plural(p.devices, 'device')}</td>
                  <td className="px-4">{plural(p.apps, 'app')}</td>
                  <td className="px-4">
                    <span className={cn('rounded-[8px] px-2.5 py-0.5 text-[12px] font-medium', p.status === 'Published' ? 'bg-[#e3fcef] text-[#006644]' : 'bg-chip text-[#262626]')}>{p.status}</span>
                  </td>
                  <td className="px-4 text-muted">{p.updated} · {p.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] text-muted">Showing {profiles.length} of {profiles.length} profiles</p>
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
    <div className="h-screen">
      <Routes>
        <Route path="/" element={<ProfilesPage />} />
        {screens.map((s) => (
          <Route key={s.id} path={`/${s.id}`} element={s.library ? <AppLibraryPage /> : <ProfilePage key={s.id} initial={s.state} />} />
        ))}
      </Routes>
      <ScreenNav />
    </div>
  );
}
