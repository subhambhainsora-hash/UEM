import * as React from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Copy, Globe, Info, Plus, X } from 'lucide-react';
import { AddRow, EmptyState, Field, FieldLabel, InfoAlert, InfoCard, ProfileFields, RadioCard, SectionHeader, SectionTitle } from '../components/ds';
import tileMail from '../assets/ds/tile-mail.svg';
import tilePuzzle from '../assets/ds/tile-puzzle.svg';
import emptyGlobe from '../assets/ds/empty-globe.svg';
import emptyPuzzle from '../assets/ds/empty-puzzle.svg';
import { AllowAllSsoDialog } from './Dialogs';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { AppIcon, SourceBadge, UCheckbox, USwitch } from '../components/uem';
import { cn } from '../components/ui/utils';
import type { CatalogApp } from '../data';

export type KioskMode = 'none' | 'single' | 'multi';

function Pill({ children, onRemove }: { children: React.ReactNode; onRemove?: () => void }) {
  return (
    <span className="flex h-8 items-center gap-1.5 rounded-[4px] border border-line bg-white px-2 text-[13px]">
      {children}
      {onRemove && (
        <button type="button" aria-label="Remove" onClick={onRemove} className="flex border-0 bg-transparent p-0 text-muted">
          <X className="size-3.5" strokeWidth={1.7} />
        </button>
      )}
    </span>
  );
}

/* K1 · K2 · Kiosk ------------------------------------------------------- */
export function KioskSection({
  mode,
  onMode,
  catalog,
  singleApp,
  onSingleApp,
  pickerOpen,
  onAddApps,
  onChange,
  error,
}: {
  mode: KioskMode;
  onMode: (m: KioskMode) => void;
  catalog: CatalogApp[];
  singleApp: string;
  onSingleApp: (id: string) => void;
  pickerOpen?: boolean;
  onAddApps: () => void;
  /** Called for any edit that should count as an unsaved change. */
  onChange?: () => void;
  /** Validation message shown after a blocked submit. */
  error?: string;
}) {
  const [open, setOpen] = React.useState(!!pickerOpen);
  const [home, setHome] = React.useState<Record<string, { show: boolean; dock: boolean }>>({
    slack: { show: true, dock: false }, zoom: { show: false, dock: false }, outlook: { show: true, dock: false },
    crm: { show: true, dock: true }, survey: { show: true, dock: true },
  });
  const [shortcuts, setShortcuts] = React.useState(['Intranet', 'Help desk']);
  const docked = Object.values(home).filter((h) => h.dock).length;
  const current = catalog.find((a) => a.id === singleApp);
  const seg = 'h-10 rounded-none border border-line px-4 text-[14px] text-ink first:rounded-l-[5px] last:rounded-r-[5px] data-[state=on]:border-uem data-[state=on]:bg-uem-soft data-[state=on]:text-uem';

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle sub="Lock devices to one app or a curated home screen">Kiosk</SectionTitle>
      <ProfileFields onChange={onChange} />
      <InfoAlert>Requires a company-owned, supervised iOS device.</InfoAlert>
      <div>
      <div className="flex items-center gap-2 border-b border-row py-3">
        <span className="text-[16px] text-heading">Kiosk Mode</span>
        <Info className="size-4 text-muted" strokeWidth={1.7} />
        <span className="rounded-[10px] bg-[#f5f5f5] px-2 text-[11px] text-muted"> iOS 6 +</span>
        <ToggleGroup type="single" value={mode} onValueChange={(v) => v && onMode(v as KioskMode)} className="ml-auto gap-0 rounded-none">
          <ToggleGroupItem value="none" className={seg}>No Kiosk</ToggleGroupItem>
          <ToggleGroupItem value="single" className={seg}>Single App</ToggleGroupItem>
          <ToggleGroupItem value="multi" className={seg}>Multi App</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {error && (
        <div role="alert" className="mt-3 flex items-center gap-2.5 rounded-[4px] border border-[#f5c6c2] bg-[#fdecea] px-3.5 py-2.5 text-[14px] text-bad">
          <AlertTriangle className="size-4 shrink-0" strokeWidth={1.7} />
          {error}
        </div>
      )}
      {mode === 'single' && (
        <>
          <div className="flex items-start gap-6 border-b border-row py-3.5">
            <div className="grow">
              <span className="text-[16px] text-heading">Application <span className="text-bad">*</span></span>
              <Info className="ml-2 inline size-4 text-muted" strokeWidth={1.7} />
              <p className="mt-1 mb-0 text-[13px] text-muted">Pick one app from this profile's App Catalog</p>
            </div>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button type="button" aria-invalid={!current || undefined} className={cn('flex h-11 w-[380px] items-center gap-3 rounded-[6px] border bg-white px-3 text-[14px]', open ? 'border-uem' : error && !current ? 'border-bad' : 'border-line')}>
                  {current ? (
                    <>
                      <AppIcon initials={current.initials} color={current.color} size={26} />
                      <span className="grow text-left">{current.name}</span>
                      <SourceBadge source={current.source} />
                    </>
                  ) : (
                    <span className="grow text-left text-bad">Pick an app</span>
                  )}
                  {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[380px] rounded-[4px] border-0 bg-white p-0 font-sans shadow-[0_4px_16px_rgba(0,0,0,0.18)]">
                {catalog.map((a) => (
                  <button key={a.id} type="button" onClick={() => { onSingleApp(a.id); setOpen(false); }}
                    className={cn('flex h-11 w-full items-center gap-3 border-0 bg-white px-3 text-[15px] text-ink hover:bg-[#f5f5f5]', a.id === singleApp && 'bg-[#f0f7ff]')}>
                    <AppIcon initials={a.initials} color={a.color} size={26} />
                    <span className="grow text-left">{a.name}</span>
                    <SourceBadge source={a.source} />
                  </button>
                ))}
                <button type="button" onClick={onAddApps} className="flex h-11 w-full items-center gap-2.5 border-0 border-t border-row bg-white px-3 text-[14px] text-uem">
                  <Plus className="size-4" strokeWidth={1.7} /> Add apps in App Catalog
                </button>
              </PopoverContent>
            </Popover>
          </div>
          <p className="mt-5 max-w-[360px] text-[13px] text-muted">
            Device options below (sleep/wake button, volume buttons, auto-lock and the rest) stay as they are today.
          </p>
        </>
      )}

      {mode === 'multi' && (
        <>
          <div className="flex items-center border-b border-row py-2.5">
            <span className="grow text-[16px] text-heading">Web Shortcuts</span>
            <div className="flex h-11 w-[380px] items-center gap-1.5 rounded-[6px] border border-line px-2">
              {shortcuts.map((s) => (
                <Pill key={s} onRemove={() => { setShortcuts((x) => x.filter((y) => y !== s)); onChange?.(); }}>{s}</Pill>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[16px] text-heading">Home screen apps <span className="text-bad">*</span></span>
            <span className="text-[13px] text-muted">from this profile's App Catalog</span>
            <span className={cn('ml-auto rounded-[10px] px-2.5 py-0.5 text-[13px]', docked > 4 ? 'bg-[#fdecea] text-bad' : 'bg-uem-soft text-uem')}>
              Dock: {docked} of 4 used
            </span>
          </div>
          <div className="mt-2 overflow-hidden rounded-[6px] border border-line">
            <Table className="font-sans">
              <TableHeader className="bg-[#fafafa]">
                <TableRow className="border-line">
                  {['App', 'Source', 'Show on home screen', 'Pin to dock'].map((h) => (
                    <TableHead key={h} className="h-10 px-3.5 text-[14px] font-semibold normal-case tracking-normal text-ink">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalog.map((a) => {
                  const h = home[a.id] ?? { show: false, dock: false };
                  return (
                    <TableRow key={a.id} className="border-row">
                      <TableCell className="px-3.5 py-2 text-[15px]">
                        <span className="flex items-center gap-2.5"><AppIcon initials={a.initials} color={a.color} size={24} />{a.name}</span>
                      </TableCell>
                      <TableCell className="px-3.5"><SourceBadge source={a.source} /></TableCell>
                      <TableCell className="px-3.5">
                        <UCheckbox checked={h.show} onCheckedChange={(v) => { setHome((s) => ({ ...s, [a.id]: { show: !!v, dock: v ? h.dock : false } })); onChange?.(); }} aria-label={`Show ${a.name}`} />
                      </TableCell>
                      <TableCell className="px-3.5">
                        <USwitch checked={h.dock} disabled={!h.show || (!h.dock && docked >= 4)} onCheckedChange={(v) => { setHome((s) => ({ ...s, [a.id]: { ...h, dock: v } })); onChange?.(); }} aria-label={`Dock ${a.name}`} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <p className="mt-2 text-[13px] text-muted">
            Apps not shown are hidden and blocked. To offer another app, add it in App Catalog first.
            {docked >= 4 && <span className="block text-[#7b341e]">The dock is full. Unpin an app to pin another.</span>}
          </p>
        </>
      )}

      {mode === 'none' && <p className="mt-6 text-[14px] text-muted">Devices run without Kiosk restrictions.</p>}
      </div>
    </div>
  );
}

/* K3 · Extensible SSO · Figma "Extensible SSO" frame + App Catalog picker ---- */
export function SsoSection({ catalog, allowed, onAllowed, all, onAll, onChange, error }: {
  catalog: CatalogApp[];
  allowed: string[];
  onAllowed: (ids: string[]) => void;
  all: boolean;
  onAll: (v: boolean) => void;
  onChange?: () => void;
  error?: string;
}) {
  const [confirmAll, setConfirmAll] = React.useState(false);
  const [idps, setIdps] = React.useState<string[]>([]);
  const [idpDraft, setIdpDraft] = React.useState('');
  const [bundles, setBundles] = React.useState<string[]>(['com.apple.mobilesafari']);
  const [bundleDraft, setBundleDraft] = React.useState('');
  const [provider, setProvider] = React.useState<'miniorange' | 'custom'>('custom');
  const [open, setOpen] = React.useState(false);
  const copy = (v: string) => <button type="button" aria-label="Copy" onClick={() => navigator.clipboard?.writeText(v)} className="flex border-0 bg-transparent p-0"><Copy className="size-[15px]" strokeWidth={1.7} /></button>;

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle sub="Configure single sign-on settings for your device management">SSO Configuration</SectionTitle>
      <ProfileFields onChange={onChange} />
      <InfoCard title="SSO Authentication Type - Redirect" sub="URL-based authentication flows" />
      {error && <InfoAlert tone="error">{error}</InfoAlert>}

      {/* Redirect Configuration */}
      <SectionHeader icon={tileMail}>Redirect Configuration</SectionHeader>
      <AddRow label="Identity Provider URLs" required info="Where devices send users to sign in" placeholder="https://identity-provider.com" buttonLabel="Add IdP"
        value={idpDraft} onChange={setIdpDraft} onAdd={(v) => { setIdps((x) => [...x, v]); onChange?.(); }} />
      {idps.length === 0 ? (
        <EmptyState icon={emptyGlobe} title="No URLs configured" sub="Add identity provider URLs to enable SSO authentication" />
      ) : (
        <div className="overflow-hidden rounded-[6px] border border-line">
          {idps.map((u) => (
            <div key={u} className="flex items-center gap-3 border-b border-row px-3 py-2.5 text-[14px] last:border-0">
              <Globe className="size-4 text-muted" strokeWidth={1.7} /><span className="grow">{u}</span>
              <button type="button" aria-label={`Remove ${u}`} onClick={() => { setIdps((x) => x.filter((y) => y !== u)); onChange?.(); }} className="flex border-0 bg-transparent p-0 text-muted"><X className="size-4" strokeWidth={1.7} /></button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-5">
        <Field className="grow" label="Organization ID" required info="Your miniOrange organisation" placeholder="org-12345-abcdef" defaultValue="org-48211-mo" trailing={copy('org-48211-mo')} onChange={onChange} />
        <Field className="grow" label="SSO Response URL" required info="Assertion consumer URL" placeholder="https://identity-provider.com/acs" defaultValue="https://login.xecurify.com/moas/acs" trailing={copy('https://login.xecurify.com/moas/acs')} onChange={onChange} />
      </div>

      {/* Apps allowed · picked from App Catalog */}
      <div className="flex flex-col gap-[11px]">
        <FieldLabel required info="Picked from this profile's App Catalog. Other apps are denied SSO access.">Apps allowed to use SSO</FieldLabel>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div role="button" tabIndex={0} aria-invalid={!!error && !all && allowed.length === 0}
              className={cn('relative flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-[6px] border bg-white p-1.5 pr-9', error && !all && allowed.length === 0 ? 'border-bad' : 'border-line', all && 'opacity-50')}>
              {(all ? catalog.map((a) => a.id) : allowed).length === 0 && <span className="px-1 text-[14px] text-placeholder">Pick apps from the App Catalog</span>}
              {(all ? catalog.map((a) => a.id) : allowed).map((id) => {
                const a = catalog.find((x) => x.id === id);
                if (!a) return null;
                return (
                  <Pill key={id} onRemove={all ? undefined : () => { onAllowed(allowed.filter((x) => x !== id)); }}>
                    <AppIcon initials={a.initials} color={a.color} size={20} />{a.name}
                  </Pill>
                );
              })}
              <ChevronDown className="absolute right-2.5 size-4 text-muted" />
            </div>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] rounded-[6px] border border-line bg-white p-1 font-sans shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            {catalog.map((a) => (
              <label key={a.id} className="flex h-10 items-center gap-3 rounded-[4px] px-2 text-[14px] hover:bg-[#f3f3f5]">
                <UCheckbox checked={allowed.includes(a.id)} onCheckedChange={(v) => onAllowed(v ? [...allowed, a.id] : allowed.filter((x) => x !== a.id))} />
                <AppIcon initials={a.initials} color={a.color} size={22} /><span className="grow">{a.name}</span><SourceBadge source={a.source} />
              </label>
            ))}
          </PopoverContent>
        </Popover>
        <label className="flex items-center gap-2.5 text-[14px]">
          <UCheckbox checked={all} onCheckedChange={(v) => (v ? setConfirmAll(true) : onAll(false))} /> Allow every app in this profile's App Catalog
        </label>
        {all && (
          <InfoAlert tone="warn">
            Every app in the catalog can use SSO, including apps added later. The allow list above is ignored while this is on.
            <button type="button" onClick={() => onAll(false)} className="ml-1.5 border-0 bg-transparent p-0 font-semibold text-[#7b341e] underline">Turn off</button>
          </InfoAlert>
        )}
        <AllowAllSsoDialog open={confirmAll} appCount={catalog.length} onCancel={() => setConfirmAll(false)} onConfirm={() => { onAll(true); setConfirmAll(false); }} />
      </div>

      <AddRow label="Other bundle identifiers" info="For apps this profile doesn't install, such as Safari" placeholder="com.yourcompany.app" buttonLabel="Add bundle"
        value={bundleDraft} onChange={setBundleDraft} onAdd={(v) => { setBundles((x) => [...x, v]); onChange?.(); }} />
      {bundles.length === 0 ? (
        <EmptyState icon={emptyPuzzle} title="No bundle identifiers configured" sub="Add apps that are allowed to use SSO authentication" />
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {bundles.map((b) => <Pill key={b} onRemove={() => { setBundles((x) => x.filter((y) => y !== b)); onChange?.(); }}>{b}</Pill>)}
        </div>
      )}

      {/* Extension Details */}
      <SectionHeader icon={tilePuzzle}>Extension Details</SectionHeader>
      <FieldLabel size="md" required info="Which SSO extension signs users in">Provider Type</FieldLabel>
      <div className="flex gap-3">
        <RadioCard name="provider" checked={provider === 'miniorange'} onSelect={() => { setProvider('miniorange'); onChange?.(); }} title="miniorange" sub="Uses the miniOrange SSO extension. No identifiers to enter." />
        <RadioCard name="provider" checked={provider === 'custom'} onSelect={() => { setProvider('custom'); onChange?.(); }} title="Custom" sub="Use your own extension signed with your Apple Developer account." />
      </div>
      {provider === 'custom' && (
        <>
          <div className="flex gap-5">
            <Field className="grow" label="Extension Identifier" required info="Bundle ID of the SSO extension" placeholder="com.yourcompany.app.extension" trailing={copy('')} onChange={onChange} />
            <Field className="grow" label="Team Identifier" required info="Apple Developer Team ID" placeholder="ABC0123456" trailing={copy('')} onChange={onChange} />
          </div>
          <InfoAlert>
            <b className="font-semibold">Apple Developer Configuration:</b> The extension and team identifiers must match your Apple Developer account. Find your Team ID under Membership Details in your Apple Developer account.
          </InfoAlert>
        </>
      )}
    </div>
  );
}
