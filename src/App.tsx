import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { ProfilePage, type ProfileState } from './screens/ProfilePage';
import { AppLibraryPage } from './screens/AppLibrary';

const screens: { id: string; label: string; state?: ProfileState; library?: boolean }[] = [
  { id: 'd1', label: 'D1 · App Store tab', state: {} },
  { id: 'd2', label: 'D2 · App Store tab · Add apps drawer', state: { drawer: 'store' } },
  { id: 'd3', label: 'D3 · Configure drawer', state: { drawer: 'settings' } },
  { id: 'd4', label: 'D4 · Enterprise tab', state: { tab: 'enterprise' } },
  { id: 'd5', label: 'D5 · Enterprise tab · Add from library', state: { tab: 'enterprise', drawer: 'library' } },
  { id: 'd6', label: 'D6 · Enterprise tab · Upload .ipa', state: { tab: 'enterprise', drawer: 'upload' } },
  { id: 'd7', label: 'D7 · VPP tab (later)', state: { tab: 'vpp' } },
  { id: 'd8', label: 'D8 · 1366 × 768 laptop, sidebar open (resize to 1366px)', state: {} },
  { id: 'd9', label: 'D9 · Change App Store country (checked before save)', state: { dialog: 'country' } },
  { id: 'l1', label: 'L1 · App Library page (replaces App Groups)', library: true },
  { id: 's1', label: 'S1 · Settings drawer · App Store app', state: { drawer: 'settings' } },
  { id: 's2', label: 'S2 · Settings drawer · in-house app', state: { tab: 'enterprise', drawer: 'settings-enterprise' } },
  { id: 'k1', label: 'K1 · Kiosk · Single App picks from App Catalog', state: { section: 'Kiosk', kiosk: 'single', kioskPicker: true } },
  { id: 'k2', label: 'K2 · Kiosk · Multi App home screen and dock', state: { section: 'Kiosk', kiosk: 'multi' } },
  { id: 'k3', label: 'K3 · Extensible SSO · allowed apps', state: { section: 'Extensible SSO' } },
  { id: 'k4', label: 'K4 · Removing an app that Kiosk or SSO uses', state: { tab: 'enterprise', dialog: 'remove' } },
];

function Index() {
  return (
    <div className="min-h-screen bg-[#faf9f5] px-10 py-10 font-sans">
      <h1 className="m-0 text-[26px] font-semibold text-heading">
        mini<span className="text-brand">O</span>range UEM · iOS Profile App Catalog
      </h1>
      <p className="mt-2 text-[15px] text-muted">Every screen from the design file. Each one is a live, interactive state of the app.</p>
      <ul className="mt-6 grid list-none gap-2 p-0 sm:grid-cols-2">
        {screens.map((s) => (
          <li key={s.id}>
            <Link to={`/${s.id}`} className="block rounded-[8px] border border-line bg-white px-4 py-3 text-[15px] text-ink no-underline hover:border-uem hover:text-uem">
              {s.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScreenNav() {
  const { pathname } = useLocation();
  const i = screens.findIndex((s) => `/${s.id}` === pathname);
  if (i < 0) return null;
  return (
    <div className="fixed bottom-3 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full bg-[#1c1b1f]/90 px-4 py-1.5 font-sans text-[13px] text-white shadow-lg">
      <Link to="/" className="text-white no-underline">All screens</Link>
      <span className="opacity-50">|</span>
      {i > 0 && <Link to={`/${screens[i - 1].id}`} className="text-white no-underline">‹ Prev</Link>}
      <span>{screens[i].label.split(' · ')[0]}</span>
      {i < screens.length - 1 && <Link to={`/${screens[i + 1].id}`} className="text-white no-underline">Next ›</Link>}
    </div>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        {screens.map((s) => (
          <Route key={s.id} path={`/${s.id}`} element={s.library ? <AppLibraryPage /> : <ProfilePage key={s.id} initial={s.state} />} />
        ))}
      </Routes>
      <ScreenNav />
    </>
  );
}
