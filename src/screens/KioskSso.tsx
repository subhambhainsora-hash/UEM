import * as React from 'react';
import { ChevronDown, ChevronUp, Info, Plus, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Input } from '../components/ui/input';
import { AppIcon, SourceBadge, UButton, UCheckbox, USwitch } from '../components/uem';
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
}: {
  mode: KioskMode;
  onMode: (m: KioskMode) => void;
  catalog: CatalogApp[];
  singleApp: string;
  onSingleApp: (id: string) => void;
  pickerOpen?: boolean;
  onAddApps: () => void;
}) {
  const [open, setOpen] = React.useState(!!pickerOpen);
  const [home, setHome] = React.useState<Record<string, { show: boolean; dock: boolean }>>({
    slack: { show: true, dock: false }, zoom: { show: false, dock: false }, outlook: { show: true, dock: false },
    crm: { show: true, dock: true }, survey: { show: true, dock: true },
  });
  const [shortcuts, setShortcuts] = React.useState(['Intranet', 'Help desk']);
  const docked = Object.values(home).filter((h) => h.dock).length;
  const current = catalog.find((a) => a.id === singleApp);
  const seg = 'h-10 rounded-none border border-[#c4c4c4] px-4 text-[14px] text-ink first:rounded-l-[4px] last:rounded-r-[4px] data-[state=on]:border-uem data-[state=on]:bg-uem-soft data-[state=on]:text-uem';

  return (
    <div className="pt-1">
      <h2 className="mt-2 mb-0 text-[20px] font-semibold text-heading">Kiosk</h2>
      <div className="mt-3 flex items-center gap-2.5 rounded-[2px] bg-[#e1f5fe] px-6 py-2 text-[14px] text-[#01579b]">
        <Info className="size-4" strokeWidth={1.7} /> Requires Company Owned iOS Device
      </div>
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
                <button type="button" className={cn('flex h-[42px] w-[380px] items-center gap-3 rounded-[4px] border bg-white px-3 text-[15px]', open ? 'border-2 border-uem' : 'border-[#c4c4c4]')}>
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
            <div className="flex h-[42px] w-[380px] items-center gap-1.5 rounded-[4px] border border-[#c4c4c4] px-2">
              {shortcuts.map((s) => (
                <Pill key={s} onRemove={() => setShortcuts((x) => x.filter((y) => y !== s))}>{s}</Pill>
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
                        <UCheckbox checked={h.show} onCheckedChange={(v) => setHome((s) => ({ ...s, [a.id]: { show: !!v, dock: v ? h.dock : false } }))} aria-label={`Show ${a.name}`} />
                      </TableCell>
                      <TableCell className="px-3.5">
                        <USwitch checked={h.dock} disabled={!h.show || (!h.dock && docked >= 4)} onCheckedChange={(v) => setHome((s) => ({ ...s, [a.id]: { ...h, dock: v } }))} aria-label={`Dock ${a.name}`} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <p className="mt-2 text-[13px] text-muted">Apps not shown are hidden and blocked. To offer another app, add it in App Catalog first.</p>
        </>
      )}

      {mode === 'none' && <p className="mt-6 text-[14px] text-muted">Devices run without Kiosk restrictions.</p>}
    </div>
  );
}

/* K3 · Extensible SSO ---------------------------------------------------- */
export function SsoSection({ catalog, allowed, onAllowed }: { catalog: CatalogApp[]; allowed: string[]; onAllowed: (ids: string[]) => void }) {
  const [all, setAll] = React.useState(false);
  const [bundles, setBundles] = React.useState(['com.apple.mobilesafari']);
  const [draft, setDraft] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const row = 'flex items-center gap-6 border-b border-row py-3';
  return (
    <div className="pt-1">
      <h2 className="mt-2 mb-0 text-[20px] font-semibold text-heading">SSO Configuration</h2>
      <p className="mt-1 mb-0 text-[14px] text-muted">Configure single sign-on settings for your device management</p>
      <div className={row}>
        <span className="grow text-[16px] text-heading">SSO type <Info className="ml-2 inline size-4 text-muted" strokeWidth={1.7} /></span>
        <UButton tone="outline" className="bg-uem-soft">Redirect</UButton>
      </div>
      <div className={cn(row, 'py-4')}>
        <span className="grow text-[16px] text-heading">Extension Details</span>
        <span className="text-[14px]">miniOrange · SSO extension enabled</span>
        <span className="-ml-3 rounded-[10px] bg-[#f5f5f5] px-2 text-[11px] text-muted">unchanged</span>
      </div>
      <div className={row}>
        <span className="grow text-[16px] text-heading">Identity Provider URLs</span>
        <Input defaultValue="https://identity-provider.com/sso" className="h-[42px] w-[420px] rounded-[4px] border-[#c4c4c4] bg-white text-[15px]" />
      </div>
      <div className="flex items-start gap-6 border-b border-row py-3.5">
        <div className="grow">
          <span className="text-[16px] text-heading">Apps allowed to use SSO <span className="text-bad">*</span></span>
          <Info className="ml-2 inline size-4 text-muted" strokeWidth={1.7} />
          <p className="mt-1 mb-0 max-w-[300px] text-[13px] text-muted">Picked from this profile's App Catalog. Other apps are denied SSO access.</p>
        </div>
        <div className="w-[420px]">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div role="button" tabIndex={0} className={cn('flex min-h-[42px] w-full flex-wrap items-center gap-1.5 rounded-[4px] border border-[#c4c4c4] p-1.5 pr-8 relative', all && 'opacity-50')}>
                {(all ? catalog.map((a) => a.id) : allowed).map((id) => {
                  const a = catalog.find((x) => x.id === id);
                  if (!a) return null;
                  return (
                    <Pill key={id} onRemove={all ? undefined : () => onAllowed(allowed.filter((x) => x !== id))}>
                      <AppIcon initials={a.initials} color={a.color} size={20} />
                      {a.name}
                    </Pill>
                  );
                })}
                <ChevronDown className="absolute right-2.5 size-4" />
              </div>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[420px] rounded-[4px] border-0 bg-white p-1 font-sans shadow-[0_4px_16px_rgba(0,0,0,0.18)]">
              {catalog.map((a) => (
                <label key={a.id} className="flex h-10 items-center gap-3 px-2 text-[14px] hover:bg-[#f5f5f5]">
                  <UCheckbox checked={allowed.includes(a.id)} onCheckedChange={(v) => onAllowed(v ? [...allowed, a.id] : allowed.filter((x) => x !== a.id))} />
                  <AppIcon initials={a.initials} color={a.color} size={22} />
                  <span className="grow">{a.name}</span>
                  <SourceBadge source={a.source} />
                </label>
              ))}
            </PopoverContent>
          </Popover>
          <label className="mt-3 flex items-center gap-2.5 text-[14px]">
            <UCheckbox checked={all} onCheckedChange={(v) => setAll(!!v)} /> Allow every app in this profile's App Catalog
          </label>
        </div>
      </div>
      <div className="flex items-start gap-6 py-3.5">
        <div className="grow">
          <span className="text-[16px] text-heading">Other bundle IDs <span className="text-[14px] text-muted">(optional)</span></span>
          <p className="mt-1 mb-0 text-[13px] text-muted">For apps this profile doesn't install, such as Safari</p>
        </div>
        <div className="flex min-h-[44px] w-[420px] flex-wrap items-center gap-1.5 rounded-[4px] border border-[#c4c4c4] p-1.5">
          {bundles.map((b) => (
            <Pill key={b} onRemove={() => setBundles((x) => x.filter((y) => y !== b))}>{b}</Pill>
          ))}
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && draft.trim()) { setBundles((x) => [...x, draft.trim()]); setDraft(''); } }}
            placeholder="Add bundle ID"
            className="min-w-[120px] grow border-0 bg-transparent px-1 text-[14px] outline-none"
          />
        </div>
      </div>
    </div>
  );
}
