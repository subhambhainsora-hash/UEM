import * as React from 'react';
import { AlertTriangle, Globe, LayoutGrid, Lock, Mail, Settings2, ShieldCheck, Wifi } from 'lucide-react';
import { cn } from './ui/utils';
import { AppShell } from './AppShell';
import { PageTitle, FooterActions } from './ds';
import { UButton } from './uem';
import icShortcut from '../assets/ds/nav-shortcut.svg';
import icFilter from '../assets/ds/nav-filter.svg';
import icProxy from '../assets/ds/nav-proxy.svg';
import icKiosk from '../assets/ds/nav-kiosk.svg';
import icUnlock from '../assets/ds/nav-unlock.svg';

export type Section =
  | 'App Catalog' | 'Restriction' | 'Passcode' | 'Per-App VPN' | 'Wifi' | 'Email' | 'Web Shortcuts'
  | 'Web Content Filter' | 'Global HTTP Proxy' | 'Kiosk' | 'Extensible SSO' | 'Advanced Settings';

type Icon = { lucide: React.ElementType } | { svg: string };
const sections: [Section, Icon][] = [
  ['App Catalog', { lucide: LayoutGrid }],
  ['Restriction', { lucide: ShieldCheck }], ['Passcode', { lucide: Lock }], ['Per-App VPN', { lucide: Globe }], ['Wifi', { lucide: Wifi }], ['Email', { lucide: Mail }],
  ['Web Shortcuts', { svg: icShortcut }], ['Web Content Filter', { svg: icFilter }], ['Global HTTP Proxy', { svg: icProxy }],
  ['Kiosk', { svg: icKiosk }], ['Extensible SSO', { svg: icUnlock }],
  ['Advanced Settings', { lucide: Settings2 }],
];

export function ProfileLayout({ section, onSection, children, dirty = 0, issueSections = [], onCancel, onSubmit }: {
  section: Section;
  onSection: (s: Section) => void;
  children: React.ReactNode;
  /** Number of unsaved changes; shown next to Submit. */
  dirty?: number;
  /** Sections with a blocking issue after a failed submit. */
  issueSections?: string[];
  onCancel?: () => void;
  onSubmit?: () => void;
}) {
  return (
    <AppShell page="profiles">
      <div className="flex min-h-0 grow flex-col overflow-y-auto px-[50px] pt-8 pb-4">
        <PageTitle>Profile configuration</PageTitle>
        <div className="mt-6 flex grow">
          {/* Section nav · "Nav Items main states" */}
          <div role="tablist" aria-orientation="vertical" className="flex w-[229px] shrink-0 flex-col gap-2 self-start border-e border-line pr-[25px]">
            {sections.map(([name, icon]) => {
              const active = name === section;
              const flagged = issueSections.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSection(name)}
                  className={cn(
                    'flex h-9 w-full items-center gap-2 rounded-[8px] border-0 px-3 py-2 text-left text-[14px] leading-5 tracking-[0.005em] text-ink',
                    active ? 'bg-nav-bg' : 'bg-transparent hover:bg-[#f3f3f5]',
                  )}
                >
                  {'svg' in icon ? (
                    <img src={icon.svg} alt="" width={17} height={17} className="size-[16.67px] shrink-0" />
                  ) : (
                    <icon.lucide className="size-[16.67px] shrink-0" strokeWidth={1.7} />
                  )}
                  <span className="grow">{name}</span>
                  {flagged && <AlertTriangle aria-label="Needs attention" className="size-4 text-bad" strokeWidth={1.7} />}
                </button>
              );
            })}
          </div>
          <section aria-label={section} className="flex min-w-0 grow flex-col pl-6">
            {children}
          </section>
        </div>
      </div>
      <footer className="shrink-0 border-t border-line px-[50px] py-4">
        <FooterActions>
          {dirty > 0 && (
            <span className="mr-2 text-[13px] text-muted" aria-live="polite">
              {dirty} unsaved {dirty === 1 ? 'change' : 'changes'}
            </span>
          )}
          <UButton tone="outline" size="lg" onClick={onCancel}>Cancel</UButton>
          <UButton size="lg" onClick={onSubmit}>Submit</UButton>
        </FooterActions>
      </footer>
    </AppShell>
  );
}
