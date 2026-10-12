import * as React from 'react';
import { Link } from 'react-router-dom';
import { Apple, Bot, Check, ChevronRight, ChevronUp, Cloud, FileSearch, Filter, Globe, LogOut, Mail, Monitor, MonitorSmartphone, PanelLeftClose, PanelLeftOpen, UserCheck, Users } from 'lucide-react';
import { useToast } from './toast';
import { UMenu, UMenuItem, UMenuSeparator } from './uem';
import { cn } from './ui/utils';
import moLogo from '../assets/ds/mo-logo.svg';
import icOrg from '../assets/ds/org-building.svg';
import icChevron from '../assets/ds/chevron-down.svg';

type Page = 'profiles' | 'library' | 'vpp';

/* Sidebar · Endpoint Defence navigation (from the iOS Profile App Catalog PDF) ---- */
function Group({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
  return (
    <button type="button" aria-expanded={open} onClick={onToggle} className="flex h-11 w-full items-center justify-between border-0 bg-transparent pr-4 pl-3 text-left text-[15px] font-semibold whitespace-nowrap text-ink">
      {label}
      <ChevronUp className={cn('size-[18px] transition-transform', !open && 'rotate-180')} strokeWidth={1.7} />
    </button>
  );
}

function Item({ icon: Icon, label, more, active, open, onClick, collapsed }: {
  icon: React.ElementType; label: string; more?: boolean; active?: boolean; open?: boolean; onClick?: () => void; collapsed?: boolean;
}) {
  const toast = useToast();
  const placeholder = () => toast({ title: `${label} isn’t part of this prototype`, sub: 'Only Apple › Profiles and App Groups are built out.', tone: 'info' });
  return (
    <button
      type="button"
      title={collapsed ? label : undefined}
      onClick={onClick ?? placeholder}
      aria-expanded={open}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'flex h-11 w-full items-center gap-3.5 border-0 bg-transparent pr-[22px] pl-3 text-left text-[15px] no-underline',
        active ? 'h-[46px] border-e-[5px] border-uem bg-nav-bg pr-[17px] text-uem' : 'text-ink hover:bg-[#f3f3f5]',
      )}
    >
      <Icon className="size-5 shrink-0" strokeWidth={1.7} />
      {!collapsed && <span className="grow">{label}</span>}
      {!collapsed && more && <ChevronRight className="size-[18px]" strokeWidth={1.7} />}
      {!collapsed && open !== undefined && <ChevronUp className={cn('size-[18px] transition-transform', !open && 'rotate-180')} strokeWidth={1.7} />}
    </button>
  );
}

function SubItem({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'mx-6 my-[3px] flex h-10 items-center rounded-[10px] px-3 text-[15px] no-underline',
        active ? 'bg-nav-bg text-uem' : 'text-ink hover:bg-[#f3f3f5]',
      )}
    >
      {label}
    </Link>
  );
}

function Sidebar({ page }: { page: Page }) {
  const [open, setOpen] = React.useState<Record<string, boolean>>({ inventory: true, dlp: true, mdm: true, apple: true });
  const [collapsed, setCollapsed] = React.useState(() => { try { return localStorage.getItem('uem.sidebar') === 'collapsed'; } catch { return false; } });
  const t = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const toggleCollapsed = () => setCollapsed((c) => { try { localStorage.setItem('uem.sidebar', c ? 'open' : 'collapsed'); } catch { /* private mode */ } return !c; });
  return (
    <nav aria-label="Main" className={cn('relative flex shrink-0 flex-col overflow-hidden border-e border-soft bg-white transition-[width] duration-200 ease-out', collapsed ? 'w-[64px]' : 'w-[266px]')}>
      <div className={cn('flex shrink-0 flex-col border-b border-soft pt-4 pb-3', collapsed ? 'items-center px-2' : 'px-5')}>
        {collapsed ? <img src={moLogo} alt="miniOrange" width={24} height={24} className="size-6 object-cover object-left" /> : <img src={moLogo} alt="miniOrange" width={123} height={24} className="h-6 w-[123px]" />}
        {!collapsed && <span className="mt-[3px] pl-0.5 text-[11.9px] leading-4 font-extrabold tracking-[0.3px] text-[#5f6062]">Endpoint Defence</span>}
      </div>
      <div className="min-h-0 grow overflow-y-auto pt-2.5 pb-14">
        {collapsed ? (
          <>
            <Item icon={MonitorSmartphone} label="Devices" collapsed />
            <Item icon={Users} label="Device Groups" collapsed />
            <Item icon={UserCheck} label="Onboarding Requests" collapsed />
            <Item icon={Monitor} label="Endpoint" collapsed />
            <Item icon={Mail} label="Email" collapsed />
            <Item icon={Cloud} label="Cloud" collapsed />
            <Item icon={FileSearch} label="Data Discovery" collapsed />
            <Item icon={Filter} label="Content Filtering" collapsed />
            <Item icon={Globe} label="Secure Web Gateway" collapsed />
            <Item icon={Bot} label="Android" collapsed />
            <Item icon={Apple} label="Apple" active collapsed onClick={toggleCollapsed} />
          </>
        ) : (
          <>
            <Group label="Device Inventory" open={open.inventory} onToggle={() => t('inventory')} />
            {open.inventory && (
              <>
                <Item icon={MonitorSmartphone} label="Devices" />
                <Item icon={Users} label="Device Groups" />
                <Item icon={UserCheck} label="Onboarding Requests" />
              </>
            )}
            <Group label="Data Loss Prevention" open={open.dlp} onToggle={() => t('dlp')} />
            {open.dlp && (
              <>
                <Item icon={Monitor} label="Endpoint" more />
                <Item icon={Mail} label="Email" more />
                <Item icon={Cloud} label="Cloud" more />
                <Item icon={FileSearch} label="Data Discovery" more />
                <Item icon={Filter} label="Content Filtering" more />
                <Item icon={Globe} label="Secure Web Gateway" more />
              </>
            )}
            <Group label="Mobile Device Management" open={open.mdm} onToggle={() => t('mdm')} />
            {open.mdm && (
              <>
                <Item icon={Bot} label="Android" more />
                <Item icon={Apple} label="Apple" active open={open.apple} onClick={() => t('apple')} />
                {open.apple && (
                  <>
                    <SubItem to="/d1" label="Profiles" active={page === 'profiles'} />
                    <SubItem to="/l1" label="App Groups" active={page === 'library'} />
                    <SubItem to="/v2" label="VPP Token" active={page === 'vpp'} />
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
      <div className="absolute bottom-0 left-0 flex h-14 w-full items-center justify-center border-t border-soft bg-white">
        <button type="button" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} onClick={toggleCollapsed} className="flex size-9 items-center justify-center rounded-[6px] border-0 bg-transparent text-ink hover:bg-[#f3f3f5]">
          {collapsed ? <PanelLeftOpen className="size-5" strokeWidth={1.7} /> : <PanelLeftClose className="size-5" strokeWidth={1.7} />}
        </button>
      </div>
    </nav>
  );
}

/* Header · mO WEB Design System ------------------------------------------- */
function Header() {
  const toast = useToast();
  const [org, setOrg] = React.useState('Miniorange.com');
  return (
    <header className="flex h-[55px] shrink-0 items-center gap-2.5 border-b border-line bg-white px-3 py-[5px]">
      <div className="grow" />
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          role="switch"
          aria-checked={false}
          aria-label="Dark theme"
          title="Dark theme"
          onClick={() => toast({ title: 'Dark theme isn’t part of this prototype', sub: 'The screens are designed for the light theme only.', tone: 'info' })}
          className="relative h-5 w-9 rounded-full border-0 bg-uem p-0"
        >
          <span className="absolute top-[3px] left-[3px] size-[14px] rounded-full bg-white" />
          <span className="absolute top-[3px] right-[4px] size-1 rounded-full bg-white" />
          <span className="absolute top-[9px] right-[7px] size-1 rounded-full bg-white" />
        </button>
        <UMenu
          trigger={
            <button type="button" aria-label={`Organisation: ${org}`} className="flex items-center gap-1 rounded-[3px] border-[1.2px] border-line bg-white px-3 py-1 text-[14px] leading-5 font-bold text-ink hover:bg-[#f3f3f5] data-[state=open]:bg-[#f3f3f5]">
              <img src={icOrg} alt="" width={16} height={16} className="size-4" />
              {org}
              <img src={icChevron} alt="" width={24} height={24} className="size-6" />
            </button>
          }
        >
          {['Miniorange.com', 'Acme Corp', 'Contoso Ltd'].map((o) => (
            <UMenuItem key={o} icon={o === org ? Check : undefined} onSelect={() => { if (o !== org) { setOrg(o); toast({ title: `Switched to ${o}`, sub: 'Profiles and App Groups shown are still the prototype data.', tone: 'info' }); } }}>{o}</UMenuItem>
          ))}
        </UMenu>
        <UMenu
          trigger={
            <button type="button" aria-label="Account menu" className="flex size-8 items-center justify-center rounded-full border border-line bg-white text-[13px] font-bold tracking-[1px] text-ink hover:bg-[#f3f3f5] data-[state=open]:bg-[#f3f3f5]">
              KP
            </button>
          }
        >
          <div className="px-2.5 py-2 text-[13px]">
            <p className="m-0 font-semibold text-heading">Kiran Patil</p>
            <p className="m-0 text-muted">kiran.p@miniorange.com · Admin</p>
          </div>
          <UMenuSeparator />
          <UMenuItem icon={LogOut} onSelect={() => toast({ title: 'Signed out (prototype)', sub: 'In the product this ends the session.', tone: 'info' })}>Sign out</UMenuItem>
        </UMenu>
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
