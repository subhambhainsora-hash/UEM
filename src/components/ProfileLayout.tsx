import * as React from 'react';
import { AlertTriangle, Check, Globe, Info, LayoutGrid, Lock, Mail, Settings2, ShieldCheck, Wifi, X } from 'lucide-react';
import { plural, profile } from '../data';
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

export function ProfileLayout({ section, onSection, children, dirty = 0, dirtySections = [], issueSections = [], status = 'idle', onCancel, onSubmit, onDiscard }: {
  section: Section;
  onSection: (s: Section) => void;
  children: React.ReactNode;
  /** Number of unsaved changes; shown in the status bar. */
  dirty?: number;
  /** Sections holding unsaved changes; marked in the nav. */
  dirtySections?: string[];
  /** Sections with a blocking issue after a failed submit. */
  issueSections?: string[];
  /** What the status bar says. */
  status?: 'idle' | 'blocked' | 'submitted';
  onCancel?: () => void;
  onSubmit?: () => void;
  onDiscard?: () => void;
}) {
  const [how, setHow] = React.useState(false);
  React.useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); if (dirty > 0) onSubmit?.(); }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [dirty, onSubmit]);
  const firstIssue = sections.map(([n]) => n).find((n) => issueSections.includes(n));
  return (
    <AppShell page="profiles">
      <div className="flex min-h-0 grow flex-col overflow-y-auto px-[50px] pt-8 pb-4">
        <div className="flex items-center justify-between gap-4">
          <PageTitle>Profile configuration</PageTitle>
          <button type="button" aria-expanded={how} onClick={() => setHow((h) => !h)} className="flex items-center gap-1.5 border-0 bg-transparent p-0 text-[14px] text-muted hover:text-ink">
            <Info className="size-4" strokeWidth={1.7} />How submitting works
          </button>
        </div>
        {how && (
          <div role="region" aria-label="How submitting works" className="mt-4 flex items-start gap-3 rounded-[8px] bg-info-bg px-4 py-3 text-[14px] leading-[22px] text-[#171717]">
            <Info className="mt-[3px] size-4 shrink-0 text-uem" strokeWidth={1.7} />
            <div className="grow">
              <p className="m-0">Edits collect here and nothing reaches devices until you submit. The {plural(profile.deviceCount, 'device')} in {profile.name} pick up a submitted profile at their next check-in, usually within 15 minutes.</p>
              <p className="mt-1.5 mb-0">Removing an app uninstalls it. Kiosk and Extensible SSO pick from the App Catalog, so removing an app they use needs a replacement before submit. Every submit is recorded in the audit log with your name and the time.</p>
            </div>
            <button type="button" aria-label="Close" onClick={() => setHow(false)} className="flex shrink-0 border-0 bg-transparent p-0 text-muted hover:text-ink"><X className="size-4" strokeWidth={1.7} /></button>
          </div>
        )}
        <div className="mt-6 flex grow items-stretch">
          {/* Section nav · "Nav Items main states" */}
          <div role="tablist" aria-orientation="vertical" className="flex w-[229px] shrink-0 flex-col gap-2 self-stretch border-e border-line pr-[25px]">
            {sections.map(([name, icon]) => {
              const active = name === section;
              const flagged = issueSections.includes(name);
              const edited = dirtySections.includes(name);
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
                  {flagged ? <AlertTriangle aria-label="Needs attention" className="size-4 text-bad" strokeWidth={1.7} /> : edited ? <span aria-label="Unsaved changes" title="Unsaved changes" className="size-2 rounded-full bg-uem" /> : null}
                </button>
              );
            })}
          </div>
          <section aria-label={section} className="flex min-w-0 grow flex-col pl-6">
            {children}
          </section>
        </div>
      </div>
      <footer className={cn('shrink-0 border-t border-line px-[50px] py-3 transition-colors', status === 'blocked' ? 'bg-[#fdecea]/50' : dirty > 0 ? 'bg-[#f0f7ff]' : 'bg-[#fafafa]')}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 grow text-[13px]" aria-live="polite">
            {status === 'blocked' ? (
              <span role="alert" className="text-bad">
                <b className="font-semibold">{issueSections.length === 1 ? '1 section needs' : `${issueSections.length} sections need`} attention before this can go live.</b>{' '}
                {firstIssue && <button type="button" onClick={() => onSection(firstIssue)} className="border-0 bg-transparent p-0 font-semibold text-bad underline underline-offset-2 hover:no-underline">Show me</button>}
                <span className="text-muted"> Nothing has been sent to devices.</span>
              </span>
            ) : dirty > 0 ? (
              <span className="text-muted"><b className="font-semibold text-ink">{plural(dirty, 'unsaved change')}.</b> Devices stay on the last submitted profile until you submit.</span>
            ) : status === 'submitted' ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-[#006644]"><Check className="size-4" strokeWidth={2} />Submitted. {plural(profile.deviceCount, 'device')} get it at their next check-in.</span>
            ) : (
              <span className="text-muted">Devices match this profile. Change something and submit it from here, or press Ctrl+S.</span>
            )}
          </div>
          <FooterActions>
            {dirty > 0 && <UButton tone="link" size="lg" onClick={onDiscard}>Discard changes</UButton>}
            <UButton tone="outline" size="lg" onClick={onCancel}>{dirty > 0 ? 'Cancel' : 'Back to profiles'}</UButton>
            <UButton size="lg" disabled={dirty === 0} onClick={onSubmit} title={dirty === 0 ? 'Nothing to submit' : 'Send these changes to devices (Ctrl+S)'}>Submit</UButton>
          </FooterActions>
        </div>
      </footer>
    </AppShell>
  );
}
