/**
 * Create profile · the three-step flow from Figma "UEM Dashboard design" (AD explorer frames):
 * Name & description → Device / Application groups → Configure. Lands on Profile configuration.
 */
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ExternalLink, Search, X } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { EmptyState, Field, FieldLabel, fieldClass, FooterActions, InfoAlert, PageTitle, SectionTitle, tabListClass, tabTriggerClass } from '../components/ds';
import { UButton, UCheckbox } from '../components/uem';
import { Input } from '../components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { cn } from '../components/ui/utils';
import { useToast } from '../components/toast';
import { plural } from '../data';
import emptyPuzzle from '../assets/ds/empty-puzzle.svg';

type Step = 1 | 2 | 3;
const steps: [Step, string][] = [[1, 'Name & description'], [2, 'Device groups'], [3, 'Configure']];

interface Group { id: string; name: string; description: string; profiles: string[]; devices: number }
const deviceGroups: Group[] = [
  { id: 'all', name: 'All Devices', description: 'Every enrolled Apple device. Default group.', profiles: ['Managed Device'], devices: 212 },
  { id: 'sales', name: 'Field Sales', description: 'iPhones carried by the field sales team', profiles: ['Sales Baseline'], devices: 48 },
  { id: 'dev', name: 'Developer devices', description: 'Developer devices group to access work tooling and TestFlight builds', profiles: ['Restricted App Access'], devices: 19 },
  { id: 'warehouse', name: 'Warehouse Kiosks', description: 'Shared iPads on the warehouse floor', profiles: ['Warehouse Kiosk'], devices: 36 },
  { id: 'exec', name: 'Leadership', description: 'Executive iPads and iPhones', profiles: ['Exec iPads'], devices: 12 },
  { id: 'byod', name: 'BYOD', description: 'User-enrolled personal devices; supervised-only settings are ignored', profiles: [], devices: 61 },
];

function Stepper({ step, done, onGo }: { step: Step; done: Step[]; onGo: (s: Step) => void }) {
  return (
    <ol className="m-0 flex list-none items-center p-0" aria-label="Create profile steps">
      {steps.map(([n, label], i) => {
        const isDone = done.includes(n);
        const current = n === step;
        const reachable = isDone || current;
        return (
          <li key={n} className={cn('flex items-center', i < steps.length - 1 && 'grow')}>
            <button
              type="button"
              disabled={!reachable}
              aria-current={current ? 'step' : undefined}
              onClick={() => reachable && onGo(n)}
              className={cn('flex h-11 items-center gap-2.5 rounded-full border bg-white pr-5 pl-2 text-[14px] font-semibold', current ? 'border-uem text-uem' : isDone ? 'border-line text-heading hover:border-uem' : 'border-line text-muted', !reachable && 'cursor-default')}
            >
              <span className={cn('flex size-7 items-center justify-center rounded-full text-[13px]', current ? 'bg-uem text-white' : isDone ? 'bg-[#e3fcef] text-[#006644]' : 'bg-chip text-muted')}>
                {isDone && !current ? <Check className="size-4" strokeWidth={2.5} /> : n}
              </span>
              {label}
            </button>
            {i < steps.length - 1 && <span aria-hidden className={cn('mx-3 h-px grow', isDone ? 'bg-[#006644]/40' : 'bg-line')} />}
          </li>
        );
      })}
    </ol>
  );
}

export function CreateProfilePage({ initialStep = 1 }: { initialStep?: Step }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = React.useState<Step>(initialStep);
  const [done, setDone] = React.useState<Step[]>(initialStep > 1 ? [1] : []);
  const [name, setName] = React.useState(initialStep > 1 ? 'Support iPads' : '');
  const [desc, setDesc] = React.useState(initialStep > 1 ? 'Shared iPads for the support desk' : '');
  const [tried, setTried] = React.useState(false);
  const [tab, setTab] = React.useState<'device' | 'app'>('device');
  const [picked, setPicked] = React.useState<string[]>([]);
  const [q, setQ] = React.useState('');
  const searchRef = React.useRef<HTMLInputElement>(null);

  const nameErr = !name.trim() ? 'Give the profile a name admins will recognise in the list' : name.trim().length < 3 ? 'At least 3 characters' : undefined;
  const next = () => {
    if (step === 1) { setTried(true); if (nameErr) return; setDone((d) => (d.includes(1) ? d : [...d, 1])); setStep(2); return; }
    if (step === 2) { setDone((d) => (d.includes(2) ? d : [...d, 2])); setStep(3); return; }
    toast({ title: `${name.trim()} created as a draft`, sub: picked.length ? `${plural(devices, 'device')} in ${plural(picked.length, 'group')} receive it once you submit the configuration.` : 'No device group yet; nothing is sent until you assign one.' });
    navigate('/d1');
  };
  const shown = deviceGroups.filter((g) => (g.name + ' ' + g.description).toLowerCase().includes(q.trim().toLowerCase()));
  const allShown = shown.length > 0 && shown.every((g) => picked.includes(g.id));
  const devices = deviceGroups.filter((g) => picked.includes(g.id)).reduce((n, g) => n + g.devices, 0);
  const th = 'px-4 py-3 text-left text-[14px] font-semibold text-heading';

  return (
    <AppShell page="profiles">
      <div className="flex min-h-0 grow flex-col overflow-y-auto px-[50px] pt-8 pb-4">
        <PageTitle>Create profile</PageTitle>
        <div className="mt-6"><Stepper step={step} done={done} onGo={setStep} /></div>

        <div className="mt-8 flex grow flex-col gap-5">
          {step === 1 && (
            <>
              <SectionTitle sub="How this profile appears in the list and in audit entries.">About the profile</SectionTitle>
              <Field className="w-[480px]" label="Profile name" required info="Shown in the profile list and on devices under Settings › General › VPN & Device Management" placeholder="e.g., Support iPads" value={name} onChange={(e) => setName(e.target.value)} error={tried ? nameErr : undefined} maxLength={60} autoFocus onKeyDown={(e) => e.key === 'Enter' && next()} />
              <div className="flex w-[480px] flex-col gap-2">
                <FieldLabel htmlFor="profile-desc" info="Why this profile exists and who it is for. Optional, but it saves the next admin a guess">Description</FieldLabel>
                <textarea id="profile-desc" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Brief description of this profile" rows={4} maxLength={240} className={cn(fieldClass, 'h-auto resize-y py-2.5 outline-none')} />
                <span className="text-[12px] text-muted">{desc.length}/240</span>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <SectionTitle sub="Which devices receive this profile. You can change this later; nothing is sent until the configuration is submitted.">Assign groups</SectionTitle>
              <Tabs value={tab} onValueChange={(v) => setTab(v as 'device' | 'app')} className="gap-0">
                <TabsList aria-label="Group type" className={tabListClass}>
                  <TabsTrigger value="device" className={tabTriggerClass}>Device groups{picked.length > 0 && <span className="rounded-[8px] bg-uem-soft px-[7px] py-px text-[12px] font-semibold text-uem">{picked.length}</span>}</TabsTrigger>
                  <TabsTrigger value="app" className={tabTriggerClass}>Application groups</TabsTrigger>
                </TabsList>
              </Tabs>
              {tab === 'device' ? (
                <>
                  <div className="flex items-center gap-3">
                    <label className="flex h-11 w-[340px] items-center gap-2.5 rounded-[6px] border border-line px-3 focus-within:border-uem">
                      <Search className="size-4 text-muted" strokeWidth={1.7} />
                      <Input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && setQ('')} placeholder="Search device groups" aria-label="Search device groups" className="h-auto border-0 bg-transparent p-0 text-[14px] shadow-none focus-visible:ring-0" />
                      {q && <button type="button" aria-label="Clear search" onClick={() => { setQ(''); searchRef.current?.focus(); }} className="flex border-0 bg-transparent p-0 text-muted hover:text-ink"><X className="size-4" strokeWidth={1.7} /></button>}
                    </label>
                    <span className="text-[13px] text-muted" aria-live="polite">{picked.length === 0 ? 'No group selected. The profile is created as a draft with no devices.' : `${plural(picked.length, 'group')} · ${plural(devices, 'device')} will receive this profile`}</span>
                  </div>
                  <div className="overflow-hidden rounded-[6px] border border-line">
                    <table className="w-full border-collapse">
                      <thead className="bg-[#fafafa]">
                        <tr>
                          <th className="w-12 px-4 py-3"><UCheckbox aria-label="Select all shown groups" checked={allShown} onCheckedChange={(v) => setPicked((p) => (v ? Array.from(new Set([...p, ...shown.map((g) => g.id)])) : p.filter((id) => !shown.some((g) => g.id === id))))} /></th>
                          <th className={th}>Group name</th><th className={th}>Description</th><th className={th}>Profiles added</th><th className={th}>Devices</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shown.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-[14px] text-muted">No group matches “{q}”.</td></tr>}
                        {shown.map((g) => {
                          const on = picked.includes(g.id);
                          return (
                            <tr key={g.id} onClick={() => setPicked((p) => (on ? p.filter((x) => x !== g.id) : [...p, g.id]))} className={cn('cursor-pointer border-t border-row text-[14px] transition-colors hover:bg-[#fafafa]', on && 'bg-[#f0f7ff] hover:bg-[#f0f7ff]')}>
                              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}><UCheckbox aria-label={`Select ${g.name}`} checked={on} onCheckedChange={(v) => setPicked((p) => (v ? [...p, g.id] : p.filter((x) => x !== g.id)))} /></td>
                              <td className="px-4 font-semibold text-heading">{g.name}</td>
                              <td className="max-w-[360px] truncate px-4 text-muted">{g.description}</td>
                              <td className="px-4">{g.profiles.length ? g.profiles.join(', ') : <span className="text-muted">None</span>}</td>
                              <td className="px-4">{g.devices}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {picked.includes('byod') && <InfoAlert tone="warn">BYOD devices are user-enrolled. Settings marked Supervised in Restriction, and app removal on wipe, don’t apply to them.</InfoAlert>}
                </>
              ) : (
                <EmptyState icon={emptyPuzzle} title="No application groups in your organisation" sub="Application groups target devices by the apps they carry. Create one under App Groups, then come back here." className="min-h-[320px] border-0"
                  action={<UButton tone="outline" size="lg" className="mt-2.5" onClick={() => navigate('/l1')}><ExternalLink strokeWidth={1.7} />Go to App Groups</UButton>} />
              )}
            </>
          )}

          {step === 3 && (
            <>
              <SectionTitle sub="Everything is in place to configure the profile. It stays a draft until you submit the configuration.">Ready to configure</SectionTitle>
              <dl className="m-0 grid w-[640px] grid-cols-[180px_1fr] gap-x-6 gap-y-3 rounded-[6px] border-[1.26px] border-line px-5 py-4 text-[14px]">
                <dt className="text-muted">Profile name</dt><dd className="m-0 font-semibold text-heading">{name.trim()}</dd>
                <dt className="text-muted">Description</dt><dd className="m-0 text-ink">{desc.trim() || <span className="text-muted">None</span>}</dd>
                <dt className="text-muted">Device groups</dt>
                <dd className="m-0 text-ink">{picked.length ? `${deviceGroups.filter((g) => picked.includes(g.id)).map((g) => g.name).join(', ')} · ${plural(devices, 'device')}` : <span className="text-muted">None yet. Assign one later from the profile list.</span>}</dd>
                <dt className="text-muted">Starts with</dt><dd className="m-0 text-ink">Apple defaults: no apps, no restrictions, no passcode rule</dd>
              </dl>
              <InfoAlert>Next you choose apps, restrictions, passcode, Wi-Fi and the rest. Devices receive nothing until you press Submit on the configuration page.</InfoAlert>
            </>
          )}
        </div>

        <div className="sticky bottom-0 -mx-[50px] mt-6 flex items-center justify-between gap-4 border-t border-soft bg-white/95 px-[50px] py-4 backdrop-blur">
          <span className="text-[13px] text-muted">Step {step} of {steps.length}{step > 1 && <> · <button type="button" onClick={() => setStep((s) => (s - 1) as Step)} className="border-0 bg-transparent p-0 text-[13px] font-semibold text-uem hover:underline">Back</button></>}</span>
          <FooterActions>
            <UButton tone="outline" size="lg" onClick={() => navigate('/')}>Cancel</UButton>
            <UButton size="lg" onClick={next}>{step === 3 ? 'Create and configure' : 'Continue'}</UButton>
          </FooterActions>
        </div>
      </div>
    </AppShell>
  );
}
