/**
 * Passcode and Wifi · list-of-configurations sections.
 * Content from Figma "UEM Dashboard design" (Profile configuration › Passcode / Wifi);
 * empty state → drawer form → table, with the inline confirm + undo flow used elsewhere.
 */
import * as React from 'react';
import { Copy, Eye, EyeOff, MoreVertical, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { EmptyState, Field, FieldLabel, InfoAlert, ProfileFields, SectionTitle, StateChip, UndoRow } from '../components/ds';
import { Drawer, IconButton, UButton, UMenu, UMenuItem, UMenuSeparator } from '../components/uem';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';
import { cn } from '../components/ui/utils';
import emptyLock from '../assets/ds/empty-lock.svg';
import emptyWifi from '../assets/ds/empty-wifi.svg';

const selectClass = 'h-11 w-full rounded-[6px] border-line bg-white px-2.5 text-[14px] text-ink hover:bg-white focus:border-uem data-[placeholder]:text-placeholder';
const seg = 'h-10 grow rounded-none border border-line bg-white px-4 text-[14px] text-ink hover:bg-[#f3f3f5] hover:text-ink first:rounded-l-[5px] last:rounded-r-[5px] data-[state=on]:border-uem data-[state=on]:bg-uem-soft data-[state=on]:text-uem data-[state=on]:hover:bg-uem-soft data-[state=on]:hover:text-uem';
const th = 'px-4 py-3 text-left text-[14px] font-semibold text-heading';

function Choice({ label, info, value, onChange, options, name }: { label: string; info: string; value: string; onChange: (v: string) => void; options: [string, string][]; name: string }) {
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel info={info}>{label}</FieldLabel>
      <ToggleGroup type="single" value={value} onValueChange={(v) => v && onChange(v)} aria-label={name} className="w-full gap-0 rounded-none">
        {options.map(([v, l]) => <ToggleGroupItem key={v} value={v} className={seg}>{l}</ToggleGroupItem>)}
      </ToggleGroup>
    </div>
  );
}

function Pick({ label, info, value, onChange, options, required }: { label: string; info: string; value: string; onChange: (v: string) => void; options: [string, string][]; required?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel info={info} required={required}>{label}</FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label={label} className={selectClass}><SelectValue /></SelectTrigger>
        <SelectContent>{options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

/* Shared list shell: search + add, table, inline remove confirm, undo ---------- */
function useList<T extends { id: string; name: string }>(onChange: (() => void) | undefined, seed: { items?: T[]; open?: boolean } = {}) {
  const [items, setItems] = React.useState<T[]>(seed.items ?? []);
  const [added, setAdded] = React.useState<string[]>([]);
  const [edited, setEdited] = React.useState<string[]>([]);
  const [editing, setEditing] = React.useState<T | undefined>();
  const [open, setOpen] = React.useState(!!seed.open);
  const [confirm, setConfirm] = React.useState<string | null>(null);
  const [undo, setUndo] = React.useState<{ item: T; index: number } | null>(null);
  const [q, setQ] = React.useState('');
  const create = () => { setEditing(undefined); setOpen(true); };
  const edit = (t: T) => { setEditing(t); setOpen(true); };
  const save = (t: T) => {
    setItems((x) => {
      if (x.some((y) => y.id === t.id)) { if (!added.includes(t.id)) setEdited((e) => (e.includes(t.id) ? e : [...e, t.id])); return x.map((y) => (y.id === t.id ? t : y)); }
      setAdded((a) => [...a, t.id]); return [...x, t];
    });
    setUndo(null); onChange?.();
  };
  const duplicate = (t: T, name: string) => { const copy = { ...t, id: `${t.id}-${Date.now()}`, name }; setItems((x) => [...x, copy]); setAdded((a) => [...a, copy.id]); onChange?.(); return copy; };
  const remove = (t: T) => {
    setUndo({ item: t, index: items.findIndex((x) => x.id === t.id) });
    setItems((x) => x.filter((y) => y.id !== t.id)); setConfirm(null); onChange?.();
  };
  const undoRemove = () => { if (!undo) return; setItems((x) => { const l = [...x]; l.splice(Math.min(undo.index, l.length), 0, undo.item); return l; }); setUndo(null); onChange?.(); };
  const stateOf = (t: T) => (added.includes(t.id) ? 'new' : edited.includes(t.id) ? 'edited' : null) as 'new' | 'edited' | null;
  const shown = items.filter((t) => JSON.stringify(t).toLowerCase().includes(q.trim().toLowerCase()));
  return { items, shown, q, setQ, editing, open, setOpen, confirm, setConfirm, undo, create, edit, save, duplicate, remove, undoRemove, stateOf };
}

function ListToolbar({ q, onQ, placeholder, count, noun, onAdd, addLabel }: { q: string; onQ: (v: string) => void; placeholder: string; count: number; noun: string; onAdd: () => void; addLabel: string }) {
  const ref = React.useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-3">
      <label className="flex h-11 w-[340px] items-center gap-2.5 rounded-[6px] border border-line px-3 focus-within:border-uem">
        <Search className="size-4 text-muted" strokeWidth={1.7} />
        <Input ref={ref} value={q} onChange={(e) => onQ(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && onQ('')} placeholder={placeholder} aria-label={placeholder} className="h-auto border-0 bg-transparent p-0 text-[14px] shadow-none focus-visible:ring-0" />
        {q && <button type="button" aria-label="Clear search" onClick={() => { onQ(''); ref.current?.focus(); }} className="flex border-0 bg-transparent p-0 text-muted hover:text-ink"><X className="size-4" strokeWidth={1.7} /></button>}
      </label>
      <span className="text-[13px] text-muted">{count} {noun}{count === 1 ? '' : 's'} in this profile</span>
      <UButton size="lg" className="ml-auto" onClick={onAdd}><Plus strokeWidth={1.7} />{addLabel}</UButton>
    </div>
  );
}

/* Passcode ------------------------------------------------------------------ */
export interface Passcode {
  id: string; name: string; simple: 'allow' | 'deny'; forcePin: 'yes' | 'no'; alphanumeric: 'yes' | 'no';
  grace: string; expiry: string; minLength: number; minSymbols: number; inactivity: string; maxFailed: number; history: number;
}
const graceOptions: [string, string][] = [['0', 'Immediately'], ['1', '1 Minute'], ['5', '5 Minutes'], ['15', '15 Minutes'], ['30', '30 Minutes']];
const expiryOptions: [string, string][] = [['never', 'Never'], ['1m', '1 Month'], ['3m', '3 Months'], ['6m', '6 Months'], ['1y', '1 Year'], ['2y', '2 Years']];
const inactivityOptions: [string, string][] = [['0', 'Immediately'], ['1', '1 Minute'], ['2', '2 Minutes'], ['5', '5 Minutes'], ['10', '10 Minutes'], ['15', '15 Minutes']];
const label = (opts: [string, string][], v: string) => opts.find(([k]) => k === v)?.[1] ?? v;
const blankPasscode = (): Passcode => ({ id: `pc-${Date.now()}`, name: '', simple: 'deny', forcePin: 'yes', alphanumeric: 'no', grace: '5', expiry: 'never', minLength: 6, minSymbols: 0, inactivity: '2', maxFailed: 10, history: 0 });

function PasscodeDrawer({ open, onOpenChange, initial, onSave, names }: { open: boolean; onOpenChange: (o: boolean) => void; initial?: Passcode; onSave: (p: Passcode) => void; names: string[] }) {
  const [p, setP] = React.useState<Passcode>(blankPasscode);
  const [tried, setTried] = React.useState(false);
  React.useEffect(() => { if (open) { setP(initial ?? blankPasscode()); setTried(false); } }, [open, initial]);
  const up = <K extends keyof Passcode>(k: K, v: Passcode[K]) => setP((x) => ({ ...x, [k]: v }));
  const num = (k: 'minLength' | 'minSymbols' | 'maxFailed' | 'history') => (e: React.ChangeEvent<HTMLInputElement>) => up(k, e.target.value === '' ? (NaN as number) : Number(e.target.value));
  const dupe = names.some((n) => n.toLowerCase() === p.name.trim().toLowerCase() && n !== initial?.name);
  const errs = {
    name: !p.name.trim() ? 'Give this restriction a name admins will recognise' : dupe ? 'Another passcode restriction already has this name' : undefined,
    minLength: !(p.minLength >= 4 && p.minLength <= 16) ? 'Between 4 and 16 characters' : undefined,
    minSymbols: p.alphanumeric === 'yes' ? (!(p.minSymbols >= 0 && p.minSymbols <= 4) ? 'Between 0 and 4' : undefined) : undefined,
    maxFailed: !(p.maxFailed >= 2 && p.maxFailed <= 11) ? 'Between 2 and 11 attempts' : undefined,
    history: !(p.history >= 0 && p.history <= 50) ? 'Between 0 and 50' : undefined,
  };
  const invalid = Object.values(errs).some(Boolean);
  const show = (k: keyof typeof errs) => (tried ? errs[k] : undefined);
  const save = () => { setTried(true); if (invalid) return; onSave({ ...p, name: p.name.trim(), minSymbols: p.alphanumeric === 'yes' ? p.minSymbols : 0 }); onOpenChange(false); };
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title={initial ? 'Edit passcode restriction' : 'Add passcode restriction'} subtitle="Devices enforce the passcode rules at next check-in; users with a weaker passcode are asked to change it within 60 minutes."
      footer={<><UButton tone="outline" size="lg" onClick={() => onOpenChange(false)}>Cancel</UButton><UButton size="lg" onClick={save}>{initial ? 'Save changes' : 'Add restriction'}</UButton></>}>
      <div className="flex flex-col gap-5 px-6 py-2">
        <Field label="Passcode profile name" required info="Shown in the list; not visible on devices" placeholder="e.g., Field sales passcode" value={p.name} onChange={(e) => up('name', e.target.value)} error={show('name')} maxLength={60} autoFocus />
        <div className="grid grid-cols-3 gap-4">
          <Choice name="Simple passcode" label="Simple Passcode" info="Allow lets users pick repeating or sequential codes such as 1111 or 1234" value={p.simple} onChange={(v) => up('simple', v as Passcode['simple'])} options={[['allow', 'Allow'], ['deny', 'Deny']]} />
          <Choice name="Force PIN" label="Force Pin" info="Yes requires a passcode on the device; No only applies the rules when a user sets one" value={p.forcePin} onChange={(v) => up('forcePin', v as Passcode['forcePin'])} options={[['yes', 'Yes'], ['no', 'No']]} />
          <Choice name="Alphanumeric" label="Alphanumeric" info="Yes requires at least one letter and one number" value={p.alphanumeric} onChange={(v) => up('alphanumeric', v as Passcode['alphanumeric'])} options={[['yes', 'Yes'], ['no', 'No']]} />
        </div>
        {p.forcePin === 'no' && <InfoAlert tone="warn">With Force Pin off, a device without a passcode stays without one. Every other rule here only applies once the user sets a passcode.</InfoAlert>}
        <div className="grid grid-cols-2 gap-4">
          <Pick label="Max Grace Period for Unlock" info="How long after locking the device can be unlocked without the passcode" value={p.grace} onChange={(v) => up('grace', v)} options={graceOptions} />
          <Pick label="Passcode Expiry" info="Users must set a new passcode after this long" value={p.expiry} onChange={(v) => up('expiry', v)} options={expiryOptions} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Minimum Length" required info="4 to 16 characters. Apple’s default is 6" type="number" min={4} max={16} value={Number.isNaN(p.minLength) ? '' : p.minLength} onChange={num('minLength')} error={show('minLength')} />
          <Field label="Minimum number of symbols" info="Non-alphanumeric characters such as # or !. Needs Alphanumeric = Yes" type="number" min={0} max={4} value={p.alphanumeric === 'yes' ? (Number.isNaN(p.minSymbols) ? '' : p.minSymbols) : 0} disabled={p.alphanumeric !== 'yes'} onChange={num('minSymbols')} error={show('minSymbols')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Pick label="Max Inactivity Lock" info="The device locks after this much idle time" value={p.inactivity} onChange={(v) => up('inactivity', v)} options={inactivityOptions} />
          <Field label="Maximum Failed Attempts" required info="After this many wrong passcodes the device erases itself. 2 to 11" type="number" min={2} max={11} value={Number.isNaN(p.maxFailed) ? '' : p.maxFailed} onChange={num('maxFailed')} error={show('maxFailed')} />
        </div>
        {p.maxFailed >= 2 && p.maxFailed <= 4 && <InfoAlert tone="warn">iOS erases the device after {p.maxFailed} wrong attempts. At this threshold a child, or a pocket, can wipe a device. 6 or more is the usual balance.</InfoAlert>}
        <Field label="Passcode History" info="How many previous passcodes can’t be reused. 0 turns the check off" type="number" min={0} max={50} value={Number.isNaN(p.history) ? '' : p.history} onChange={num('history')} error={show('history')} className="w-1/2 pr-2" />
      </div>
    </Drawer>
  );
}

export function PasscodeSection({ onChange, initial = 'empty' }: { onChange?: () => void; initial?: 'empty' | 'form' | 'list' }) {
  const list = useList<Passcode>(onChange, {
    open: initial === 'form',
    items: initial === 'list' ? [{ ...blankPasscode(), id: 'pc-seed', name: 'Field sales passcode', minLength: 8, alphanumeric: 'yes', minSymbols: 1, expiry: '6m' }] : [],
  });
  const duplicate = (p: Passcode) => list.duplicate(p, `${p.name} copy`);

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle sub="Passcode rules devices enforce. Users with a weaker passcode are asked to change it.">Passcode</SectionTitle>
      <ProfileFields onChange={onChange} />
      {list.items.length === 0 ? (
        <EmptyState icon={emptyLock} title="No passcode restriction yet" sub="Devices accept any passcode, or none, until you add one" className="min-h-[360px] border-0"
          action={<UButton size="lg" className="mt-2.5" onClick={list.create}>Add passcode restriction</UButton>} />
      ) : (
        <>
          <ListToolbar q={list.q} onQ={list.setQ} placeholder="Search passcode restrictions" count={list.items.length} noun="restriction" onAdd={list.create} addLabel="Add new passcode restriction" />
          <div className="overflow-hidden rounded-[6px] border border-line">
            <table className="w-full border-collapse">
              <thead className="bg-[#fafafa]"><tr><th className={th}>Passcode profile name</th><th className={th}>Minimum length</th><th className={th}>Passcode expiry</th><th className={th}>Wipe after</th><th className="w-12"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {list.shown.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-[14px] text-muted">No restriction matches “{list.q}”.</td></tr>}
                {list.shown.map((p) => (
                  <React.Fragment key={p.id}>
                    <tr className={cn('border-t border-row text-[14px] transition-colors hover:bg-[#fafafa]', list.confirm === p.id && 'bg-[#fafafa]')}>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2"><button type="button" onClick={() => list.edit(p)} className="border-0 bg-transparent p-0 text-[14px] font-semibold text-uem hover:underline">{p.name}</button><StateChip state={list.stateOf(p)} /></span>
                        <span className="block text-[12px] text-muted">{p.alphanumeric === 'yes' ? `Letters and numbers${p.minSymbols ? `, ${p.minSymbols} symbol${p.minSymbols === 1 ? '' : 's'}` : ''}` : 'Numbers only'}{p.simple === 'deny' ? ' · no simple codes' : ''}{p.forcePin === 'no' ? ' · passcode optional' : ''}</span>
                      </td>
                      <td className="px-4">{p.minLength} characters</td>
                      <td className="px-4">{label(expiryOptions, p.expiry)}</td>
                      <td className="px-4">{p.maxFailed} failed attempts</td>
                      <td className="px-2">
                        <UMenu trigger={<IconButton label={`More actions for ${p.name}`}><MoreVertical className="size-4" strokeWidth={1.7} /></IconButton>}>
                          <UMenuItem icon={Pencil} onSelect={() => list.edit(p)}>Edit</UMenuItem>
                          <UMenuItem icon={Copy} onSelect={() => duplicate(p)}>Duplicate</UMenuItem>
                          <UMenuSeparator />
                          <UMenuItem icon={Trash2} danger onSelect={() => list.setConfirm(p.id)}>Remove…</UMenuItem>
                        </UMenu>
                      </td>
                    </tr>
                    {list.confirm === p.id && (
                      <tr className="bg-[#fafafa]"><td colSpan={5} className="px-4 pb-3">
                        <div role="alert" className="flex flex-col gap-2 text-[13px] text-muted">
                          <span>Remove {p.name}? After you submit, devices stop enforcing these rules. Existing passcodes stay as they are; nothing is unlocked.</span>
                          <span className="flex gap-2"><UButton tone="danger" size="sm" onClick={() => list.remove(p)}><Trash2 strokeWidth={1.7} />Remove</UButton><UButton tone="neutral" size="sm" autoFocus onClick={() => list.setConfirm(null)}>Cancel</UButton></span>
                        </div>
                      </td></tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {list.undo && <UndoRow onUndo={list.undoRemove}>Removed: <span className="text-ink">{list.undo.item.name}</span>. Devices stop enforcing it after you submit unless you undo.</UndoRow>}
      <PasscodeDrawer open={list.open} onOpenChange={list.setOpen} initial={list.editing} onSave={list.save} names={list.items.map((x) => x.name)} />
    </div>
  );
}

/* Wifi ---------------------------------------------------------------------- */
export interface WifiNetwork {
  id: string; name: string; ssid: string; password: string; encryption: string; autoJoin: 'allow' | 'deny'; hidden: 'allow' | 'deny'; macRandom: 'allow' | 'deny';
  proxy: 'none' | 'manual' | 'auto'; proxyServer: string; proxyPort: string; proxyUrl: string;
}
const encryptionOptions: [string, string][] = [['any', 'Any'], ['wep', 'WEP'], ['wpa', 'WPA'], ['wpa2', 'WPA2'], ['wpa3', 'WPA3']];
const blankWifi = (): WifiNetwork => ({ id: `wifi-${Date.now()}`, name: '', ssid: '', password: '', encryption: 'wpa2', autoJoin: 'allow', hidden: 'deny', macRandom: 'allow', proxy: 'none', proxyServer: '', proxyPort: '', proxyUrl: '' });

function WifiDrawer({ open, onOpenChange, initial, onSave, existing }: { open: boolean; onOpenChange: (o: boolean) => void; initial?: WifiNetwork; onSave: (w: WifiNetwork) => void; existing: WifiNetwork[] }) {
  const [w, setW] = React.useState<WifiNetwork>(blankWifi);
  const [tried, setTried] = React.useState(false);
  const [reveal, setReveal] = React.useState(false);
  React.useEffect(() => { if (open) { setW(initial ?? blankWifi()); setTried(false); setReveal(false); } }, [open, initial]);
  const up = <K extends keyof WifiNetwork>(k: K, v: WifiNetwork[K]) => setW((x) => ({ ...x, [k]: v }));
  const dupeSsid = existing.some((x) => x.ssid === w.ssid.trim() && x.id !== w.id);
  const errs = {
    ssid: !w.ssid.trim() ? 'Enter the network name exactly as the router broadcasts it' : w.ssid.length > 32 ? 'SSIDs are at most 32 characters' : dupeSsid ? 'This profile already configures that SSID' : undefined,
    password: !w.password ? 'Devices need the password to join without asking the user' : w.encryption !== 'wep' && (w.password.length < 8 || w.password.length > 63) ? 'WPA passwords are 8 to 63 characters' : undefined,
    proxyServer: w.proxy === 'manual' && !w.proxyServer.trim() ? 'Proxy server address' : undefined,
    proxyPort: w.proxy === 'manual' && !/^\d{1,5}$/.test(w.proxyPort) ? 'Port, e.g. 8080' : undefined,
    proxyUrl: w.proxy === 'auto' && !/^https?:\/\/\S+\.pac$/i.test(w.proxyUrl.trim()) ? 'A PAC file address ending in .pac' : undefined,
  };
  const invalid = Object.values(errs).some(Boolean);
  const show = (k: keyof typeof errs) => (tried ? errs[k] : undefined);
  const save = () => { setTried(true); if (invalid) return; onSave({ ...w, name: w.name.trim() || w.ssid.trim(), ssid: w.ssid.trim() }); onOpenChange(false); };
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title={initial ? 'Edit network configuration' : 'Add network configuration'} subtitle="Devices join this network automatically; users never see the password."
      footer={<><UButton tone="outline" size="lg" onClick={() => onOpenChange(false)}>Cancel</UButton><UButton size="lg" onClick={save}>{initial ? 'Save changes' : 'Add network'}</UButton></>}>
      <div className="flex flex-col gap-5 px-6 py-2">
        <Field label="Network profile name" info="Shown in the list only. Defaults to the SSID" placeholder="e.g., Head office Wi-Fi" value={w.name} onChange={(e) => up('name', e.target.value)} maxLength={60} autoFocus />
        <div className="grid grid-cols-2 gap-4">
          <Field label="SSID" required info="The network name, case-sensitive" placeholder="e.g., Contoso-Corp" value={w.ssid} onChange={(e) => up('ssid', e.target.value)} error={show('ssid')} autoComplete="off" />
          <Field label="Password" required info="Stored encrypted; devices use it silently" type={reveal ? 'text' : 'password'} placeholder="Network password" value={w.password} onChange={(e) => up('password', e.target.value)} error={show('password')} autoComplete="new-password"
            trailing={<button type="button" aria-label={reveal ? 'Hide password' : 'Show password'} aria-pressed={reveal} onClick={() => setReveal((r) => !r)} className="flex border-0 bg-transparent p-0 text-muted hover:text-ink">{reveal ? <EyeOff className="size-4" strokeWidth={1.7} /> : <Eye className="size-4" strokeWidth={1.7} />}</button>} />
        </div>
        <Pick label="Encryption" required info="Must match the access point. Any lets the device negotiate" value={w.encryption} onChange={(v) => up('encryption', v)} options={encryptionOptions} />
        {w.encryption === 'wep' && <InfoAlert tone="warn">WEP can be cracked in minutes and iOS marks it as insecure. Use it only for legacy equipment you can’t upgrade.</InfoAlert>}
        <div className="grid grid-cols-3 gap-4">
          <Choice name="Auto join" label="Auto Join" info="Deny means users must pick the network from Settings themselves" value={w.autoJoin} onChange={(v) => up('autoJoin', v as WifiNetwork['autoJoin'])} options={[['allow', 'Allow'], ['deny', 'Deny']]} />
          <Choice name="Hidden network" label="Hidden Network" info="Allow if the access point does not broadcast its SSID" value={w.hidden} onChange={(v) => up('hidden', v as WifiNetwork['hidden'])} options={[['allow', 'Allow'], ['deny', 'Deny']]} />
          <Choice name="MAC randomization" label="MAC Randomization" info="Deny if your network uses MAC-based access lists or captive portals tied to the device" value={w.macRandom} onChange={(v) => up('macRandom', v as WifiNetwork['macRandom'])} options={[['allow', 'Allow'], ['deny', 'Deny']]} />
        </div>
        <Pick label="Proxy Type" info="Route this network’s traffic through a proxy" value={w.proxy} onChange={(v) => up('proxy', v as WifiNetwork['proxy'])} options={[['none', 'None'], ['manual', 'Manual'], ['auto', 'Auto']]} />
        {w.proxy === 'manual' && (
          <div className="grid grid-cols-[1fr_160px] gap-4">
            <Field label="Proxy server" required placeholder="proxy.example.com" value={w.proxyServer} onChange={(e) => up('proxyServer', e.target.value)} error={show('proxyServer')} />
            <Field label="Port" required placeholder="8080" inputMode="numeric" value={w.proxyPort} onChange={(e) => up('proxyPort', e.target.value)} error={show('proxyPort')} />
          </div>
        )}
        {w.proxy === 'auto' && <Field label="Proxy auto-config URL" required info="A PAC file the device downloads when it joins" placeholder="https://proxy.example.com/proxy.pac" value={w.proxyUrl} onChange={(e) => up('proxyUrl', e.target.value)} error={show('proxyUrl')} inputMode="url" />}
      </div>
    </Drawer>
  );
}

export function WifiSection({ onChange, initial = 'empty' }: { onChange?: () => void; initial?: 'empty' | 'form' | 'list' }) {
  const list = useList<WifiNetwork>(onChange, {
    open: initial === 'form',
    items: initial === 'list' ? [{ ...blankWifi(), id: 'wifi-seed', name: 'Head office', ssid: 'Contoso-Corp', password: 'r3dw00d-pass', encryption: 'wpa2' }] : [],
  });
  const [revealed, setRevealed] = React.useState<string | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle sub="Wi-Fi networks devices join on their own, with the password kept out of users’ hands.">Wifi</SectionTitle>
      <ProfileFields onChange={onChange} />
      {list.items.length === 0 ? (
        <EmptyState icon={emptyWifi} title="No network configured" sub="Add a network so devices connect without users typing a password" className="min-h-[360px] border-0"
          action={<UButton size="lg" className="mt-2.5" onClick={list.create}>Add network configuration</UButton>} />
      ) : (
        <>
          <ListToolbar q={list.q} onQ={list.setQ} placeholder="Search networks" count={list.items.length} noun="network" onAdd={list.create} addLabel="Add new network configuration" />
          <div className="overflow-hidden rounded-[6px] border border-line">
            <table className="w-full border-collapse">
              <thead className="bg-[#fafafa]"><tr><th className={th}>Network profile name</th><th className={th}>SSID</th><th className={th}>Password</th><th className={th}>Encryption</th><th className={th}>Joins</th><th className="w-12"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {list.shown.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-[14px] text-muted">No network matches “{list.q}”.</td></tr>}
                {list.shown.map((n) => (
                  <React.Fragment key={n.id}>
                    <tr className={cn('border-t border-row text-[14px] transition-colors hover:bg-[#fafafa]', list.confirm === n.id && 'bg-[#fafafa]')}>
                      <td className="px-4 py-3"><span className="flex items-center gap-2"><button type="button" onClick={() => list.edit(n)} className="border-0 bg-transparent p-0 text-[14px] font-semibold text-uem hover:underline">{n.name}</button><StateChip state={list.stateOf(n)} /></span>{n.proxy !== 'none' && <span className="block text-[12px] text-muted">{n.proxy === 'manual' ? `Proxy ${n.proxyServer}:${n.proxyPort}` : 'Proxy via PAC file'}</span>}</td>
                      <td className="px-4 font-mono text-[13px]">{n.ssid}{n.hidden === 'allow' && <span className="ml-2 rounded-[8px] bg-chip px-2 py-px font-sans text-[11px] font-medium text-[#262626]">Hidden</span>}</td>
                      <td className="px-4">
                        <span className="flex items-center gap-2 font-mono text-[13px]">
                          {revealed === n.id ? n.password : '•'.repeat(Math.min(n.password.length, 12))}
                          <button type="button" aria-label={revealed === n.id ? `Hide password for ${n.name}` : `Show password for ${n.name}`} onClick={() => setRevealed((r) => (r === n.id ? null : n.id))} className="flex border-0 bg-transparent p-0 text-muted hover:text-ink">{revealed === n.id ? <EyeOff className="size-4" strokeWidth={1.7} /> : <Eye className="size-4" strokeWidth={1.7} />}</button>
                        </span>
                      </td>
                      <td className="px-4">{label(encryptionOptions, n.encryption)}{n.encryption === 'wep' && <span className="ml-2 rounded-[8px] bg-[#fff3e0] px-2 py-px text-[11px] font-medium text-[#7b341e]">Insecure</span>}</td>
                      <td className="px-4 text-muted">{n.autoJoin === 'allow' ? 'Automatically' : 'When the user picks it'}</td>
                      <td className="px-2">
                        <UMenu trigger={<IconButton label={`More actions for ${n.name}`}><MoreVertical className="size-4" strokeWidth={1.7} /></IconButton>}>
                          <UMenuItem icon={Pencil} onSelect={() => list.edit(n)}>Edit</UMenuItem>
                          <UMenuItem icon={Copy} onSelect={() => list.duplicate(n, `${n.name} copy`)}>Duplicate</UMenuItem>
                          <UMenuSeparator />
                          <UMenuItem icon={Trash2} danger onSelect={() => list.setConfirm(n.id)}>Remove…</UMenuItem>
                        </UMenu>
                      </td>
                    </tr>
                    {list.confirm === n.id && (
                      <tr className="bg-[#fafafa]"><td colSpan={6} className="px-4 pb-3">
                        <div role="alert" className="flex flex-col gap-2 text-[13px] text-muted">
                          <span>Remove {n.name}? After you submit, devices forget <span className="font-mono text-ink">{n.ssid}</span> and drop off it if connected. Users can’t rejoin without the password.</span>
                          <span className="flex gap-2"><UButton tone="danger" size="sm" onClick={() => list.remove(n)}><Trash2 strokeWidth={1.7} />Remove network</UButton><UButton tone="neutral" size="sm" autoFocus onClick={() => list.setConfirm(null)}>Cancel</UButton></span>
                        </div>
                      </td></tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {list.undo && <UndoRow onUndo={list.undoRemove}>Removed: <span className="text-ink">{list.undo.item.name}</span>. Devices forget the network after you submit unless you undo.</UndoRow>}
      <WifiDrawer open={list.open} onOpenChange={list.setOpen} initial={list.editing} onSave={list.save} existing={list.items} />
    </div>
  );
}
