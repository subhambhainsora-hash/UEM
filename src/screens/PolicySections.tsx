import * as React from 'react';
import { Check, ChevronDown, ExternalLink, Pencil, Plus, Server, Trash2 } from 'lucide-react';
import { EmptyState, Field, FieldLabel, fieldClass, InfoAlert, InfoDot, ProfileFields, RadioCard, SectionHeader, SectionTitle } from '../components/ds';
import { Drawer, UButton, UCheckbox, USwitch } from '../components/uem';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { cn } from '../components/ui/utils';
import tileMail from '../assets/ds/tile-mail.svg';
import emptyShortcut from '../assets/ds/empty-shortcut.svg';
import emptyFilter from '../assets/ds/empty-filter.svg';

const selectClass = 'h-11 w-full rounded-[6px] border-line bg-white px-2.5 text-[14px] text-ink hover:bg-white focus:border-uem data-[placeholder]:text-placeholder';

/* Collapsible server block (Incoming / Outgoing Mail Server) ------------------ */
function Collapsible({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  const id = React.useId();
  return (
    <div className="flex flex-col gap-5">
      <button type="button" aria-expanded={open} aria-controls={id} onClick={onToggle} className="flex w-full items-center gap-[15px] border-0 bg-transparent p-0 text-left">
        <span className="flex size-[33px] items-center justify-center rounded-[3px] bg-[#f2f2f2] text-ink"><Server className="size-[18px]" strokeWidth={1.7} /></span>
        <span className="text-[18px] leading-6 font-semibold text-heading">{title}</span>
        <ChevronDown className={cn('ml-auto size-5 text-ink transition-transform', open && 'rotate-180')} strokeWidth={1.7} />
      </button>
      {open && <div id={id} className="flex flex-col gap-5 pb-1">{children}</div>}
    </div>
  );
}

function ServerFields({ kind, onChange }: { kind: 'incoming' | 'outgoing'; onChange?: () => void }) {
  const [ssl, setSsl] = React.useState(true);
  const [auth, setAuth] = React.useState('password');
  return (
    <>
      <div className="flex gap-5">
        <Field className="grow" label="Host name" required info="Mail server address devices connect to" placeholder={kind === 'incoming' ? 'imap.example.com' : 'smtp.example.com'} onChange={onChange} />
        <Field className="w-[200px] shrink-0" label="Port" required placeholder={kind === 'incoming' ? '993' : '587'} inputMode="numeric" onChange={onChange} />
      </div>
      <div className="flex gap-5">
        <Field className="grow" label="Username" info="Leave empty to use the device user’s email address" placeholder="Use device user’s email" onChange={onChange} />
        <div className="flex w-[264px] shrink-0 flex-col gap-2">
          <FieldLabel info="How the device proves its identity to the server">Authentication</FieldLabel>
          <Select value={auth} onValueChange={(v) => { setAuth(v); onChange?.(); }}>
            <SelectTrigger className={selectClass}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="password">Password</SelectItem>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="md5">MD5 Challenge-Response</SelectItem>
              <SelectItem value="ntlm">NTLM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <label className="flex items-center gap-3 text-[14px] text-ink">
        <USwitch checked={ssl} onCheckedChange={(v) => { setSsl(v); onChange?.(); }} />
        Use SSL/TLS
        <InfoDot title="Encrypts traffic between the device and the mail server" />
      </label>
    </>
  );
}

/* Email --------------------------------------------------------------- */
export function EmailSection({ onChange }: { onChange?: () => void }) {
  const [type, setType] = React.useState<'imap' | 'google'>('imap');
  const [accountType, setAccountType] = React.useState('');
  const [opts, setOpts] = React.useState({ move: false, recent: false, maildrop: false, mailapp: false });
  const [incoming, setIncoming] = React.useState(false);
  const [outgoing, setOutgoing] = React.useState(false);
  const toggle = (k: keyof typeof opts) => { setOpts((o) => ({ ...o, [k]: !o[k] })); onChange?.(); };
  const options: [keyof typeof opts, string, string][] = [
    ['move', 'Prevent moving messages to other mail account', 'Messages can’t be moved or forwarded from this account to another'],
    ['recent', 'Disable recent mail address sync', 'Recently used addresses stay on the device only'],
    ['maildrop', 'Allow sending large attachments using Mail Drop', 'Attachments over 20 MB upload to iCloud and are sent as links'],
    ['mailapp', 'Only allow sending emails through the Apple Mail app', 'Third-party apps can’t send from this account'],
  ];

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle sub="Configure email account settings for your device">Email Configuration</SectionTitle>
      <ProfileFields onChange={onChange} />

      <div className="flex flex-col gap-2.5">
        <FieldLabel size="md" required info="Which kind of account the device adds">Mail Account Type</FieldLabel>
        <div className="flex gap-[15px]">
          <RadioCard name="mailtype" checked={type === 'imap'} onSelect={() => { setType('imap'); onChange?.(); }} title="Mail (IMAP/POP)" sub="Standard email configuration" />
          <RadioCard name="mailtype" checked={type === 'google'} onSelect={() => { setType('google'); onChange?.(); }} title="Google Account (OAuth)" sub="Secure OAuth authentication" />
        </div>
      </div>
      <hr className="m-0 border-0 border-t border-line" />

      <SectionHeader icon={tileMail}>General Settings</SectionHeader>
      {type === 'google' && (
        <InfoAlert>Users sign in with their Google Workspace account on the device. Server settings come from Google, so only the general settings below apply.</InfoAlert>
      )}
      <div className="flex gap-5">
        <Field className="grow" label="Account Description" info="Shown as the account name in Mail on the device" placeholder="Description" onChange={onChange} />
        {type === 'imap' && (
          <div className="flex w-[264px] shrink-0 flex-col gap-2">
            <FieldLabel info="IMAP keeps mail on the server; POP downloads it to the device">Account Type <span className="font-bold text-[red]">*</span></FieldLabel>
            <Select value={accountType} onValueChange={(v) => { setAccountType(v); onChange?.(); }}>
              <SelectTrigger className={selectClass}><SelectValue placeholder="Select IMAP / POP" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="imap">IMAP</SelectItem>
                <SelectItem value="pop">POP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="flex gap-5">
        {type === 'imap' && <Field className="grow" label="IMAP Path Prefix" info="Folder prefix some servers need, e.g. INBOX" placeholder="IMAP Prefix" disabled={accountType === 'pop'} onChange={onChange} />}
        <Field className="grow" label="Sender Name" info="Name recipients see on outgoing mail" placeholder="Enter sender name" onChange={onChange} />
      </div>
      <div className="flex flex-col gap-2.5">
        <Field label="Sender Email" info="Leave empty to use the address mapped to each device" placeholder="Enter sender email" onChange={onChange} />
        <p className="m-0 flex items-center gap-2.5 pl-[18px] text-[14px] text-ink">
          <span className="flex size-[18px] items-center justify-center rounded-full bg-uem text-white"><Check className="size-3" strokeWidth={2.5} /></span>
          “mail” will fetch the appropriate e-mail address mapped to the device.
          <InfoDot title="The %mail% placeholder resolves per device from the enrolled user" />
        </p>
      </div>

      <div className="flex flex-col gap-2.5 rounded-[6px] border-[1.26px] border-line px-5 py-[15px]">
        {options.map(([k, label, hint]) => (
          <label key={k} className="flex items-center gap-3 text-[14px] leading-5 text-ink">
            <UCheckbox checked={opts[k]} onCheckedChange={() => toggle(k)} />
            {label}
            <InfoDot title={hint} />
          </label>
        ))}
      </div>

      {type === 'imap' && (
        <>
          <hr className="m-0 border-0 border-t border-line" />
          <Collapsible title="Incoming Mail Server" open={incoming} onToggle={() => setIncoming((v) => !v)}>
            <ServerFields kind="incoming" onChange={onChange} />
          </Collapsible>
          <hr className="m-0 border-0 border-t border-line" />
          <Collapsible title="Outgoing Mail Server" open={outgoing} onToggle={() => setOutgoing((v) => !v)}>
            <ServerFields kind="outgoing" onChange={onChange} />
          </Collapsible>
        </>
      )}
    </div>
  );
}

/* Web Shortcuts -------------------------------------------------------- */
interface Shortcut { id: string; label: string; url: string; fullScreen: boolean; removable: boolean }

const isHttpUrl = (v: string) => /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(v.trim());

function ShortcutDrawer({ open, onOpenChange, initial, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; initial?: Shortcut; onSave: (s: Shortcut) => void }) {
  const [label, setLabel] = React.useState('');
  const [url, setUrl] = React.useState('');
  const [fullScreen, setFullScreen] = React.useState(false);
  const [removable, setRemovable] = React.useState(true);
  const [tried, setTried] = React.useState(false);
  React.useEffect(() => {
    if (!open) return;
    setLabel(initial?.label ?? ''); setUrl(initial?.url ?? ''); setFullScreen(initial?.fullScreen ?? false); setRemovable(initial?.removable ?? true); setTried(false);
  }, [open, initial]);
  const labelErr = tried && !label.trim() ? 'Give the shortcut a name users will recognise' : undefined;
  const urlErr = tried && !isHttpUrl(url) ? 'Enter a full address starting with https:// or http://' : undefined;
  const save = () => {
    setTried(true);
    if (!label.trim() || !isHttpUrl(url)) return;
    onSave({ id: initial?.id ?? `sc-${Date.now()}`, label: label.trim(), url: url.trim(), fullScreen, removable });
    onOpenChange(false);
  };
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={initial ? 'Edit web shortcut' : 'Create web shortcut'}
      subtitle="Adds a home-screen icon that opens the address in Safari"
      footer={
        <>
          <UButton tone="outline" size="lg" onClick={() => onOpenChange(false)}>Cancel</UButton>
          <UButton size="lg" onClick={save}>{initial ? 'Save changes' : 'Add shortcut'}</UButton>
        </>
      }
    >
      <div className="flex flex-col gap-5 px-6 py-2">
        <Field label="Label" required info="Text under the icon on the home screen" placeholder="e.g., Intranet" value={label} onChange={(e) => setLabel(e.target.value)} error={labelErr} maxLength={40} />
        <Field label="URL" required info="Opens in Safari when the icon is tapped" placeholder="https://intranet.example.com" value={url} onChange={(e) => setUrl(e.target.value)} error={urlErr} inputMode="url" />
        <div className="flex flex-col gap-3 rounded-[6px] border-[1.26px] border-line px-5 py-[15px]">
          <label className="flex items-center gap-3 text-[14px] text-ink">
            <USwitch checked={fullScreen} onCheckedChange={setFullScreen} />
            Open full screen
            <InfoDot title="Hides Safari’s address bar and controls so the page behaves like an app" />
          </label>
          <label className="flex items-center gap-3 text-[14px] text-ink">
            <USwitch checked={removable} onCheckedChange={setRemovable} />
            Users can remove the icon
            <InfoDot title="Off keeps the shortcut on the home screen until the profile is removed" />
          </label>
        </div>
      </div>
    </Drawer>
  );
}

export function WebShortcutsSection({ onChange }: { onChange?: () => void }) {
  const [items, setItems] = React.useState<Shortcut[]>([]);
  const [editing, setEditing] = React.useState<Shortcut | undefined>();
  const [open, setOpen] = React.useState(false);
  const create = () => { setEditing(undefined); setOpen(true); };
  const save = (s: Shortcut) => { setItems((x) => (x.some((y) => y.id === s.id) ? x.map((y) => (y.id === s.id ? s : y)) : [...x, s])); onChange?.(); };
  const remove = (id: string) => { setItems((x) => x.filter((y) => y.id !== id)); onChange?.(); };

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle sub="Pin web pages to the device home screen as icons">Web Shortcuts</SectionTitle>
      <ProfileFields onChange={onChange} />
      {items.length === 0 ? (
        <EmptyState
          icon={emptyShortcut}
          title="No web shortcuts configured"
          sub="Click the button below to start configuring a shortcut"
          className="min-h-[360px] border-0"
          action={<UButton size="lg" className="mt-2.5" onClick={create}>Create new shortcut</UButton>}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="m-0 text-[14px] text-muted">{items.length} shortcut{items.length === 1 ? '' : 's'} will be added to the home screen</p>
            <UButton size="lg" onClick={create}><Plus strokeWidth={1.7} />Add shortcut</UButton>
          </div>
          <ul className="m-0 list-none overflow-hidden rounded-[6px] border border-line p-0">
            {items.map((s) => (
              <li key={s.id} className="flex items-center gap-4 border-b border-row px-4 py-3 last:border-0">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-uem-soft text-uem"><ExternalLink className="size-[18px]" strokeWidth={1.7} /></span>
                <span className="flex min-w-0 grow flex-col">
                  <span className="truncate text-[14px] font-semibold text-heading">{s.label}</span>
                  <span className="truncate text-[12px] text-muted">{s.url}</span>
                </span>
                <span className="hidden gap-1.5 md:flex">
                  {s.fullScreen && <span className="rounded-[8px] bg-chip px-2 py-px text-[11px] font-medium text-[#262626]">Full screen</span>}
                  {!s.removable && <span className="rounded-[8px] bg-chip px-2 py-px text-[11px] font-medium text-[#262626]">Locked</span>}
                </span>
                <UButton tone="neutral" size="sm" aria-label={`Edit ${s.label}`} onClick={() => { setEditing(s); setOpen(true); }}><Pencil strokeWidth={1.7} /></UButton>
                <UButton tone="neutral" size="sm" aria-label={`Remove ${s.label}`} onClick={() => remove(s.id)}><Trash2 strokeWidth={1.7} /></UButton>
              </li>
            ))}
          </ul>
        </>
      )}
      <ShortcutDrawer open={open} onOpenChange={setOpen} initial={editing} onSave={save} />
    </div>
  );
}

/* Web Content Filter -------------------------------------------------- */
type FilterMode = 'adult' | 'allowlist';
interface Filter { mode: FilterMode; urls: string[] }

function UrlList({ label, info, placeholder, urls, onUrls, error }: { label: string; info: string; placeholder: string; urls: string[]; onUrls: (u: string[]) => void; error?: string }) {
  const [draft, setDraft] = React.useState('');
  const [draftErr, setDraftErr] = React.useState<string | undefined>();
  const id = React.useId();
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (!isHttpUrl(v)) { setDraftErr('Enter a full address starting with https:// or http://'); return; }
    if (urls.includes(v)) { setDraftErr('Already in the list'); return; }
    onUrls([...urls, v]); setDraft(''); setDraftErr(undefined);
  };
  return (
    <div className="flex flex-col gap-[11px]">
      <FieldLabel htmlFor={id} info={info}>{label}</FieldLabel>
      <div className="flex items-start gap-2">
        <input id={id} value={draft} onChange={(e) => { setDraft(e.target.value); setDraftErr(undefined); }} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} placeholder={placeholder} aria-invalid={!!(draftErr || error)} className={cn(fieldClass, 'outline-none')} />
        <UButton onClick={add} className="h-11 shrink-0 rounded-[9px] px-4 text-[13px] font-normal"><Plus className="size-[15px]" strokeWidth={1.7} />Add URL</UButton>
      </div>
      {(draftErr || error) && <p className="m-0 text-[12px] text-bad">{draftErr ?? error}</p>}
      {urls.length > 0 && (
        <ul className="m-0 list-none overflow-hidden rounded-[6px] border border-line p-0">
          {urls.map((u) => (
            <li key={u} className="flex items-center gap-3 border-b border-row px-3 py-2.5 text-[14px] last:border-0">
              <span className="grow truncate">{u}</span>
              <button type="button" aria-label={`Remove ${u}`} onClick={() => onUrls(urls.filter((x) => x !== u))} className="flex border-0 bg-transparent p-0 text-muted"><Trash2 className="size-4" strokeWidth={1.7} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterDrawer({ open, onOpenChange, initial, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; initial?: Filter; onSave: (f: Filter) => void }) {
  const [mode, setMode] = React.useState<FilterMode>('adult');
  const [urls, setUrls] = React.useState<string[]>([]);
  const [tried, setTried] = React.useState(false);
  React.useEffect(() => { if (open) { setMode(initial?.mode ?? 'adult'); setUrls(initial?.urls ?? []); setTried(false); } }, [open, initial]);
  const listErr = tried && mode === 'allowlist' && urls.length === 0 ? 'Add at least one website, or devices will have no web access at all' : undefined;
  const save = () => {
    setTried(true);
    if (mode === 'allowlist' && urls.length === 0) return;
    onSave({ mode, urls });
    onOpenChange(false);
  };
  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={initial ? 'Edit web content filter' : 'Create web content filter'}
      subtitle="Applies to Safari and every app that loads web content"
      footer={
        <>
          <UButton tone="outline" size="lg" onClick={() => onOpenChange(false)}>Cancel</UButton>
          <UButton size="lg" onClick={save}>{initial ? 'Save changes' : 'Add filter'}</UButton>
        </>
      }
    >
      <div className="flex flex-col gap-5 px-6 py-2">
        <div className="flex flex-col gap-2.5">
          <FieldLabel required info="Built-in iOS filtering; needs a supervised device">Filter type</FieldLabel>
          <div className="flex flex-col gap-2.5">
            <RadioCard name="filter" checked={mode === 'adult'} onSelect={() => setMode('adult')} title="Limit adult content" sub="Apple’s automatic filter, with your own always-allow and always-block lists" />
            <RadioCard name="filter" checked={mode === 'allowlist'} onSelect={() => setMode('allowlist')} title="Specific websites only" sub="Everything is blocked except the sites you list" />
          </div>
        </div>
        {mode === 'allowlist' ? (
          <UrlList label="Allowed websites" info="Only these sites open; everything else is blocked" placeholder="https://intranet.example.com" urls={urls} onUrls={setUrls} error={listErr} />
        ) : (
          <UrlList label="Always block" info="Blocked even if the automatic filter would allow them" placeholder="https://example.com" urls={urls} onUrls={setUrls} />
        )}
        {mode === 'allowlist' && <InfoAlert tone="warn">Users can’t reach any site outside this list, including sign-in pages your apps may redirect to.</InfoAlert>}
      </div>
    </Drawer>
  );
}

export function WebContentFilterSection({ onChange }: { onChange?: () => void }) {
  const [filter, setFilter] = React.useState<Filter | undefined>();
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex flex-col gap-5">
      <SectionTitle sub="Control which websites devices can open">Web Content Filter</SectionTitle>
      <ProfileFields onChange={onChange} />
      {!filter ? (
        <EmptyState
          icon={emptyFilter}
          title="No Web Content Filter Configured"
          sub="Click the button below to start configuring a filter"
          className="min-h-[360px] border-0"
          action={<UButton size="lg" className="mt-2.5" onClick={() => setOpen(true)}>Create new filter</UButton>}
        />
      ) : (
        <div className="flex items-center gap-4 rounded-[6px] border-[1.26px] border-line px-5 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-uem-soft"><img src={emptyFilter} alt="" className="size-5" /></span>
          <span className="flex grow flex-col">
            <span className="text-[14px] font-semibold text-heading">{filter.mode === 'adult' ? 'Limit adult content' : 'Specific websites only'}</span>
            <span className="text-[12px] text-muted">
              {filter.mode === 'adult'
                ? `Apple’s automatic filter · ${filter.urls.length} site${filter.urls.length === 1 ? '' : 's'} always blocked`
                : `${filter.urls.length} allowed site${filter.urls.length === 1 ? '' : 's'} · everything else blocked`}
            </span>
          </span>
          <UButton tone="outline" size="md" onClick={() => setOpen(true)}><Pencil strokeWidth={1.7} />Edit</UButton>
          <UButton tone="neutral" size="md" onClick={() => { setFilter(undefined); onChange?.(); }}><Trash2 strokeWidth={1.7} />Remove</UButton>
        </div>
      )}
      <FilterDrawer open={open} onOpenChange={setOpen} initial={filter} onSave={(f) => { setFilter(f); onChange?.(); }} />
    </div>
  );
}
