import * as React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ExternalLink, MoreVertical, RefreshCw, Trash2, Upload } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { EmptyState, Field, InfoAlert, PageTitle, RadioCard, SectionTitle } from '../components/ds';
import { Drawer, IconButton, UButton, UMenu, UMenuItem, UMenuSeparator } from '../components/uem';
import { useToast } from '../components/toast';
import { cn } from '../components/ui/utils';
import emptyPuzzle from '../assets/ds/empty-puzzle.svg';
import { daysUntil, plur, takeover, tokenExpiryLabel, vppToken, type TokenState } from '../vpp';

/* Upload / update token: the three steps from Apple Business Manager, then a real file pick. */
function TokenDrawer({ open, onOpenChange, mode, onConnect }: { open: boolean; onOpenChange: (o: boolean) => void; mode: 'upload' | 'update'; onConnect: (fileName: string) => void }) {
  const [fileName, setFileName] = React.useState('');
  const [reading, setReading] = React.useState(false);
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => { if (open) { setFileName(''); setReading(false); } }, [open]);
  const pick = (f?: File) => { if (!f) return; setReading(true); window.setTimeout(() => { setFileName(f.name); setReading(false); }, 500); };
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title={mode === 'upload' ? 'Upload VPP token' : 'Update VPP token'} subtitle="Connect Apps and Books from Apple Business Manager" width={520}
      footer={<><span className="grow text-[14px] text-muted">{reading ? 'Reading…' : ''}</span><UButton tone="outline" onClick={() => onOpenChange(false)}>Cancel</UButton><UButton disabled={!fileName || reading} onClick={() => onConnect(fileName)}>{mode === 'upload' ? 'Connect' : 'Update token'}</UButton></>}>
      <div className="flex flex-col gap-5 border-t border-soft px-6 pt-4">
        <ol className="m-0 flex list-none flex-col gap-2.5 p-0 text-[14px] leading-[22px] text-ink">
          {[
            <>Sign in to <b className="font-semibold">Apple Business Manager</b> with an account that can manage Apps and Books licences.</>,
            <>Go to <b className="font-semibold">Settings › Payments &amp; Billing › Apps &amp; Books</b> and click <b className="font-semibold">Download</b> next to the location's content token.</>,
            <>Upload the downloaded <b className="font-semibold">.vpptoken</b> file below.</>,
          ].map((step, i) => (
            <li key={i} className="flex gap-3"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-uem-soft text-[12px] font-semibold text-uem">{i + 1}</span><span>{step}</span></li>
          ))}
        </ol>
        <input ref={ref} type="file" accept=".vpptoken" className="sr-only" aria-label="Choose a .vpptoken file" onChange={(e) => pick(e.target.files?.[0])} />
        <button type="button" onClick={() => ref.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files?.[0]); }}
          className="flex min-h-[150px] w-full cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[12px] border-[1.5px] border-dashed border-dash bg-white px-6 py-6 text-center hover:bg-[#fafafa] focus-visible:border-uem">
          <Upload className="size-8 text-uem" strokeWidth={1.5} />
          <span className="text-[15px] font-semibold text-heading">{fileName || <>Drop the .vpptoken file here, or <span className="text-uem underline">browse</span></>}</span>
          <span className="text-[12px] text-muted">{fileName ? '1.2 KB · Ready' : 'Downloaded from Apple Business Manager'}</span>
        </button>
        {mode === 'update' && <InfoAlert>Updating keeps every licence assignment. Use it to renew an expiring token or replace one Apple revoked.</InfoAlert>}
      </div>
    </Drawer>
  );
}

const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="flex gap-4 py-2 text-[14px]"><span className="w-[170px] shrink-0 text-muted">{k}</span><span className="text-ink">{v}</span></div>
);

export function VppTokenPage({ initial = 'connected' }: { initial?: TokenState }) {
  const toast = useToast();
  const [state, setState] = React.useState<TokenState>(initial);
  const [drawer, setDrawer] = React.useState<null | 'upload' | 'update'>(null);
  const [pendingFile, setPendingFile] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [release, setRelease] = React.useState<'release' | 'keep' | null>(null);
  const [syncing, setSyncing] = React.useState(false);
  const [synced, setSynced] = React.useState(vppToken.lastSynced);
  const days = daysUntil(vppToken.expires);
  const connected = state !== 'none';

  const connect = (fileName: string) => {
    setDrawer(null);
    if (state === 'none') { setPendingFile(fileName); return; }
    setState('connected');
    toast({ title: 'VPP token updated', sub: 'Licence assignments continue; apps resume updating.' });
  };
  const takeOver = () => {
    setPendingFile(null); setState('releasing');
    toast({ title: 'Token connected', sub: `Releasing ${takeover.licenses} licences held by ${takeover.mdm}. Counts update when it finishes.`, tone: 'info' });
    window.setTimeout(() => { setState('connected'); setSynced('12 Oct 2026, 09:14'); toast({ title: `${takeover.licenses} licences released`, sub: 'Apps and Books is ready to assign.' }); }, 5000);
  };
  const sync = () => {
    setSyncing(true);
    window.setTimeout(() => { setSyncing(false); if (state === 'revoked' || state === 'expired') { toast({ title: 'Sync failed', sub: state === 'revoked' ? 'Apple no longer accepts this token. Upload a new one.' : 'The token has expired. Upload a renewed one.', tone: 'info' }); return; } setSynced('12 Oct 2026, 09:14'); toast({ title: 'Synced with Apple Business Manager', sub: `${vppToken.licensedApps} licensed apps, counts refreshed.` }); }, 1200);
  };
  const del = () => {
    setConfirmDelete(false); setState('none'); setRelease(null);
    toast({ title: 'VPP token deleted', sub: release === 'release' ? `${plur(vppToken.assignedLicenses, 'licence')} go back to your VPP account; apps stop working after 30 days.` : 'Licences stay assigned in Apple Business Manager. VPP apps were removed from every profile.', tone: 'info' });
  };

  const health = state === 'expiring' ? { tone: 'warn' as const, text: <>This token expires in {plur(days < 0 ? 6 : Math.min(days, 6), 'day')}. Renew it in Apple Business Manager and upload the new file to avoid interruptions.</> }
    : state === 'revoked' ? { tone: 'error' as const, text: <>Apple revoked this token. Licence assignment and app installs are paused until you upload a new token from Apple Business Manager.</> }
    : state === 'expired' ? { tone: 'error' as const, text: <>This token expired on 18 Sep 2026. Licence assignment and app installs are paused until you upload a renewed token.</> }
    : null;

  return (
    <AppShell page="vpp">
      <div className="flex min-h-0 grow flex-col overflow-y-auto px-[50px] pt-8 pb-6">
        <PageTitle>Apple VPP Token</PageTitle>
        <p className="mt-1.5 mb-0 max-w-[75ch] text-[15px] text-muted">Connect your Apple Volume Purchase Program token to see the apps purchased in Apple Business Manager and assign them to devices from a profile's App Catalog › VPP.</p>

        {!connected && !pendingFile && (
          <div className="mt-6">
            <EmptyState icon={emptyPuzzle} title="No VPP token connected" sub="Upload the .vpptoken from Apple Business Manager to see and assign purchased apps." className="min-h-[300px]"
              action={<UButton size="lg" className="mt-2.5" onClick={() => setDrawer('upload')}><Upload strokeWidth={1.7} />Upload VPP token</UButton>} />
          </div>
        )}

        {pendingFile && (
          <div role="alert" className="mt-6 flex flex-col gap-3 rounded-[8px] border border-[#f5d8b8] bg-[#fff3e0] px-5 py-4 text-[14px] leading-[22px] text-[#7b341e]">
            <span className="flex items-start gap-2.5"><AlertTriangle className="mt-[3px] size-4 shrink-0" strokeWidth={1.7} />
              <span><b className="font-semibold">Release existing licences?</b> {pendingFile} already has {plur(takeover.licenses, 'licence')} assigned across {plur(takeover.apps, 'app')} by <b className="font-semibold">{takeover.mdm}</b>. To use it here, every existing licence is released and the token is registered to this MDM. Devices still managed by {takeover.mdm} keep the apps but stop updating and stop working after 30 days. Devices you enrol here get new licences automatically.</span>
            </span>
            <span className="flex flex-wrap gap-2">
              <UButton size="sm" onClick={takeOver}>Release and continue</UButton>
              <UButton tone="neutral" size="sm" autoFocus onClick={() => setPendingFile(null)}>Cancel</UButton>
            </span>
          </div>
        )}

        {connected && (
          <div className="mt-6 flex max-w-[860px] flex-col gap-5">
            {health && (
              <InfoAlert tone={health.tone}>
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">{health.text}<UButton size="sm" onClick={() => setDrawer('update')}>Update token</UButton></span>
              </InfoAlert>
            )}
            {state === 'revoked' && (
              <InfoAlert tone="warn"><span className="flex flex-wrap items-center gap-x-3 gap-y-1">Sync failed: the token is no longer valid. Last successful sync 28 Sep 2026, 02:00.<UButton tone="outline" size="sm" onClick={sync} disabled={syncing}><RefreshCw className={cn(syncing && 'animate-spin')} strokeWidth={1.7} />Retry sync</UButton></span></InfoAlert>
            )}
            {state === 'releasing' && <InfoAlert>Releasing {plur(takeover.licenses, 'existing licence')}. This usually takes a few minutes; counts update when it finishes.</InfoAlert>}

            <div className="rounded-[12px] border border-line px-6 py-5">
              <div className="flex items-center justify-between">
                <SectionTitle sub={state === 'connected' ? 'Apps and Books is connected and syncing nightly.' : undefined}>VPP token details</SectionTitle>
                <UMenu trigger={<IconButton label="Token actions"><MoreVertical className="size-4" strokeWidth={1.7} /></IconButton>}>
                  <UMenuItem icon={RefreshCw} disabled={syncing || state === 'releasing'} onSelect={sync}>Sync now</UMenuItem>
                  <UMenuItem icon={Upload} onSelect={() => setDrawer('update')}>Update token</UMenuItem>
                  <UMenuSeparator />
                  <UMenuItem icon={Trash2} danger onSelect={() => { setConfirmDelete(true); setRelease(null); }}>Delete token…</UMenuItem>
                </UMenu>
              </div>
              <div className="mt-2 divide-y divide-row">
                <Row k="Organisation" v={vppToken.org} />
                <Row k="Location" v={vppToken.location} />
                <Row k="Expires on" v={state === 'revoked' ? <span className="text-bad">Revoked by Apple</span> : state === 'expired' ? <span className="text-bad">18 Sep 2026 · expired</span> : state === 'expiring' ? <span className="text-warn">6 Oct 2026 · 6 days remaining</span> : <>{tokenExpiryLabel(vppToken.expires)} <span className="text-muted">· {plur(days, 'day')} remaining</span></>} />
                <Row k="Last synced" v={state === 'releasing' ? <span className="text-muted">Releasing existing licences…</span> : state === 'revoked' ? <span className="text-bad">Sync failed</span> : syncing ? <span className="text-muted">Syncing…</span> : synced} />
                <Row k="Licensed apps" v={<Link to="/v7" className="font-semibold text-uem no-underline hover:underline">{vppToken.licensedApps} · View in App Groups <ExternalLink className="ml-0.5 inline size-3.5 align-[-2px]" strokeWidth={1.7} /></Link>} />
              </div>

              {confirmDelete && (
                <div role="alert" className="mt-4 flex flex-col gap-3 rounded-[8px] bg-[#fafafa] px-5 py-4 text-[14px] text-ink">
                  <p className="m-0"><b className="font-semibold">Delete VPP token?</b> Used by {plur(vppToken.usedBy.length, 'profile')} ({vppToken.usedBy.map((p) => p.name).join(', ')}). {plur(vppToken.assignedLicenses, 'licence')} assigned by this MDM on {plur(vppToken.assignedDevices, 'device')}.</p>
                  <div className="flex flex-col gap-2.5">
                    <RadioCard name="release" checked={release === 'release'} onSelect={() => setRelease('release')} title="Release licences and delete" sub="Licences assigned by this MDM go back to your VPP account. Apps stop receiving updates and stop working after 30 days." />
                    <RadioCard name="release" checked={release === 'keep'} onSelect={() => setRelease('keep')} title="Delete only" sub="Licences stay assigned in Apple Business Manager. Use this if you're moving the token to another MDM." />
                  </div>
                  <p className="m-0 text-[13px] text-[#7b341e]">Either way, VPP apps are removed from all {vppToken.usedBy.length} profiles at their next submit.</p>
                  <span className="flex flex-wrap gap-2">
                    <UButton tone="danger" size="sm" disabled={!release} onClick={del}><Trash2 strokeWidth={1.7} />{release === 'release' ? `Release ${vppToken.assignedLicenses} licences and delete` : 'Delete token'}</UButton>
                    <UButton tone="neutral" size="sm" autoFocus onClick={() => setConfirmDelete(false)}>Cancel</UButton>
                  </span>
                </div>
              )}
            </div>
            <p className="m-0 text-[13px] text-muted">Prototype states: {(['connected', 'expiring', 'revoked', 'expired'] as TokenState[]).map((s) => <button key={s} type="button" onClick={() => setState(s)} className={cn('mr-2 border-0 bg-transparent p-0 text-[13px] underline', state === s ? 'font-semibold text-ink' : 'text-uem')}>{s}</button>)}</p>
          </div>
        )}
      </div>
      <TokenDrawer open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)} mode={drawer ?? 'upload'} onConnect={connect} />
      {/* keep Field import meaningful for future org-name override */}
      {false && <Field label="" />}
    </AppShell>
  );
}
