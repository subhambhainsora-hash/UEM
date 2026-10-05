import * as React from 'react';
import {
  CheckCircle2, Filter, Globe, Hexagon, LayoutGrid, Lock, LockOpen, Mail, MapPin, Settings2,
  ShieldCheck, SkipBack, SkipForward, Smartphone, Wifi, X,
} from 'lucide-react';
import { cn } from './ui/utils';
import { AppShell } from './AppShell';
import { UButton } from './uem';

export type Section =
  | 'App Catalog' | 'Restrictions' | 'Passcode' | 'VPN' | 'Wifi' | 'Mail' | 'Global HTTP Proxy'
  | 'Web Shortcuts' | 'Kiosk' | 'Web Content Filter' | 'Extensible SSO' | 'Advanced Settings';

const sections: [Section, React.ElementType][] = [
  ['App Catalog', LayoutGrid], ['Restrictions', ShieldCheck], ['Passcode', Lock], ['VPN', Globe],
  ['Wifi', Wifi], ['Mail', Mail], ['Global HTTP Proxy', MapPin], ['Web Shortcuts', Hexagon],
  ['Kiosk', Smartphone], ['Web Content Filter', Filter], ['Extensible SSO', LockOpen], ['Advanced Settings', Settings2],
];

export function ProfileLayout({
  section,
  onSection,
  children,
}: {
  section: Section;
  onSection: (s: Section) => void;
  children: React.ReactNode;
}) {
  return (
    <AppShell page="profiles">
      <div className="flex min-h-0 grow flex-col pt-[26px] pr-10 pb-2 pl-9">
        <h1 className="m-0 text-[25px] leading-[1.2] font-medium text-heading">Apple iOS Profile</h1>
        <p className="mt-1.5 mb-0 text-[15px] text-muted">Configure policies, passcode rules, and restrictions for your Apple devices</p>

        <ol aria-label="Steps" className="mt-5 flex list-none items-center p-0">
          <li className="flex h-10 shrink-0 items-center gap-2 rounded-[22px] border-2 border-ok pr-[18px] pl-4 text-[16px] font-semibold text-ok">
            <CheckCircle2 className="size-5 fill-ok text-white" strokeWidth={2} />
            Name &amp; Description
          </li>
          <li aria-hidden className="h-0.5 grow bg-ok" />
          <li aria-current="step" className="flex h-10 shrink-0 items-center gap-2 rounded-[22px] border-2 border-uem pr-[18px] pl-3 text-[16px] font-semibold text-uem">
            <span className="flex size-5 items-center justify-center rounded-full border-2 border-uem text-[12px] font-bold">2</span>
            Profile Enforcer
          </li>
        </ol>

        <div className="mt-4 flex min-h-0 grow">
          <div className="flex w-[238px] shrink-0 flex-col overflow-y-auto border-e border-line pt-1 pr-[18px]">
            {sections.map(([name, Icon]) => {
              const active = name === section;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => onSection(name)}
                  className={cn(
                    'flex h-[46px] w-full shrink-0 items-center gap-4 rounded-[4px] border-0 px-4 text-start text-[16px]',
                    active ? 'bg-uem-soft font-semibold text-uem' : 'bg-transparent text-ink hover:bg-[#fafafa]',
                  )}
                >
                  <Icon className="size-[18px]" strokeWidth={1.7} />
                  {name}
                </button>
              );
            })}
          </div>
          <section aria-label={section} className="flex min-w-0 grow flex-col overflow-y-auto pr-4 pl-5">
            {children}
          </section>
        </div>
      </div>
      <footer className="mx-10 ml-[30px] flex shrink-0 items-center justify-between border-t border-line py-4">
        <UButton tone="outline" size="lg" className="text-[16px]">
          <SkipBack className="size-3.5 fill-current" strokeWidth={1.7} />
          Previous
        </UButton>
        <div className="flex gap-5">
          <UButton tone="outline" size="lg" className="text-[16px]">
            <X strokeWidth={1.7} />
            Cancel
          </UButton>
          <UButton size="lg" className="text-[16px]">
            Submit
            <SkipForward className="size-3.5 fill-current" strokeWidth={1.7} />
          </UButton>
        </div>
      </footer>
    </AppShell>
  );
}
