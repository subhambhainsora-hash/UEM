import * as React from 'react';
import { Plus, SlidersHorizontal, Trash2 } from 'lucide-react';
import emptyGlobe from '../assets/ds/empty-globe.svg';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { AppIcon, Chip, CountBadge, SigningBadge, UButton } from '../components/uem';
import { cn } from '../components/ui/utils';
import { plural, profile, signingState, type CatalogApp } from '../data';
import { EmptyState, InfoAlert, ProfileFields, SectionTitle, StateChip, UndoRow, tabListClass, tabTriggerClass } from '../components/ds';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock, SlidersHorizontal as Sliders } from 'lucide-react';
import { installCounts, licenceLabel, type VppApp } from '../vpp';
import type { TokenState } from '../vpp';

export type SourceTab = 'store' | 'enterprise' | 'vpp';

export interface RemovalImpact { kiosk: boolean; sso: boolean }

function AppRow({ app, onConfigure, onRemove, flag, state, confirming, impact, onConfirmRemove, onCancelRemove }: {
  app: CatalogApp; onConfigure: () => void; onRemove: () => void; flag?: boolean; state?: 'new' | 'edited' | null;
  confirming?: boolean; impact?: RemovalImpact; onConfirmRemove?: () => void; onCancelRemove?: () => void;
}) {
  const signing = app.source === 'Enterprise' ? signingState(app.signingExpires) : null;
  const blocked = signing?.kind === 'expired';
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => { if (confirming) cancelRef.current?.focus(); }, [confirming]);
  const stop = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn(); };
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={confirming ? undefined : onConfigure}
      onKeyDown={(e) => { if (!confirming && (e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) { e.preventDefault(); onConfigure(); } }}
      aria-label={`${app.name} settings`}
      className={cn('group -mx-3 flex flex-col border-b border-row px-3 py-2.5 transition-colors', !confirming && 'cursor-pointer hover:bg-[#fafafa]', flag && blocked && 'rounded-[4px] border border-[#f5c6c2] bg-[#fdecea]/60', state === 'new' && 'bg-[#fffdf3]')}
    >
      <div className="flex min-h-[52px] items-center gap-3.5">
        <AppIcon logo={app.logo} name={app.name} color={app.color} />
        <span className="flex min-w-[150px] grow flex-col gap-0.5">
          <span className="flex items-center gap-2 text-[15px] font-semibold text-heading">{app.name}<StateChip state={state} /></span>
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
        <UButton tone="link" onClick={stop(onConfigure)} className="shrink-0">
          <SlidersHorizontal strokeWidth={1.7} />
          Configure
        </UButton>
        <button
          type="button"
          aria-label={`Remove ${app.name}`}
          title="Remove from this profile"
          onClick={stop(onRemove)}
          className={cn('flex size-9 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-bad hover:bg-[#fdecea]', confirming && 'bg-[#fdecea]')}
        >
          <Trash2 className="size-[18px]" strokeWidth={1.7} />
        </button>
      </div>
      {confirming && (
        <div role="alert" onClick={(e) => e.stopPropagation()} className="flex flex-col gap-2 pb-1 pl-[56px] text-[13px] text-muted">
          <span className="min-w-0">
            Remove {app.name}? {plural(profile.deviceCount, 'device')} uninstall it after you submit.
            {impact?.kiosk && <> <b className="font-semibold text-[#7b341e]">Kiosk is locked to this app</b>: pick another before you submit.</>}
            {impact?.sso && <> It also leaves the Extensible SSO allow list.</>}
          </span>
          <span className="flex flex-wrap gap-2">
            <UButton tone="danger" size="sm" onClick={onConfirmRemove}><Trash2 strokeWidth={1.7} />Remove</UButton>
            <UButton ref={cancelRef} tone="neutral" size="sm" onClick={onCancelRemove}>Cancel</UButton>
          </span>
        </div>
      )}
    </div>
  );
}

/** Catalog entries that come from Apps and Books, paired with their licence pool. */
function catalogVpp(_ent: CatalogApp[], apps: VppApp[]) { return apps; }

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
  stateOf,
  confirming,
  impactOf,
  onConfirmRemove,
  onCancelRemove,
  undo,
  onUndo,
  pendingCountry,
  onKeepCountry,
  onSwitchCountry,
  vppToken = 'connected',
  vppApps = [],
  onAddVpp,
  vppCount = 0,
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
  /** New / edited since the last submit. */
  stateOf?: (a: CatalogApp) => 'new' | 'edited' | null;
  /** The app whose removal is being confirmed inline. */
  confirming?: string | null;
  impactOf?: (a: CatalogApp) => RemovalImpact;
  onConfirmRemove?: (a: CatalogApp) => void;
  onCancelRemove?: () => void;
  /** The app just removed, so the list can offer Undo where the row was. */
  undo?: { app: CatalogApp } | null;
  onUndo?: () => void;
  /** A country change waiting for confirmation; the consequence is shown under the toolbar. */
  pendingCountry?: string | null;
  onKeepCountry?: () => void;
  onSwitchCountry?: () => void;
  /** VPP: whether Apps and Books is connected, and which licensed apps back the catalog entries. */
  vppToken?: TokenState;
  vppApps?: VppApp[];
  onAddVpp?: () => void;
  vppCount?: number;
}) {
  const vppRows = catalogVpp(enterpriseApps, vppApps);
  const row = (a: CatalogApp, flag?: boolean) => (
    <AppRow key={a.id} app={a} flag={flag} state={stateOf?.(a)} confirming={confirming === a.id} impact={impactOf?.(a)}
      onConfigure={() => onConfigure(a)} onRemove={() => onRemove(a)} onConfirmRemove={() => onConfirmRemove?.(a)} onCancelRemove={onCancelRemove} />
  );
  const undoRow = (source: CatalogApp['source']) => undo && undo.app.source === source && (
    <div className="pt-2.5"><UndoRow onUndo={() => onUndo?.()}>Removed: <span className="text-ink">{undo.app.name}</span>. {source === 'VPP' ? 'Its licences return to your VPP account after you submit.' : `${plural(profile.deviceCount, 'device')} uninstall it after you submit.`}</UndoRow></div>
  );
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
          VPP <CountBadge n={vppCount} active={tab === 'vpp'} />
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
                value={pendingCountry ?? country}
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
        {pendingCountry && (
          <div role="alert" className="mt-3 flex flex-col gap-2 rounded-[6px] bg-[#fff3e0] px-3.5 py-3 text-[13px] text-[#7b341e]">
            <span><b className="font-semibold">Switch App Store country to {pendingCountry}?</b> We checked the {storeApps.length + 1} App Store apps in {profile.name} against the {pendingCountry} App Store. Devices keep apps sold in both stores and nothing is reinstalled; in-house apps aren't affected.</span>
            <span className="flex items-center gap-2.5 rounded-[4px] bg-white/70 px-3 py-2 text-ink"><AppIcon color="#455a64" size={24} /><span className="font-semibold">Contoso Payroll</span><span className="text-muted">isn't sold in {pendingCountry}: {plural(profile.deviceCount, 'device')} uninstall it at next check-in after you submit.</span></span>
            <span className="flex flex-wrap gap-2">
              <UButton size="sm" onClick={onSwitchCountry}>Remove 1 app and switch</UButton>
              <UButton tone="neutral" size="sm" autoFocus onClick={onKeepCountry}>Keep {country}</UButton>
            </span>
          </div>
        )}
        <p className="mt-2 mb-0 text-[14px] text-muted">
          Installed on every device that uses this profile. Without VPP, users sign in with an Apple ID when asked. The miniOrange agent is
          always installed first.
        </p>
        <div className="mt-3.5 flex flex-col">
          {storeApps.length === 0 && (
            <p className="py-10 text-center text-[14px] text-muted">No App Store apps yet. Add apps to install them on every device in this profile.</p>
          )}
          {storeApps.map((a) => row(a))}
          {undoRow('App Store')}
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
          {enterpriseApps.length === 0 && (
            <p className="py-10 text-center text-[14px] text-muted">No in-house apps yet. Add one from App Groups, or upload an .ipa.</p>
          )}
          {enterpriseApps.map((a) => row(a, showIssues))}
          {undoRow('Enterprise')}
        </div>
      </TabsContent>

      <TabsContent value="vpp" className="pt-[22px]">
        {vppToken === 'none' ? (
          <EmptyState icon={emptyGlobe} title="Connect a VPP token first" sub="Upload the .vpptoken from Apple Business Manager to add purchased apps to this profile."
            action={<UButton size="lg" className="mt-2" asChild><Link to="/v1">Open Apple VPP Token</Link></UButton>} />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="m-0 text-[18px] font-semibold text-heading">VPP apps</h3>
              <UButton size="lg" onClick={onAddVpp}><Plus strokeWidth={1.7} />Add VPP apps</UButton>
            </div>
            <p className="mt-2 mb-0 text-[14px] text-muted">Apps purchased in Apple Business Manager. A licence is assigned and the app installs silently when a device enrols with this profile; no Apple ID prompt.</p>
            {(vppToken === 'expired' || vppToken === 'revoked') && <div className="mt-3"><InfoAlert tone="error">The VPP token is {vppToken}. Licence assignment and installs are paused until it is updated. <Link to="/v3" className="font-semibold text-bad underline">Open Apple VPP Token</Link></InfoAlert></div>}
            <div className="mt-3.5 flex flex-col">
              {vppRows.length === 0 && (
                <EmptyState icon={emptyGlobe} title="No VPP apps added" sub="Add apps from your VPP licences to install them on devices using this profile." className="mt-2" action={<UButton tone="outline" size="lg" className="mt-2" onClick={onAddVpp}><Plus strokeWidth={1.7} />Add VPP apps</UButton>} />
              )}
              {vppRows.map((v) => {
                const entry: CatalogApp = { id: `vpp-${v.id}`, name: v.name, bundleId: v.bundleId, initials: v.name.slice(0, 2), color: v.color, logo: v.logo, source: 'VPP', chips: [], vppId: v.id };
                const c = installCounts(v);
                return (
                  <div key={v.id} className={cn('group -mx-3 flex flex-col border-b border-row px-3 py-2.5 transition-colors', confirming !== entry.id && 'cursor-pointer hover:bg-[#fafafa]', stateOf?.(entry) === 'new' && 'bg-[#fffdf3]')}
                    role="button" tabIndex={0} aria-label={`${v.name} settings`} onClick={() => confirming !== entry.id && onConfigure(entry)} onKeyDown={(e) => { if (confirming !== entry.id && (e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) { e.preventDefault(); onConfigure(entry); } }}>
                    <div className="flex min-h-[52px] items-center gap-3.5">
                      <AppIcon logo={v.logo} name={v.name} color={v.color} />
                      <span className="flex min-w-[150px] grow flex-col gap-0.5">
                        <span className="flex items-center gap-2 text-[15px] font-semibold text-heading">{v.name}<StateChip state={stateOf?.(entry)} /></span>
                        <span className="text-[13px] text-muted">{v.bundleId}</span>
                      </span>
                      {v.assignments.length > 0 && (
                        <span className="flex items-center gap-3 text-[12px] whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[#006644]"><CheckCircle2 className="size-3.5" strokeWidth={2} />{c.installed} installed</span>
                          <span className="inline-flex items-center gap-1 text-[#7a5a00]"><Clock className="size-3.5" strokeWidth={2} />{c.pending} pending</span>
                          <span className={cn('inline-flex items-center gap-1', c.failed ? 'text-bad' : 'text-muted')}><AlertTriangle className="size-3.5" strokeWidth={2} />{c.failed} failed</span>
                        </span>
                      )}
                      <span className={cn('text-[13px] whitespace-nowrap', v.available === 0 ? 'font-semibold text-[#7b341e]' : 'text-muted')}>{licenceLabel(v)}</span>
                      <UButton tone="link" onClick={(e) => { e.stopPropagation(); onConfigure(entry); }} className="shrink-0"><Sliders strokeWidth={1.7} />Configure</UButton>
                      <button type="button" aria-label={`Remove ${v.name}`} title="Remove from this profile" onClick={(e) => { e.stopPropagation(); onRemove(entry); }} className={cn('flex size-9 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-bad hover:bg-[#fdecea]', confirming === entry.id && 'bg-[#fdecea]')}><Trash2 className="size-[18px]" strokeWidth={1.7} /></button>
                    </div>
                    {v.available === 0 && <p className="m-0 pb-1 pl-[56px] text-[13px] text-[#7b341e]">No licences available. Buy more in Apple Business Manager, or new devices won't get this app.</p>}
                    {v.userLicenseOnly && <p className="m-0 pb-1 pl-[56px] text-[13px] text-muted">Device licences aren't offered for this app. Only User Enrollment devices receive it.</p>}
                    {confirming === entry.id && (
                      <div role="alert" onClick={(e) => e.stopPropagation()} className="flex flex-col gap-2 pb-1 pl-[56px] text-[13px] text-muted">
                        <span>Remove {v.name}? After you submit, it is removed from {plural(c.installed + c.pending, 'device')} using this profile and {plural(c.installed + c.pending, 'licence')} return to your VPP account. Users whose other devices still need it keep their licence.</span>
                        <span className="flex flex-wrap gap-2">
                          <UButton tone="danger" size="sm" onClick={() => onConfirmRemove?.(entry)}><Trash2 strokeWidth={1.7} />Remove</UButton>
                          <UButton tone="neutral" size="sm" autoFocus onClick={onCancelRemove}>Cancel</UButton>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              {undoRow('VPP')}
            </div>
          </>
        )}
      </TabsContent>
    </Tabs>
    </div>
  );
}
