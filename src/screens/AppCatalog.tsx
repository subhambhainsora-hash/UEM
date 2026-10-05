import { CalendarCheck, Plus, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { AppIcon, Chip, CountBadge, LaterBadge, UButton } from '../components/uem';
import type { CatalogApp } from '../data';

export type SourceTab = 'store' | 'enterprise' | 'vpp';

function AppRow({ app, onConfigure, onRemove }: { app: CatalogApp; onConfigure: () => void; onRemove: () => void }) {
  return (
    <div className="flex min-h-[72px] items-center gap-3.5 border-b border-row py-2.5">
      <AppIcon initials={app.initials} color={app.color} />
      <span className="flex min-w-[150px] grow flex-col gap-0.5">
        <span className="text-[16px] font-medium text-heading">{app.name}</span>
        <span className="text-[13px] text-muted">
          {app.bundleId}
          {app.meta ? ` · ${app.meta}` : ''}
        </span>
      </span>
      <span className="flex max-w-[280px] flex-wrap justify-end gap-1.5">
        {app.chips.map((c) => (
          <Chip key={c}>{c}</Chip>
        ))}
      </span>
      <UButton tone="neutral" onClick={onConfigure} className="shrink-0">
        <SlidersHorizontal strokeWidth={1.7} />
        Configure
      </UButton>
      <button
        type="button"
        aria-label={`Remove ${app.name}`}
        onClick={onRemove}
        className="flex size-9 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-bad hover:bg-[#fdecea]"
      >
        <Trash2 className="size-[18px]" strokeWidth={1.7} />
      </button>
    </div>
  );
}

const tabClass =
  'h-[50px] flex-none gap-2 rounded-none border-0 border-b-2 border-transparent bg-transparent px-5 text-[16px] font-normal text-ink shadow-none ' +
  'data-[state=active]:border-uem data-[state=active]:bg-transparent data-[state=active]:font-medium data-[state=active]:text-uem data-[state=active]:shadow-none';

export function AppCatalogSection({
  tab,
  onTab,
  storeApps,
  enterpriseApps,
  country,
  onCountry,
  onAddStore,
  onAddInhouse,
  onConfigure,
  onRemove,
}: {
  tab: SourceTab;
  onTab: (t: SourceTab) => void;
  storeApps: CatalogApp[];
  enterpriseApps: CatalogApp[];
  country: string;
  onCountry: (c: string) => void;
  onAddStore: () => void;
  onAddInhouse: () => void;
  onConfigure: (a: CatalogApp) => void;
  onRemove: (a: CatalogApp) => void;
}) {
  return (
    <Tabs value={tab} onValueChange={(v) => onTab(v as SourceTab)} className="gap-0">
      <TabsList aria-label="App sources" className="h-auto w-full justify-start rounded-none border-b border-line bg-transparent p-0">
        <TabsTrigger value="store" className={tabClass}>
          App Store <CountBadge n={storeApps.length} active={tab === 'store'} />
        </TabsTrigger>
        <TabsTrigger value="enterprise" className={tabClass}>
          Enterprise <CountBadge n={enterpriseApps.length} active={tab === 'enterprise'} />
        </TabsTrigger>
        <TabsTrigger value="vpp" className={tabClass}>
          VPP <LaterBadge />
        </TabsTrigger>
      </TabsList>

      <TabsContent value="store" className="pt-[22px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="m-0 text-[22px] font-medium text-heading">App Store apps</h2>
          <div className="flex items-center gap-3">
            <div className="relative w-[200px]">
              <label htmlFor="country" className="absolute -top-2 left-2.5 bg-white px-1 text-[12px] text-muted">
                App Store country
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => onCountry(e.target.value)}
                className="h-10 w-[200px] rounded-[4px] border border-[#c4c4c4] bg-white px-3 text-[15px] text-ink"
              >
                <option>United States</option>
                <option>India</option>
                <option>United Kingdom</option>
              </select>
            </div>
            <UButton size="lg" onClick={onAddStore}>
              <Plus strokeWidth={1.7} />
              Add apps
            </UButton>
          </div>
        </div>
        <p className="mt-2 mb-0 text-[14px] text-muted">
          Installed on every device that uses this profile. Without VPP, users sign in with an Apple ID when asked. The miniOrange agent is
          always installed first.
        </p>
        <div className="mt-3.5 flex flex-col">
          {storeApps.length === 0 && (
            <p className="py-10 text-center text-[14px] text-muted">No App Store apps yet. Add apps to install them on every device in this profile.</p>
          )}
          {storeApps.map((a) => (
            <AppRow key={a.id} app={a} onConfigure={() => onConfigure(a)} onRemove={() => onRemove(a)} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="enterprise" className="pt-[22px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="m-0 text-[22px] font-medium text-heading">Enterprise apps</h2>
          <UButton size="lg" onClick={onAddInhouse}>
            <Plus strokeWidth={1.7} />
            Add in-house app
          </UButton>
        </div>
        <p className="mt-2 mb-0 text-[14px] text-muted">Your organisation's own apps. Devices always get the newest available build.</p>
        <div className="mt-3.5 flex flex-col">
          {enterpriseApps.map((a) => (
            <AppRow key={a.id} app={a} onConfigure={() => onConfigure(a)} onRemove={() => onRemove(a)} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="vpp">
        <div className="flex flex-col items-center pt-14 text-center">
          <span className="flex size-[72px] items-center justify-center rounded-full bg-[#f3eefc] text-later">
            <CalendarCheck className="size-6" strokeWidth={1.7} />
          </span>
          <h2 className="mt-4 mb-0 text-[21px] font-medium text-heading">VPP apps come with Apps and Books</h2>
          <p className="mt-3 mb-0 max-w-[440px] text-[14px] text-muted">
            Connect an Apps and Books location token to assign licences and install App Store apps silently, with no Apple ID prompt.
          </p>
          <UButton tone="disabled" size="lg" disabled className="mt-4 disabled:bg-[#e0e0e0] disabled:text-[#757575]">
            Add VPP apps
          </UButton>
        </div>
      </TabsContent>
    </Tabs>
  );
}
