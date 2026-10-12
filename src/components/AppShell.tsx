import * as React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Mail, MonitorSmartphone, Rocket, ShieldCheck, Users } from 'lucide-react';
import { cn } from './ui/utils';
import moLogo from '../assets/ds/mo-logo.svg';
import icDashboard from '../assets/ds/sb-dashboard.svg';
import icClassify from '../assets/ds/sb-classify.svg';
import icDomains from '../assets/ds/sb-domains.svg';
import icUp from '../assets/ds/sb-up.svg';
import icDown from '../assets/ds/sb-down.svg';
import icOrg from '../assets/ds/org-building.svg';
import icChevron from '../assets/ds/chevron-down.svg';

type Page = 'profiles' | 'library';

/* Sidebar · mO WEB Design System ------------------------------------------ */
function NavItem({ icon, lucide: Lucide, label, open, onClick, level = 0, active, to }: {
  icon?: string; lucide?: React.ElementType; label: string; open?: boolean; onClick?: () => void; level?: 0 | 1 | 2; active?: boolean; to?: string;
}) {
  const cls = cn(
    'flex w-full items-center gap-2 rounded-[8px] px-3 text-left text-[14px] leading-5 tracking-[0.005em] text-ink no-underline hover:bg-[#f3f3f5]',
    level === 0 ? 'py-2' : 'py-1',
    active && 'rounded-[4px] bg-nav-bg hover:bg-nav-bg',
  );
  const body = (
    <>
      {icon && <img src={icon} alt="" width={17} height={17} className="size-[16.67px] shrink-0" />}
      {Lucide && <Lucide className="size-[16.67px] shrink-0" strokeWidth={1.7} />}
      <span className="grow">{label}</span>
      {open !== undefined && <img src={open ? icUp : icDown} alt="" width={20} height={20} className="size-5" />}
    </>
  );
  if (to) return <Link to={to} aria-current={active ? 'page' : undefined} className={cls}>{body}</Link>;
  return <button type="button" onClick={onClick} aria-expanded={open} className={cn(cls, 'border-0 bg-transparent')}>{body}</button>;
}

function Sidebar({ page }: { page: Page }) {
  const [open, setOpen] = React.useState<Record<string, boolean>>({ devices: true, policy: true, windows: true, apple: true, classify: false });
  const t = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  return (
    <nav aria-label="Main" className="flex w-[242px] shrink-0 flex-col bg-white drop-shadow-[1px_4px_2px_rgba(0,0,0,0.1)]">
      <div className="flex min-h-0 grow flex-col gap-5 overflow-y-auto py-5">
        <div className="flex items-center px-5">
          <div className="flex flex-col px-1">
            <img src={moLogo} alt="miniOrange" width={123} height={24} className="h-6 w-[123px]" />
            <span className="text-[11.9px] leading-4 font-extrabold tracking-[0.3px] text-[#5f6062]">MDM</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 px-2">
          <NavItem icon={icDashboard} label="Dashboard" />
          <NavItem lucide={Rocket} label="Getting started" />
          <div className="flex flex-col gap-2">
            <NavItem lucide={MonitorSmartphone} label="Manage devices" open={open.devices} onClick={() => t('devices')} />
            {open.devices && (
              <div className="flex flex-col gap-1.5 pl-7">
                <NavItem label="Device" level={1} />
                <NavItem label="Device Groups" level={1} />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <NavItem lucide={MonitorSmartphone} label="Devices policy" open={open.policy} onClick={() => t('policy')} />
            {open.policy && (
              <div className="flex flex-col gap-1.5 pl-[26px]">
                <NavItem label="Windows" level={1} open={open.windows} onClick={() => t('windows')} />
                {open.windows && (
                  <div className="flex flex-col gap-1.5 pl-5">
                    <NavItem label="Desktop apps" level={2} /><NavItem label="USB" level={2} /><NavItem label="Printer" level={2} /><NavItem label="Ethernet" level={2} />
                  </div>
                )}
                <NavItem label="Android" level={1} />
                <NavItem label="Apple" level={1} open={open.apple} onClick={() => t('apple')} />
                {open.apple && (
                  <div className="flex flex-col gap-1.5 pl-5">
                    <NavItem label="Profiles" level={2} to="/d1" active={page === 'profiles' || page === 'library'} />
                  </div>
                )}
              </div>
            )}
          </div>
          <NavItem lucide={Users} label="Manage User" />
          <NavItem lucide={Mail} label="Email policy" />
          <NavItem lucide={Bell} label="Notification" />
          <NavItem icon={icClassify} label="Data Classification" open={open.classify} onClick={() => t('classify')} />
          <NavItem lucide={ShieldCheck} label="Approval requests" />
          <NavItem icon={icDomains} label="Organizational domains" />
        </div>
      </div>
      <div className="flex shrink-0 items-center border-t border-[#eaeaea] bg-[#f9f9f9] px-5 py-3">
        <a href="https://www.miniorange.com" target="_blank" rel="noreferrer" className="py-1 pl-2.5 text-[11px] leading-[17px] text-[#636363] no-underline">
          Powered by <span className="text-brand">miniOrange</span>
        </a>
      </div>
    </nav>
  );
}

/* Header · mO WEB Design System ------------------------------------------- */
function Header() {
  const [dark, setDark] = React.useState(false);
  return (
    <header className="flex h-[55px] shrink-0 items-center gap-2.5 border-b border-line bg-white px-3 py-[5px]">
      <div className="grow" />
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          role="switch"
          aria-checked={dark}
          aria-label="Theme"
          onClick={() => setDark((d) => !d)}
          className="relative h-5 w-9 rounded-full border-0 bg-uem p-0"
        >
          <span className={cn('absolute top-[3px] size-[14px] rounded-full bg-white transition-all', dark ? 'left-[19px]' : 'left-[3px]')} />
          <span className="absolute top-[3px] right-[4px] size-1 rounded-full bg-white" />
          <span className="absolute top-[9px] right-[7px] size-1 rounded-full bg-white" />
        </button>
        <button type="button" className="flex items-center gap-1 rounded-[3px] border-[1.2px] border-line bg-white px-3 py-1 text-[14px] leading-5 font-bold text-ink">
          <img src={icOrg} alt="" width={16} height={16} className="size-4" />
          Miniorange.com
          <img src={icChevron} alt="" width={24} height={24} className="size-6" />
        </button>
        <span aria-label="Account" className="flex size-8 items-center justify-center rounded-full border border-line bg-white text-[13px] font-bold tracking-[1px] text-ink">
          KP
        </span>
      </div>
    </header>
  );
}

export function AppShell({ page, children }: { page: Page; children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-[560px] min-w-[1180px] overflow-hidden bg-white">
      <Sidebar page={page} />
      <div className="flex min-h-0 min-w-0 grow flex-col">
        <Header />
        <main className="flex min-h-0 min-w-0 grow flex-col">{children}</main>
      </div>
    </div>
  );
}
