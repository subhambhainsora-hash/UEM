import * as React from 'react';
import { AlertTriangle, ChevronDown, ChevronRight, Link2, MoreVertical, Search, Upload } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { AppIcon, CountBadge, LaterBadge, SigningBadge, UButton } from '../components/uem';
import { cn } from '../components/ui/utils';
import { libraryApps, plural, signingState, type Build } from '../data';
import { tabListClass, tabTriggerClass } from '../components/ds';
import { LastBuildDialog, RetireDialog } from './Dialogs';

/* L1 · App Library page (replaces App Groups) */
export function AppLibraryPage() {
  const [openRow, setOpenRow] = React.useState<string | null>('crm');
  const [q, setQ] = React.useState('');
  const [builds, setBuilds] = React.useState<Record<string, Build[]>>(Object.fromEntries(libraryApps.map((a) => [a.id, a.builds])));
  const [pending, setPending] = React.useState<{ app: string; version: string } | null>(null);
  const [lastBuild, setLastBuild] = React.useState<{ app: string; version: string } | null>(null);

  const rows = libraryApps.filter((a) => (a.name + a.bundleId).toLowerCase().includes(q.toLowerCase()));
  const expired = libraryApps.filter((a) => signingState(a.signingExpires).kind === 'expired');
  const expiring = libraryApps.filter((a) => signingState(a.signingExpires).kind === 'expiring');

  const askRetire = (appId: string, version: string) => {
    const available = builds[appId].filter((b) => b.status === 'Available');
    if (available.length <= 1) { setLastBuild({ app: appId, version }); return; }
    setPending({ app: appId, version });
  };
  const setStatus = (appId: string, version: string, status: Build['status']) =>
    setBuilds((b) => ({ ...b, [appId]: b[appId].map((x) => (x.version === version ? { ...x, status } : x)) }));

  const th = 'px-4 py-3 text-left text-[14px] font-semibold';
  const pendingApp = libraryApps.find((a) => a.id === pending?.app);
  const fallback = pending ? builds[pending.app].find((b) => b.status === 'Available' && b.version !== pending.version)?.version ?? '' : '';

  return (
    <AppShell page="library">
      <div className="flex min-h-0 grow flex-col overflow-y-auto px-[50px] pt-8 pb-4">
        <h1 className="m-0 text-[24px] leading-8 font-bold text-heading">Applications</h1>
        <p className="mt-1.5 mb-0 text-[15px] text-muted">
          In-house apps your iOS profiles can install. Upload builds and roll back here; add apps to devices from a profile's App Catalog.
        </p>
        {(expired.length > 0 || expiring.length > 0) && (
          <div role="status" className="mt-4 flex items-start gap-2.5 rounded-[4px] border border-[#f5d8b8] bg-[#fff3e0] px-3.5 py-2.5 text-[14px] text-[#7b341e]">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={1.7} />
            <span>
              {expired.length > 0 && <><b className="font-semibold">{plural(expired.length, 'app')} can't install</b> because the signing profile has expired: {expired.map((a) => a.name).join(', ')}. Devices keep the installed copy, but new devices get nothing. </>}
              {expiring.length > 0 && <>{plural(expiring.length, 'app')} expires within 60 days: {expiring.map((a) => `${a.name} (${signingState(a.signingExpires).label})`).join(', ')}. Upload a re-signed build before then.</>}
            </span>
          </div>
        )}
        <Tabs defaultValue="inhouse" className="mt-4 gap-0">
          <TabsList className={tabListClass}>
            <TabsTrigger value="inhouse" className={tabTriggerClass}>In-house apps <CountBadge n={libraryApps.length} active /></TabsTrigger>
            <TabsTrigger value="vpp" className={tabTriggerClass}>VPP licences <LaterBadge /></TabsTrigger>
          </TabsList>
          <TabsContent value="inhouse">
            <div className="mt-5 flex items-center gap-3">
              <label className="flex h-10 w-[340px] items-center gap-2.5 rounded-[6px] border border-line px-3">
                <Search className="size-4 text-muted" strokeWidth={1.7} />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or bundle ID" className="h-auto border-0 bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0" />
              </label>
              <span className="grow" />
              <UButton tone="outline" size="lg"><Link2 strokeWidth={1.7} />Add by manifest URL</UButton>
              <UButton size="lg"><Upload strokeWidth={1.7} />Upload .ipa</UButton>
            </div>
            <div className="mt-4 overflow-hidden rounded-[6px] border border-line">
              <table className="w-full border-collapse font-sans">
                <thead className="bg-[#fafafa]">
                  <tr>
                    <th className={cn(th, 'pl-[56px]')}>App</th><th className={th}>Bundle ID</th><th className={th}>Latest build</th>
                    <th className={th}>Delivery</th><th className={th}>Signing expires</th><th className={th}>Used by</th><th className="w-12" />
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-10 text-center text-[14px] text-muted">No apps match "{q}". Check the bundle ID, or upload the app.</td></tr>
                  )}
                  {rows.map((a) => {
                    const open = openRow === a.id;
                    const list = builds[a.id];
                    const latest = list.find((b) => b.status === 'Available')?.version ?? 'none';
                    return (
                      <React.Fragment key={a.id}>
                        <tr className={cn('border-t border-row text-[14px]', open && 'bg-[#f0f7ff]')}>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-3">
                              <button type="button" aria-label={open ? 'Hide builds' : 'Show builds'} aria-expanded={open} onClick={() => setOpenRow(open ? null : a.id)} className="flex border-0 bg-transparent p-0 text-ink">
                                {open ? <ChevronDown className="size-4 rotate-180" /> : <ChevronRight className="size-4" />}
                              </button>
                              <AppIcon logo={a.logo} name={a.name} color={a.color} size={32} />
                              <span className="text-[15px] font-semibold">{a.name}</span>
                            </span>
                          </td>
                          <td className="px-4 text-muted">{a.bundleId}</td>
                          <td className="px-4">{latest}</td>
                          <td className="px-4"><span className="rounded-[10px] bg-[#f5f5f5] px-2 py-0.5 text-[12px]">{a.delivery}</span></td>
                          <td className="px-4"><SigningBadge expires={a.signingExpires} /></td>
                          <td className="px-4">
                            {a.usedBy.profiles ? (
                              <a href="#" onClick={(e) => e.preventDefault()} className="text-uem underline">{plural(a.usedBy.profiles, 'profile')}</a>
                            ) : <span className="text-muted">Not used</span>}
                            {a.usedBy.profiles > 0 && <span className="ml-1.5 text-[12px] text-muted">· {plural(a.usedBy.devices, 'device')}</span>}
                          </td>
                          <td className="px-2"><button type="button" aria-label={`More actions for ${a.name}`} className="flex border-0 bg-transparent"><MoreVertical className="size-4" /></button></td>
                        </tr>
                        {open && (
                          <tr className="bg-white">
                            <td colSpan={7} className="pt-3 pr-4 pb-4 pl-[60px]">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-[14px] font-semibold">Builds</span>
                                <UButton tone="outline" size="sm"><Upload strokeWidth={1.7} />Add build</UButton>
                              </div>
                              <div className="overflow-hidden rounded-[6px] border border-line">
                                {list.map((b) => {
                                  const only = b.status === 'Available' && list.filter((x) => x.status === 'Available').length === 1;
                                  return (
                                    <div key={b.version} className="flex items-center gap-6 border-b border-row px-3.5 py-2 text-[13px] last:border-0">
                                      <span className="w-12 font-semibold">{b.version}</span>
                                      <span className={cn('rounded-[10px] px-2 py-px', b.status === 'Available' ? 'bg-[#e8f5e9] text-ok' : 'bg-[#f5f5f5] text-muted')}>{b.status}</span>
                                      <span className="grow text-muted">
                                        {b.status === 'Available' ? `Devices get this build · uploaded ${b.uploaded}` : 'Restore to roll devices back to this build'}
                                        {only && <span className="ml-2 text-[#7b341e]">· only available build</span>}
                                      </span>
                                      <UButton tone="outline" size="sm" onClick={() => (b.status === 'Available' ? askRetire(a.id, b.version) : setStatus(a.id, b.version, 'Available'))}>
                                        {b.status === 'Available' ? 'Retire' : 'Restore'}
                                      </UButton>
                                    </div>
                                  );
                                })}
                              </div>
                              <p className="mt-2 mb-0 text-[13px] text-[#7b341e]">
                                {a.usedBy.profiles
                                  ? `Retiring or restoring a build changes what ${plural(a.usedBy.devices, 'device')} in ${plural(a.usedBy.profiles, 'profile')} get at next check-in.`
                                  : 'No profile uses this app yet, so build changes don’t reach any device.'}
                              </p>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[13px] text-muted">Showing {rows.length} of {libraryApps.length} apps</p>
          </TabsContent>
          <TabsContent value="vpp" className="pt-10 text-center text-[14px] text-muted">VPP licences arrive with Apps and Books.</TabsContent>
        </Tabs>
      </div>
      <RetireDialog
        open={!!pending}
        appName={pendingApp?.name ?? ''}
        version={pending?.version ?? ''}
        fallback={fallback}
        profiles={pendingApp?.usedBy.profiles ?? 0}
        devices={pendingApp?.usedBy.devices ?? 0}
        onKeep={() => setPending(null)}
        onRetire={() => { if (pending) setStatus(pending.app, pending.version, 'Retired'); setPending(null); }}
      />
      <LastBuildDialog open={!!lastBuild} appName={libraryApps.find((a) => a.id === lastBuild?.app)?.name ?? ''} version={lastBuild?.version ?? ''} onClose={() => setLastBuild(null)} />
    </AppShell>
  );
}
