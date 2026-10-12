import * as React from 'react';
import { AlertTriangle, CheckCircle2, Clock, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AppIcon, Drawer, UButton, UCheckbox } from '../components/uem';
import { EmptyState, InfoAlert } from '../components/ds';
import { cn } from '../components/ui/utils';
import emptyPuzzle from '../assets/ds/empty-puzzle.svg';
import { failedCount, licenceLabel, plur, type Assignment, type AssignStatus, type Platform, type VppApp } from '../vpp';

/* Status is icon plus text, never colour alone. */
export function StatusBadge({ status }: { status: AssignStatus }) {
  const map: Record<AssignStatus, { cls: string; Icon: React.ElementType }> = {
    Installed: { cls: 'bg-[#e3fcef] text-[#006644]', Icon: CheckCircle2 },
    Installing: { cls: 'bg-uem-soft text-[#0747a6]', Icon: Loader2 },
    Pending: { cls: 'bg-[#fff7d6] text-[#7a5a00]', Icon: Clock },
    Associated: { cls: 'bg-chip text-[#262626]', Icon: CheckCircle2 },
    Failed: { cls: 'bg-[#fdecea] text-bad', Icon: AlertTriangle },
  };
  const { cls, Icon } = map[status];
  return <span className={cn('inline-flex items-center gap-1 rounded-[8px] px-2 py-0.5 text-[12px] font-medium whitespace-nowrap', cls)}><Icon className={cn('size-3.5', status === 'Installing' && 'animate-spin')} strokeWidth={2} />{status}</span>;
}

/* Licence assignments for one app: who holds a licence and where the install stands. */
export function LicenseAssignmentsDrawer({ app, onOpenChange, onRetry, initialFilter = 'all' }: { app: VppApp | null; onOpenChange: (o: boolean) => void; onRetry: (app: VppApp, a: Assignment) => void; initialFilter?: 'all' | AssignStatus }) {
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState<'all' | AssignStatus>(initialFilter);
  React.useEffect(() => { if (app) { setQ(''); setFilter(initialFilter); } }, [app, initialFilter]);
  const rows = (app?.assignments ?? []).filter((a) => (filter === 'all' || a.status === filter) && (a.device + ' ' + (a.serial ?? '') + ' ' + (a.user ?? '')).toLowerCase().includes(q.toLowerCase()));
  const failed = app ? failedCount(app) : 0;
  const th = 'px-3 py-2.5 text-left text-[13px] font-semibold text-heading';
  return (
    <Drawer open={!!app} onOpenChange={onOpenChange} title={app ? `Licence assignments · ${app.name}` : ''} subtitle={app ? `${licenceLabel(app)}${failed ? ` · ${plur(failed, 'failed assignment')}` : ''}` : undefined} width={820}
      footer={<><span className="grow text-[13px] text-muted">User Enrollment rows (no serial) show the user's licence. One licence covers all of that user's devices; per-device install status is on the device's Applications tab.</span><UButton tone="outline" onClick={() => onOpenChange(false)}>Close</UButton></>}>
      <div className="flex flex-col gap-4 border-t border-soft px-6 pt-4">
        <div className="flex items-center gap-3">
          <label className="flex h-10 grow items-center gap-2.5 rounded-[6px] border border-line px-3 focus-within:border-uem">
            <Search className="size-4 text-muted" strokeWidth={1.7} />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by device, serial or user" aria-label="Search assignments" className="h-auto border-0 bg-transparent p-0 text-[14px] shadow-none focus-visible:ring-0" />
            {q && <button type="button" aria-label="Clear search" onClick={() => setQ('')} className="flex border-0 bg-transparent p-0 text-muted hover:text-ink"><X className="size-4" strokeWidth={1.7} /></button>}
          </label>
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger aria-label="Status" className="h-10 w-[170px] rounded-[6px] border-line bg-white text-[14px] text-ink hover:bg-white focus:border-uem"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {(['Installed', 'Installing', 'Pending', 'Associated', 'Failed'] as AssignStatus[]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-hidden rounded-[6px] border border-line">
          <table className="w-full border-collapse">
            <thead className="bg-[#fafafa]"><tr><th className={th}>Device</th><th className={th}>Group</th><th className={th}>Serial</th><th className={th}>User</th><th className={th}>Status</th><th className="w-20" /></tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-[13px] text-muted">{app?.assignments.length ? 'No assignments match.' : 'No licences assigned yet. Devices get one when they enrol with a profile that includes this app.'}</td></tr>}
              {rows.map((a, i) => (
                <tr key={i} className="border-t border-row text-[13px]">
                  <td className="px-3 py-2.5 font-medium">{a.device}</td>
                  <td className="px-3 text-muted">{a.group}</td>
                  <td className="px-3 font-mono text-[12px] text-muted">{a.serial ?? <span className="font-sans italic">User licence</span>}</td>
                  <td className="px-3 text-muted">{a.user ?? <span className="italic">Device licence</span>}</td>
                  <td className="px-3"><StatusBadge status={a.status} />{a.reason && <span className="mt-1 block text-[12px] text-bad">{a.reason}</span>}</td>
                  <td className="px-2 text-right">{a.status === 'Failed' && app && <UButton tone="outline" size="sm" onClick={() => onRetry(app, a)}><RefreshCw strokeWidth={1.7} />Retry</UButton>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Drawer>
  );
}

/* Add VPP apps to a profile: only this profile's platform, with what each licence pool has left. */
export function AddVppAppsDrawer({ open, onOpenChange, apps, platform, inProfile, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; apps: VppApp[]; platform: Platform; inProfile: string[]; onAdd: (ids: string[]) => void }) {
  const [q, setQ] = React.useState('');
  const [sel, setSel] = React.useState<string[]>([]);
  React.useEffect(() => { if (open) { setQ(''); setSel([]); } }, [open]);
  const rows = apps.filter((a) => a.platforms.includes(platform) && (a.name + a.bundleId).toLowerCase().includes(q.toLowerCase()));
  const noLicence = sel.filter((id) => apps.find((a) => a.id === id)?.available === 0).length;
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Add VPP apps" subtitle={`Apps purchased in Apple Business Manager that run on ${platform}`} width={600}
      footer={<><span className="grow text-[14px] text-muted">{sel.length} selected</span><UButton tone="outline" onClick={() => onOpenChange(false)}>Cancel</UButton><UButton disabled={!sel.length} onClick={() => onAdd(sel)}>Add {plur(sel.length, 'app')}</UButton></>}>
      <div className="flex flex-col gap-4 border-t border-soft px-6 pt-4">
        <label className="flex h-10 items-center gap-2.5 rounded-[6px] border border-line px-3 focus-within:border-uem">
          <Search className="size-4 text-muted" strokeWidth={1.7} />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by app name or bundle ID" aria-label="Search VPP apps" className="h-auto border-0 bg-transparent p-0 text-[15px] shadow-none focus-visible:ring-0" />
        </label>
        {noLicence > 0 && <InfoAlert tone="warn">{plur(noLicence, 'selected app')} has no licences left. Devices won't get it until you buy more in Apple Business Manager.</InfoAlert>}
        <div className="overflow-hidden rounded-[6px] border border-line">
          {rows.length === 0 && <EmptyState icon={emptyPuzzle} title={q ? `No apps match “${q}”` : `No ${platform} apps in your VPP account`} sub="Purchase apps in Apple Business Manager, then sync the token." className="min-h-[160px] rounded-none border-0" />}
          {rows.map((a) => {
            const here = inProfile.includes(a.id);
            const on = here || sel.includes(a.id);
            return (
              <label key={a.id} className={cn('flex items-center gap-3.5 border-b border-row px-4 py-2.5 last:border-0', sel.includes(a.id) && 'bg-[#f0f7ff]', !here && 'cursor-pointer hover:bg-[#fafafa]')}>
                <UCheckbox checked={on} disabled={here || a.metadataMissing} onCheckedChange={() => setSel((s) => (s.includes(a.id) ? s.filter((x) => x !== a.id) : [...s, a.id]))} aria-label={a.name} />
                <AppIcon logo={a.logo} name={a.name} color={a.color} size={36} />
                <span className="flex min-w-0 grow flex-col">
                  <span className="truncate text-[15px] font-medium text-heading">{a.name}</span>
                  <span className="truncate text-[12px] text-muted">{a.bundleId}{a.userLicenseOnly ? ' · user licences only' : ''}</span>
                </span>
                <span className={cn('shrink-0 text-right text-[12px]', here ? 'text-muted' : a.available === 0 ? 'text-[#7b341e]' : 'text-muted')}>
                  {here ? 'Already added' : a.metadataMissing ? 'Metadata unavailable' : licenceLabel(a)}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </Drawer>
  );
}
