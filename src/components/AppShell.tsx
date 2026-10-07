import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Apple, Bell, Bot, ChevronDown, ChevronRight, ChevronUp, Cloud, FileSearch, FileText, Filter, Globe,
  Mail, Monitor, MonitorSmartphone, PanelLeftClose, Search, UserCheck, Users,
} from 'lucide-react';
import { cn } from './ui/utils';
import { Input } from './ui/input';
import { UButton } from './uem';

type Page = 'profiles' | 'library';

function Group({ label }: { label: string }) {
  return (
    <div className="flex h-11 items-center justify-between pr-[22px] pl-3 text-[15px] font-semibold text-ink">
      {label}
      <ChevronUp className="size-[18px]" strokeWidth={1.7} />
    </div>
  );
}

function Item({ icon: Icon, label, more }: { icon: React.ElementType; label: string; more?: boolean }) {
  return (
    <a href="#" onClick={(e) => e.preventDefault()} className="flex h-11 items-center gap-3.5 pr-[22px] pl-3 text-[15px] text-ink no-underline hover:bg-[#fafafa]">
      <Icon className="size-5 shrink-0" strokeWidth={1.7} />
      <span className="grow">{label}</span>
      {more && <ChevronRight className="size-[18px]" strokeWidth={1.7} />}
    </a>
  );
}

function SubItem({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'mx-10 my-[3px] ml-6 flex h-10 items-center rounded-[10px] px-3 text-[16px] no-underline',
        active ? 'bg-nav-bg text-nav' : 'text-ink hover:bg-[#fafafa]',
      )}
    >
      {label}
    </Link>
  );
}

export function AppShell({ page, children }: { page: Page; children: React.ReactNode }) {
  return (
    <div className="flex h-screen min-h-[640px] flex-col overflow-hidden bg-white">
      <header className="flex h-[61px] shrink-0 items-center gap-6 border-b border-soft bg-white pr-9 pl-4">
        <div className="flex w-[206px] shrink-0 flex-col leading-none">
          <span className="text-[25px] font-semibold tracking-[-0.01em] text-[#3d3d3d]">
            mini<span className="text-brand">O</span>range
          </span>
          <span className="mt-[3px] text-[13px] font-semibold tracking-[0.06em] text-[#3d3d3d]">Endpoint Defence</span>
        </div>
        <span className="shrink-0 text-[21px] font-medium text-heading">
          Welcome, <b className="font-bold">Abhijeet</b>
        </span>
        <div className="flex min-w-0 grow justify-center">
          <label className="flex h-[38px] w-[416px] max-w-full items-center gap-2.5 rounded-[6px] border border-line bg-[#fafafa] px-3.5">
            <Search className="size-[18px] text-muted" strokeWidth={1.7} />
            <Input
              type="search"
              aria-label="Search"
              placeholder="Search"
              className="h-auto border-0 bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0"
            />
          </label>
        </div>
        <UButton tone="outline" className="shrink-0 font-semibold">
          <FileText strokeWidth={1.7} />
          Reporting
        </UButton>
        <button type="button" aria-label="Notifications" className="relative flex size-[38px] shrink-0 items-center justify-center border-0 bg-transparent text-ink">
          <Bell className="size-[22px]" strokeWidth={1.7} />
          <span className="absolute top-1.5 right-[7px] size-2 rounded-full bg-bad" />
        </button>
        <span aria-label="Account" className="flex size-[42px] shrink-0 items-center justify-center rounded-full bg-[#d6457a] text-[17px] font-medium text-white">
          AT
        </span>
      </header>

      <div className="flex min-h-0 grow">
        <nav aria-label="Main" className="relative flex w-64 shrink-0 flex-col overflow-hidden border-e border-soft bg-white pt-2.5">
          <div className="min-h-0 grow overflow-y-auto pb-14">
            <Group label="Device Inventory" />
            <Item icon={MonitorSmartphone} label="Devices" />
            <Item icon={Users} label="Device Groups" />
            <Item icon={UserCheck} label="Onboarding Requests" />
            <Group label="Data Loss Prevention" />
            <Item icon={Monitor} label="Endpoint" more />
            <Item icon={Mail} label="Email" more />
            <Item icon={Cloud} label="Cloud" more />
            <Item icon={FileSearch} label="Data Discovery" more />
            <Item icon={Filter} label="Content Filtering" more />
            <Item icon={Globe} label="Secure Web Gateway" more />
            <Group label="Mobile Device Management" />
            <Item icon={Bot} label="Android" more />
            <div className="flex h-[46px] items-center gap-3.5 border-e-[5px] border-nav bg-nav-bg pr-[22px] pl-3 text-[16px] text-nav">
              <Apple className="size-5" strokeWidth={1.7} />
              <span className="grow">Apple</span>
              <ChevronDown className="size-[18px] rotate-180" strokeWidth={1.7} />
            </div>
            <SubItem to="/d1" label="Profiles" active={page === 'profiles'} />
            <SubItem to="/l1" label={page === 'library' ? 'App Library' : 'App Groups'} active={page === 'library'} />
          </div>
          <div className="absolute bottom-0 left-0 flex h-14 w-[255px] items-center justify-center border-t border-soft bg-white">
            <button type="button" aria-label="Collapse sidebar" className="flex size-9 items-center justify-center border-0 bg-transparent text-ink">
              <PanelLeftClose className="size-5" strokeWidth={1.7} />
            </button>
          </div>
        </nav>
        <main className="flex min-w-0 grow flex-col">{children}</main>
      </div>
    </div>
  );
}
