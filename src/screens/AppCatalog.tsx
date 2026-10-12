import { Plus, SlidersHorizontal, Trash2 } from 'lucide-react';
import emptyGlobe from '../assets/ds/empty-globe.svg';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { AppIcon, Chip, CountBadge, LaterBadge, SigningBadge, UButton } from '../components/uem';
import { cn } from '../components/ui/utils';
import { signingState, type CatalogApp } from '../data';
import { EmptyState, ProfileFields, SectionTitle, tabListClass, tabTriggerClass } from '../components/ds';

export type SourceTab = 'store' | 'enterprise' | 'vpp';

function AppRow({ app, onConfigure, onRemove, flag }: { app: CatalogApp; onConfigure: () => void; onRemove: () => void; flag?: boolean }) {
  const signing = app.source === 'Enterprise' ? signingState(app.signingExpires) : null;
  const blocked = signing?.kind === 'expired';
  return (
    <div className={cn('flex min-h-[72px] items-center gap-3.5 border-b border-row py-2.5', flag && blocked && '-mx-3 rounded-[4px] border border-[#f5c6c2] bg-[#fdecea]/60 px-3')}>
      <AppIcon logo={app.logo} name={app.name} color={app.color} />
      <span className="flex min-w-[150px] grow flex-col gap-0.5">
        <span className="text-[15px] font-semibold text-heading">{app.name}</span>
        <span className="text-[13px] text-muted">
          {app.bundleId}
          {app.meta ? ` · ${app.meta}` : ''}
        </span>
      </span>
      <span className="flex max-w-[300px] flex-wrap justify-end gap-1.5">
        {signing && signing.kind !== 'ok' && signing.kind !== 'none' && <SigningBadge expires={app.signingExpires} short />}
        {app.chips.map((c) => (
          <Chip key={c}>{c}</Chip>
        ))}
      </span>
      <UButton tone="link" onClick={onConfigure} className="shrink-0">
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
  showIssues,
  onChange,
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
  /** After a blocked submit, highlight apps that can't install. */
  showIssues?: boolean;
  onChange?: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
    <SectionTitle sub="Apps installed on every device that uses this profile">App Catalog</SectionTitle>
    <ProfileFields onChange={onChange} />
    <Tabs value={tab} onValueChange={(v) => onTab(v as SourceTab)} className="gap-0">
      <TabsList aria-label="App sources" className={tabListClass}>
        <TabsTrigger value="store" className={tabTriggerClass}>
          App Store <CountBadge n={storeApps.length} active={tab === 'store'} />
        </TabsTrigger>
        <TabsTrigger value="enterprise" className={tabTriggerClass}>
          Enterprise <CountBadge n={enterpriseApps.length} active={tab === 'enterprise'} />
        </TabsTrigger>
        <TabsTrigger value="vpp" className={tabTriggerClass}>
          VPP <LaterBadge />
        </TabsTrigger>
      </TabsList>

      <TabsContent value="store" className="pt-[22px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="m-0 text-[18px] font-semibold text-heading">App Store apps</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <label htmlFor="country" className="text-[14px] font-semibold text-heading">App Store country</label>
              <select
                id="country"
                value={country}
                onChange={(e) => onCountry(e.target.value)}
                className="h-10 w-[180px] rounded-[6px] border border-line bg-white px-2.5 text-[14px] text-ink"
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
          <h3 className="m-0 text-[18px] font-semibold text-heading">Enterprise apps</h3>
          <UButton size="lg" onClick={onAddInhouse}>
            <Plus strokeWidth={1.7} />
            Add in-house app
          </UButton>
        </div>
        <p className="mt-2 mb-0 text-[14px] text-muted">Your organisation's own apps. Devices always get the newest available build.</p>
        <div className="mt-3.5 flex flex-col">
          {enterpriseApps.map((a) => (
            <AppRow key={a.id} app={a} onConfigure={() => onConfigure(a)} onRemove={() => onRemove(a)} flag={showIssues} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="vpp">
        <div className="pt-5">
          <EmptyState
            icon={emptyGlobe}
            title="VPP apps come with Apps and Books"
            sub="Connect an Apps and Books location token to assign licences and install App Store apps silently, with no Apple ID prompt."
            action={<UButton tone="outline" size="lg" disabled className="mt-2">Connect Apps and Books · coming later</UButton>}
          />
        </div>
      </TabsContent>
    </Tabs>
    </div>
  );
}
