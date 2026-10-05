import * as React from 'react';
import { ChevronDown, ChevronRight, Link2, MoreVertical, Search, Upload } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { AppIcon, CountBadge, LaterBadge, UButton } from '../components/uem';
import { cn } from '../components/ui/utils';
import { libraryApps } from '../data';

/* L1 · App Library page (replaces App Groups) */
export function AppLibraryPage() {
  const [openRow, setOpenRow] = React.useState<string | null>('crm');
  const [q, setQ] = React.useState('');
  const [builds, setBuilds] = React.useState<[string, string][]>([['3.4.1', 'Available'], ['3.4.0', 'Retired'], ['3.3.2', 'Retired']]);
  const rows = libraryApps.filter((a) => (a.name + a.bundleId).toLowerCase().includes(q.toLowerCase()));
  const tab = 'h-[50px] flex-none gap-2 rounded-none border-0 border-b-2 border-transparent bg-transparent px-5 text-[16px] font-normal text-ink shadow-none data-[state=active]:border-uem data-[state=active]:font-medium data-[state=active]:text-uem data-[state=active]:shadow-none';
  const th = 'px-4 py-3 text-left text-[14px] font-semibold';
  return (
    <AppShell page="library">
      <div className="flex min-h-0 grow flex-col overflow-y-auto pt-[26px] pr-10 pb-4 pl-9">
        <h1 className="m-0 text-[25px] font-medium text-heading">App Library</h1>
        <p className="mt-1.5 mb-0 text-[15px] text-muted">
          In-house apps your iOS profiles can install. Upload builds and roll back here; add apps to devices from a profile's App Catalog.
        </p>
        <Tabs defaultValue="inhouse" className="mt-4 gap-0">
          <TabsList className="h-auto w-full justify-start rounded-none border-b border-line bg-transparent p-0">
            <TabsTrigger value="inhouse" className={tab}>In-house apps <CountBadge n={libraryApps.length} active /></TabsTrigger>
            <TabsTrigger value="vpp" className={tab}>VPP licences <LaterBadge /></TabsTrigger>
          </TabsList>
          <TabsContent value="inhouse">
            <div className="mt-5 flex items-center gap-3">
              <label className="flex h-10 w-[340px] items-center gap-2.5 rounded-[4px] border border-[#c4c4c4] px-3">
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
                  {rows.map((a) => {
                    const open = openRow === a.id;
                    return (
                      <React.Fragment key={a.id}>
                        <tr className={cn('border-t border-row text-[14px]', open && 'bg-[#f0f7ff]')}>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-3">
                              <button type="button" aria-label="Toggle builds" onClick={() => setOpenRow(open ? null : a.id)} className="flex border-0 bg-transparent p-0 text-ink">
                                {open ? <ChevronDown className="size-4 rotate-180" /> : <ChevronRight className="size-4" />}
                              </button>
                              <AppIcon initials={a.initials} color={a.color} size={32} />
                              <span className="text-[16px]">{a.name}</span>
                            </span>
                          </td>
                          <td className="px-4 text-muted">{a.bundleId}</td>
                          <td className="px-4">{a.build}</td>
                          <td className="px-4"><span className="rounded-[10px] bg-[#f5f5f5] px-2 py-0.5 text-[12px]">{a.delivery}</span></td>
                          <td className={cn('px-4', a.signingWarn && 'text-[#c2410c]')}>{a.signing}</td>
                          <td className="px-4">{a.usedByLink ? <a href="#" className="text-uem underline">{a.usedBy}</a> : <span className="text-muted">{a.usedBy}</span>}</td>
                          <td className="px-2"><button type="button" aria-label="More" className="flex border-0 bg-transparent"><MoreVertical className="size-4" /></button></td>
                        </tr>
                        {open && a.id === 'crm' && (
                          <tr className="bg-white">
                            <td colSpan={7} className="pt-3 pr-4 pb-4 pl-[60px]">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-[14px] font-semibold">Builds</span>
                                <UButton tone="outline" size="sm"><Upload strokeWidth={1.7} />Add build</UButton>
                              </div>
                              <div className="overflow-hidden rounded-[6px] border border-line">
                                {builds.map(([v, s], i) => (
                                  <div key={v} className="flex items-center gap-6 border-b border-row px-3.5 py-2 text-[13px] last:border-0">
                                    <span className="w-12 font-semibold">{v}</span>
                                    <span className={cn('rounded-[10px] px-2 py-px', s === 'Available' ? 'bg-[#e8f5e9] text-ok' : 'bg-[#f5f5f5] text-muted')}>{s}</span>
                                    <span className="grow text-muted">{s === 'Available' ? 'Devices get this build · uploaded 18 Sep 2026' : 'Restore to roll devices back to this build'}</span>
                                    <UButton tone="neutral" size="sm" className="h-[30px]"
                                      onClick={() => setBuilds((b) => b.map((x, j) => (j === i ? [x[0], x[1] === 'Available' ? 'Retired' : 'Available'] : x)))}>
                                      {s === 'Available' ? 'Retire' : 'Restore'}
                                    </UButton>
                                  </div>
                                ))}
                              </div>
                              <p className="mt-2 mb-0 text-[13px] text-[#7b341e]">Retiring or restoring a build changes what devices get in both profiles that use this app.</p>
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
    </AppShell>
  );
}
