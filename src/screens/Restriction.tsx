/**
 * Restriction · the iOS restriction payload, grouped the way Apple groups it.
 * Content from Figma "UEM Dashboard design" (Profile configuration › Restriction);
 * layout and flows follow the finalized UEM screens.
 */
import * as React from 'react';
import { Apple, RotateCcw, Search, Smartphone, X } from 'lucide-react';
import { CountBadge, USwitch } from '../components/uem';
import { FieldLabel, InfoAlert, InfoDot, ProfileFields, SectionTitle, tabListClass, tabTriggerClass } from '../components/ds';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';
import { cn } from '../components/ui/utils';

/* Data ---------------------------------------------------------------------- */
export type RestrictionTab =
  | 'Device Functionality' | 'Security' | 'Advanced Security' | 'Safari' | 'Apps'
  | 'Networking & Roaming' | 'iCloud' | 'Privacy' | 'Date & Time' | 'Keyboard';

type Kind = 'allow' | 'yesno' | 'select';
interface SubToggle { id: string; label: string; hint: string }
interface Row {
  id: string;
  label: string;
  hint: string;
  kind?: Kind;
  options?: [string, string][];
  /** Default value; 'allow' / 'yes' / first option when omitted. */
  def?: string;
  /** Minimum iOS version shown on the chip. */
  os?: string;
  /** Applies on BYOD (user-enrolled) devices too. Supervision-only settings are marked false. */
  byod?: boolean;
  sub?: SubToggle[];
  /** Explained when the user restricts this. */
  consequence?: string;
}

export const restrictionTabs: RestrictionTab[] = [
  'Device Functionality', 'Security', 'Advanced Security', 'Safari', 'Apps', 'Networking & Roaming', 'iCloud', 'Privacy', 'Date & Time', 'Keyboard',
];

const data: Record<RestrictionTab, Row[]> = {
  'Device Functionality': [
    { id: 'camera', label: 'Camera', hint: 'Deny removes the Camera app and blocks camera access for every app', consequence: 'FaceTime and any app that scans codes or captures photos stop working.' },
    { id: 'facetime', label: 'Facetime', hint: 'Video and audio calls over FaceTime' },
    { id: 'screenshot', label: 'Screenshots & Screen Recording', hint: 'Capturing the screen, including during screen sharing and Classroom observation' },
    { id: 'airdrop', label: 'Airdrop', hint: 'Sharing files with nearby Apple devices', byod: false, consequence: 'Users can’t receive files from nearby devices either.' },
    { id: 'airdrop-unmanaged', label: 'Airdrop as unmanaged drop point', hint: 'Treats AirDrop as an unmanaged destination, so managed apps can’t share into it', byod: false },
    { id: 'spotlight', label: 'Spotlight internet search', hint: 'Spotlight suggestions from the internet', byod: false },
    { id: 'imessage', label: 'iMessage', hint: 'Messages over Apple’s iMessage service; SMS still works', byod: false },
    { id: 'siri', label: 'Siri', hint: 'Siri and Dictation that relies on Siri', sub: [{ id: 'siri-locked', label: 'Siri while device is locked', hint: 'Siri answers from the lock screen without a passcode' }] },
    { id: 'devicename', label: 'Modify device name', hint: 'Users can rename the device in Settings', byod: false },
    { id: 'airprint', label: 'Airprint', hint: 'Printing to AirPrint printers', byod: false, sub: [{ id: 'airprint-store', label: 'Store AirPrint credentials in Keychain', hint: 'Printer usernames and passwords are remembered on the device' }] },
  ],
  Security: [
    { id: 'share-managed', label: 'Share data between managed and unmanaged apps', hint: 'Open-in and share-sheet boundary between work apps and personal apps', kind: 'select', options: [['both', 'Allow both ways'], ['m2u', 'Block managed → unmanaged'], ['u2m', 'Block unmanaged → managed'], ['none', 'Block both ways']], def: 'm2u' },
    { id: 'copypaste', label: 'Copy-Paste', hint: 'Whether the clipboard follows the managed-app boundary', kind: 'select', options: [['any', 'Allow everywhere'], ['managed', 'Managed apps only'], ['none', 'Block between managed and unmanaged']], def: 'managed', os: '15+' },
    { id: 'encbackup', label: 'Force encrypted backup', hint: 'iTunes and Finder backups must be encrypted', kind: 'yesno', def: 'yes' },
    { id: 'erase', label: 'Wipe device by erasing all content and settings', hint: 'The user-initiated erase in Settings', byod: false, consequence: 'Users can’t wipe a lost device themselves; IT does it from here.' },
    { id: 'screentime', label: 'Configure Screen Time/Restrictions on device', hint: 'The user can set their own Screen Time restrictions', byod: false },
    { id: 'passbook-locked', label: 'Passbook when device is locked', hint: 'Wallet passes show on the lock screen' },
    { id: 'biometric', label: 'Bio-metric methods to unlock devices', hint: 'Face ID and Touch ID for unlock', consequence: 'Users must type the passcode every time. Expect more help-desk resets.' },
  ],
  'Advanced Security': [
    { id: 'profiles', label: 'Install configuration profiles and certificates interactively', hint: 'Users can install profiles from Safari, Mail or AirDrop', byod: false },
    { id: 'accounts', label: 'Add/modify Mail, iCloud, Contacts, Calender and other accounts', hint: 'Account settings become read-only; MDM-delivered accounts still apply', byod: false },
    { id: 'tls', label: 'Prompt user for untrusted TLS certificates', hint: 'Deny blocks untrusted certificates silently instead of asking' },
    { id: 'usb-locked', label: 'Allow USB connection when locked', hint: 'USB accessories work while the device is locked', byod: false },
    { id: 'usb-files', label: 'USB access to Files app', hint: 'External drives show in the Files app', byod: false },
    { id: 'recovery', label: 'Allow unpaired computers to boot devices into recovery mode', hint: 'An unpaired Mac or PC can force recovery mode over USB', kind: 'yesno', def: 'no', byod: false, os: '14.5+' },
    { id: 'pw-airdrop', label: 'Allow password sharing via Airdrop', hint: 'Keychain passwords can be shared with nearby devices', byod: false },
    { id: 'pw-nearby', label: 'Request passwords from nearby devices', hint: 'Wi-Fi password requests from nearby Apple devices', byod: false },
    { id: 'passcode-modify', label: 'Modify passcode', hint: 'Users can change or remove their passcode', byod: false, consequence: 'Passcode changes only come from this profile’s Passcode section.' },
    { id: 'airplay-in', label: 'Force password for AirPlay incoming requests', hint: 'Devices receiving AirPlay must be given a password', kind: 'yesno', def: 'yes', byod: false },
    { id: 'airplay-out', label: 'Force password for AirPlay outgoing requests', hint: 'Sending to an AirPlay target always asks for its password', kind: 'yesno', def: 'no', byod: false },
    { id: 'watch', label: 'Pair with Apple watch', hint: 'Pairing an Apple Watch with this device', byod: false },
    { id: 'wrist', label: 'Wrist detection for paired Apple watch', hint: 'Forces wrist detection on, so the watch locks when removed', kind: 'yesno', def: 'yes', byod: false },
    { id: 'proximity', label: 'Set up other devices using proximity detection', hint: 'Quick Start setup of a new device by holding it nearby', byod: false },
    { id: 'autofill', label: 'Autofill passwords using Keychain and third-party password managers', hint: 'Password AutoFill in apps and Safari', byod: false, sub: [{ id: 'autofill-3p', label: 'Third-party password managers', hint: 'AutoFill from 1Password, Bitwarden and similar apps' }] },
  ],
  Safari: [
    { id: 'safari', label: 'Safari', hint: 'Deny hides Safari; web shortcuts and in-app browsers still work', byod: false, consequence: 'Links in Mail and other apps have nowhere to open unless another browser is installed.' },
    { id: 'cookies', label: 'Safari Accept Cookies', hint: 'Which cookies Safari stores', kind: 'select', options: [['always', 'Always'], ['visited', 'From websites I visit'], ['current', 'From current website only'], ['never', 'Never']], def: 'visited' },
    { id: 'safari-autofill', label: 'Safari Autofill', hint: 'Safari fills forms from Contacts and saved logins', kind: 'yesno', def: 'yes' },
    { id: 'safari-js', label: 'Safari Execute Javascript', hint: 'Deny breaks most modern websites', kind: 'yesno', def: 'yes' },
    { id: 'safari-popups', label: 'Safari Allow Popups', hint: 'Pop-up windows', kind: 'yesno', def: 'no' },
    { id: 'safari-fraud', label: 'Safari Fraud Site Warning', hint: 'Warns before known phishing and malware sites', kind: 'yesno', def: 'yes' },
  ],
  Apps: [
    { id: 'appstore', label: 'App Store', hint: 'Deny hides the App Store; apps in this profile’s App Catalog still install', byod: false },
    { id: 'untrusted', label: 'Unapproved/untrusted app installation', hint: 'Installing apps outside the App Store and this MDM', byod: false },
    { id: 'configurator', label: 'Allow configurator/itunes to install/update apps', hint: 'Apple Configurator and Finder can push apps over USB', byod: false },
    { id: 'tls-apps', label: 'Prompt user for untrusted TLS certificates', hint: 'Apps ask the user before trusting an unknown certificate' },
    { id: 'appdelete', label: 'App deletion', hint: 'Users can delete apps from the home screen', byod: false, consequence: 'Apps from this profile can’t be removed by users either way; this covers the rest.' },
    { id: 'sysappdelete', label: 'System App Deletion', hint: 'Removing built-in Apple apps such as Mail or Maps', byod: false },
    { id: 'autodownload', label: 'Downloads apps automatically on multiple devices with same Apple ID', hint: 'Automatic Downloads of purchases made on other devices' },
    { id: 'iap', label: 'In-app purchase', hint: 'Purchases inside apps' },
    { id: 'gamecenter', label: 'Gamecenter', hint: 'Apple’s Game Center service', byod: false, sub: [{ id: 'gc-multi', label: 'Gamecenter Multiplayer', hint: 'Playing against other people' }, { id: 'gc-friends', label: 'Gamecenter add friends', hint: 'Sending and accepting friend requests' }] },
    { id: 'notif', label: 'Modify notification settings', hint: 'Users can change how apps notify them', byod: false },
    { id: 'itunes', label: 'iTunes store', hint: 'Buying music, films and TV' },
    { id: 'podcast', label: 'Podcast App', hint: 'Apple Podcasts', byod: false },
    { id: 'news', label: 'News App', hint: 'Apple News', byod: false },
    { id: 'music', label: 'Music Services', hint: 'Apple Music streaming', byod: false },
    { id: 'radio', label: 'Radio Services', hint: 'Apple Music radio stations', byod: false },
    { id: 'books', label: 'Book Store', hint: 'Apple Books store', byod: false, sub: [{ id: 'books-erotica', label: 'Book Store Erotic Content', hint: 'Content Apple tags as explicit' }] },
  ],
  'Networking & Roaming': [
    { id: 'roam-sync', label: 'Automatic sync while roaming', hint: 'Mail, calendar and contact sync on a roaming network' },
    { id: 'cellular-apps', label: 'Modify cellular data usage for apps', hint: 'Users can switch mobile data on or off per app' },
    { id: 'bluetooth', label: 'Modify bluetooth', hint: 'Changing Bluetooth settings', byod: false, sub: [{ id: 'bt-sharing', label: 'Modify bluetooth sharing settings', hint: 'The Bluetooth Sharing privacy setting' }] },
    { id: 'vpn-config', label: 'Allow configuring VPN', hint: 'Users can add their own VPN configurations', byod: false, consequence: 'Only the Per-App VPN from this profile remains.' },
    { id: 'wifi-always', label: 'Always on Wi-Fi', hint: 'Wi-Fi can’t be switched off from Control Centre or Settings', byod: false, kind: 'yesno', def: 'no' },
    { id: 'wifi-mdm', label: 'Connect to Wi-Fi if distributed via MDM', hint: 'Deny limits the device to the networks in this profile’s Wifi section', byod: false, kind: 'yesno', def: 'no', consequence: 'Devices can’t join any other Wi-Fi network, including home networks.' },
    { id: 'hotspot', label: 'Modify Personal Hotspot', hint: 'Users can change hotspot settings', byod: false },
    { id: 'esim', label: 'Modify e-SIM settings', hint: 'Adding or removing cellular plans', byod: false },
    { id: 'nfc', label: 'Near-Field Communications (NFC)', hint: 'NFC for tags and payments', byod: false, os: '14.2+' },
  ],
  iCloud: [
    { id: 'icloud-backup', label: 'Device backup', hint: 'iCloud Backup of the whole device', consequence: 'Work data on the device is lost if it is wiped without another backup.' },
    { id: 'icloud-managed-docs', label: 'Sync data and documents from managed apps', hint: 'Managed apps store documents in iCloud Drive', def: 'deny' },
    { id: 'icloud-docs', label: 'Sync device data and documents', hint: 'iCloud Drive for personal apps' },
    { id: 'icloud-photostream', label: 'Sync shared photo stream', hint: 'Shared Albums' },
    { id: 'icloud-keychain', label: 'Sync keychain', hint: 'Passwords sync to the user’s other Apple devices' },
    { id: 'icloud-photos', label: 'Sync iCloud photo library', hint: 'Photos upload to iCloud' },
    { id: 'icloud-books', label: 'Enterprise books backup', hint: 'MDM-distributed books back up to iCloud' },
    { id: 'icloud-notes', label: 'Enterprise books, notes and highlights sync', hint: 'Annotations in distributed books sync across devices' },
    { id: 'icloud-relay', label: 'iCloud private relay', hint: 'Hides the device’s IP from websites; can break IP-based access rules', os: '15+', byod: false, consequence: 'Needed if your firewall or SSO rules depend on the device’s IP address.' },
  ],
  Privacy: [
    { id: 'findfriends', label: 'Find my friends', hint: 'Location sharing with people', byod: false, sub: [{ id: 'findfriends-modify', label: 'Modify find my friends', hint: 'Users can change who sees their location' }] },
    { id: 'finddevice', label: 'Find my device', hint: 'Find My for this device', byod: false, consequence: 'A lost device can’t be located or locked remotely by the user.' },
    { id: 'diagnostics', label: 'Send diagnostics data to Apple', hint: 'Analytics and crash reports sent to Apple', sub: [{ id: 'diag-ui', label: 'Modify Diagnostics & Usage UI settings', hint: 'Users can change the analytics setting themselves' }] },
    { id: 'adtracking', label: 'Force limited ad tracking', hint: 'Apps can’t use the advertising identifier', kind: 'yesno', def: 'yes' },
    { id: 'lock-cc', label: 'Lockscreen control center', hint: 'Control Centre on the lock screen' },
    { id: 'lock-notif', label: 'Lockscreen notification view', hint: 'Notification previews on the lock screen' },
    { id: 'lock-today', label: 'Lockscreen today view', hint: 'Widgets on the lock screen' },
    { id: 'mail-privacy', label: 'Mail privacy protection', hint: 'Hides IP and blocks tracking pixels in Mail', os: '15.2+', kind: 'yesno', def: 'yes' },
  ],
  'Date & Time': [
    { id: 'settime', label: 'Set device time', hint: 'Automatic time keeps certificate and token validation reliable', kind: 'select', options: [['auto', 'Automatically via location service'], ['user', 'User controlled']], def: 'auto', byod: false, consequence: 'A wrong clock makes certificates and SSO tokens fail.' },
  ],
  Keyboard: [
    { id: 'lookup', label: 'Dictionary word lookup', hint: 'Look Up on selected text', byod: false },
    { id: 'predictive', label: 'Predictive keyboard', hint: 'Word suggestions above the keyboard', byod: false },
    { id: 'autocorrect', label: 'Auto correct', hint: 'Automatic correction while typing', byod: false },
    { id: 'spellcheck', label: 'Spellcheck', hint: 'Underlines misspelt words', byod: false },
    { id: 'shortcuts', label: 'Shortcuts', hint: 'Text replacement shortcuts', byod: false },
    { id: 'dictation', label: 'Dictation', hint: 'Voice typing', byod: false, sub: [{ id: 'dictation-device', label: 'Process dictation on device', hint: 'Speech is never sent to Apple servers' }] },
    { id: 'translation', label: 'Process translation on device', hint: 'Translate without sending text to Apple', byod: false, kind: 'yesno', def: 'no', os: '15+' },
    { id: 'swipe', label: 'Swipe keyboard', hint: 'QuickPath swipe typing', byod: false },
  ],
};

const defaultOf = (r: Row) => r.def ?? (r.kind === 'yesno' ? 'yes' : r.kind === 'select' ? r.options![0][0] : 'allow');
const allRows = restrictionTabs.flatMap((t) => data[t].map((r) => ({ tab: t, row: r })));

/** Settings that differ from Apple's defaults, i.e. what this profile restricts. */
export function restrictedCount(values: Record<string, string>, tab?: RestrictionTab) {
  return allRows.filter(({ tab: t, row }) => (!tab || t === tab) && (values[row.id] ?? defaultOf(row)) !== defaultOf(row)).length;
}

/* Pieces -------------------------------------------------------------------- */
const seg = 'h-9 rounded-none border border-line bg-white px-3.5 text-[13px] text-ink hover:bg-[#f3f3f5] hover:text-ink first:rounded-l-[5px] last:rounded-r-[5px] data-[state=on]:border-uem data-[state=on]:bg-uem-soft data-[state=on]:text-uem data-[state=on]:hover:bg-uem-soft data-[state=on]:hover:text-uem';
const selectClass = 'h-9 w-[250px] rounded-[6px] border-line bg-white px-2.5 text-[13px] text-ink hover:bg-white focus:border-uem';

function OsChip({ os, byod }: { os: string; byod: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-flex items-center gap-1 rounded-[8px] bg-[#e6f7f4] px-2 py-px text-[11px] font-medium text-[#0b6e5c]" title={`Needs iOS ${os}`}>
        <Apple className="size-3" strokeWidth={2} />Apple {os}
      </span>
      {byod ? (
        <span className="inline-flex items-center gap-1 rounded-[8px] bg-uem-soft px-2 py-px text-[11px] font-medium text-[#1565c0]" title="Also applies to user-enrolled (BYOD) devices">
          <Smartphone className="size-3" strokeWidth={2} />BYOD
        </span>
      ) : (
        <span className="inline-flex items-center rounded-[8px] bg-chip px-2 py-px text-[11px] font-medium text-[#262626]" title="Supervised devices only; ignored on BYOD enrolments">Supervised</span>
      )}
    </span>
  );
}

function RestrictionRow({ row, value, onValue, subs, onSub, highlight }: {
  row: Row; value: string; onValue: (v: string) => void; subs: Record<string, boolean>; onSub: (id: string, v: boolean) => void; highlight?: string;
}) {
  const kind: Kind = row.kind ?? 'allow';
  const def = defaultOf(row);
  const changed = value !== def;
  const restricted = kind === 'allow' ? value === 'deny' : changed;
  const parentOff = kind === 'allow' && value === 'deny';
  const mark = (text: string) => {
    if (!highlight) return text;
    const i = text.toLowerCase().indexOf(highlight.toLowerCase());
    if (i < 0) return text;
    return <>{text.slice(0, i)}<mark className="rounded-sm bg-[#fff1b8] text-inherit">{text.slice(i, i + highlight.length)}</mark>{text.slice(i + highlight.length)}</>;
  };
  return (
    <div className="flex flex-col border-b border-row last:border-0">
      <div className="flex min-h-[58px] items-center gap-4 py-2">
        <div className="flex min-w-0 grow flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="flex items-center gap-1.5 text-[14px] text-ink">
            <span>{mark(row.label)}</span>
            <InfoDot title={row.hint} />
          </span>
          <OsChip os={row.os ?? '14+'} byod={row.byod ?? true} />
          {changed && <span className="rounded-[8px] bg-[#fff7d6] px-2 py-px text-[11px] font-medium text-[#7a5a00]">Changed</span>}
        </div>
        {kind === 'select' ? (
          <Select value={value} onValueChange={onValue}>
            <SelectTrigger aria-label={row.label} className={selectClass}><SelectValue /></SelectTrigger>
            <SelectContent>{row.options!.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
          </Select>
        ) : (
          <ToggleGroup type="single" value={value} onValueChange={(v) => v && onValue(v)} aria-label={row.label} className="shrink-0 gap-0 rounded-none">
            {kind === 'allow' ? (
              <><ToggleGroupItem value="allow" className={seg}>Allow</ToggleGroupItem><ToggleGroupItem value="deny" className={seg}>Deny</ToggleGroupItem></>
            ) : (
              <><ToggleGroupItem value="yes" className={seg}>Yes</ToggleGroupItem><ToggleGroupItem value="no" className={seg}>No</ToggleGroupItem></>
            )}
          </ToggleGroup>
        )}
      </div>
      {restricted && row.consequence && <p className="m-0 -mt-1 pb-2.5 text-[12px] text-[#7b341e]">{row.consequence}</p>}
      {row.sub && (
        <div className={cn('mb-2.5 ml-5 flex flex-col gap-2 border-l-0 rounded-[6px] bg-[#fafafa] px-4 py-2.5', parentOff && 'opacity-60')}>
          {row.sub.map((s) => (
            <label key={s.id} className="flex items-center gap-3 text-[13px] text-ink">
              <USwitch checked={!parentOff && (subs[s.id] ?? true)} disabled={parentOff} onCheckedChange={(v) => onSub(s.id, v)} aria-label={s.label} />
              <span>{mark(s.label)}</span>
              <InfoDot title={s.hint} />
            </label>
          ))}
          {parentOff && <span className="text-[12px] text-muted">Off while {row.label} is denied.</span>}
        </div>
      )}
    </div>
  );
}

/* Section ------------------------------------------------------------------- */
export function RestrictionSection({ onChange, initialTab = 'Device Functionality', values, onValues }: {
  onChange?: () => void;
  initialTab?: RestrictionTab;
  values: Record<string, string>;
  onValues: (next: Record<string, string>) => void;
}) {
  const [tab, setTab] = React.useState<RestrictionTab>(initialTab);
  const [subs, setSubs] = React.useState<Record<string, boolean>>({});
  const [q, setQ] = React.useState('');
  const searchRef = React.useRef<HTMLInputElement>(null);
  const set = (id: string, v: string) => { onValues({ ...values, [id]: v }); onChange?.(); };
  const setSub = (id: string, v: boolean) => { setSubs((s) => ({ ...s, [id]: v })); onChange?.(); };
  const valueOf = (r: Row) => values[r.id] ?? defaultOf(r);
  const total = restrictedCount(values);
  const inTab = restrictedCount(values, tab);
  const resetTab = () => {
    const next = { ...values };
    for (const r of data[tab]) delete next[r.id];
    onValues(next); onChange?.();
  };

  const query = q.trim();
  const matches = query
    ? allRows.filter(({ row }) => (row.label + ' ' + row.hint + ' ' + (row.sub ?? []).map((s) => s.label).join(' ')).toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle sub="What users can do on devices carrying this profile. Apple’s defaults allow everything; each Deny is a restriction devices enforce.">Restriction</SectionTitle>
      <ProfileFields onChange={onChange} />

      <div className="flex items-center gap-3">
        <label className="flex h-11 w-[340px] items-center gap-2.5 rounded-[6px] border border-line px-3 focus-within:border-uem">
          <Search className="size-4 text-muted" strokeWidth={1.7} />
          <Input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && setQ('')} placeholder="Find a setting, e.g. AirDrop" aria-label="Find a restriction setting" className="h-auto border-0 bg-transparent p-0 text-[14px] shadow-none focus-visible:ring-0" />
          {q && <button type="button" aria-label="Clear search" onClick={() => { setQ(''); searchRef.current?.focus(); }} className="flex border-0 bg-transparent p-0 text-muted hover:text-ink"><X className="size-4" strokeWidth={1.7} /></button>}
        </label>
        <span className="text-[13px] text-muted" aria-live="polite">
          {total === 0 ? 'Nothing restricted yet; devices keep Apple’s defaults.' : `${total} setting${total === 1 ? '' : 's'} restricted across ${new Set(allRows.filter(({ row }) => valueOf(row) !== defaultOf(row)).map((x) => x.tab)).size} categor${total === 1 ? 'y' : 'ies'}.`}
        </span>
      </div>

      {query ? (
        <div className="flex flex-col gap-4">
          <p className="m-0 text-[13px] text-muted">{matches.length === 0 ? <>No setting matches “{query}”.</> : `${matches.length} setting${matches.length === 1 ? '' : 's'} match “${query}”`}</p>
          {restrictionTabs.filter((t) => matches.some((m) => m.tab === t)).map((t) => (
            <div key={t} className="flex flex-col">
              <div className="flex items-center gap-2 pb-1">
                <FieldLabel>{t}</FieldLabel>
                <button type="button" onClick={() => { setTab(t); setQ(''); }} className="border-0 bg-transparent p-0 text-[12px] text-uem hover:underline">Open category</button>
              </div>
              {matches.filter((m) => m.tab === t).map(({ row }) => (
                <RestrictionRow key={row.id} row={row} value={valueOf(row)} onValue={(v) => set(row.id, v)} subs={subs} onSub={setSub} highlight={query} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <Tabs value={tab} onValueChange={(v) => setTab(v as RestrictionTab)} className="gap-0">
          <div>
            <TabsList aria-label="Restriction categories" className={cn(tabListClass, 'flex-wrap')}>
              {restrictionTabs.map((t) => {
                const n = restrictedCount(values, t);
                return (
                  <TabsTrigger key={t} value={t} className={cn(tabTriggerClass, 'px-2.5 text-[13px]')}>
                    {t}{n > 0 && <CountBadge n={n} active={tab === t} />}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
          <div className="flex items-center justify-between pt-5 pb-1">
            <h3 className="m-0 text-[18px] leading-6 font-semibold text-heading">{tab === 'Device Functionality' ? 'Device settings' : tab}</h3>
            {inTab > 0 && (
              <button type="button" onClick={resetTab} className="flex items-center gap-1.5 border-0 bg-transparent p-0 text-[13px] text-uem hover:underline">
                <RotateCcw className="size-3.5" strokeWidth={1.7} />Reset {tab} to Apple defaults
              </button>
            )}
          </div>
          {tab === 'Date & Time' && <InfoAlert>Automatic time is what keeps certificates, SSO tokens and audit timestamps trustworthy. Leave it on unless devices never have location access.</InfoAlert>}
          {tab === 'Security' && (values['share-managed'] === 'both' || values['copypaste'] === 'any') && (
            <InfoAlert tone="warn">Allowing data to move freely between managed and unmanaged apps undoes the work/personal boundary. Work documents can be copied into personal apps and cloud storage.</InfoAlert>
          )}
          <div className="flex flex-col">
            {data[tab].map((row) => (
              <RestrictionRow key={row.id} row={row} value={valueOf(row)} onValue={(v) => set(row.id, v)} subs={subs} onSub={setSub} />
            ))}
          </div>
        </Tabs>
      )}
    </div>
  );
}

/* Per-App VPN --------------------------------------------------------------- */
export function PerAppVpnSection({ onChange, value, onValue, onOpenCatalog, appCount }: {
  onChange?: () => void; value: 'none' | 'miniorange'; onValue: (v: 'none' | 'miniorange') => void; onOpenCatalog: () => void; appCount: number;
}) {
  return (
    <div className="flex flex-col gap-5">
      <SectionTitle sub="Route chosen apps through a VPN tunnel, without putting the whole device on the VPN.">Per-App VPN</SectionTitle>
      <ProfileFields onChange={onChange} />
      <div className="flex items-center gap-4 rounded-[6px] border-[1.26px] border-line px-5 py-4">
        <div className="flex grow flex-col gap-0.5">
          <span className="flex items-center gap-1.5 text-[14px] font-semibold text-heading">Per-App VPN<InfoDot title="The VPN provider apps in this profile may use. Each app opts in from its settings in the App Catalog." /></span>
          <span className="text-[12px] text-muted">{value === 'none' ? 'No VPN is pushed. Apps use the device’s normal connection.' : 'miniOrange VPN is installed on devices. Apps use it only when you turn it on for them.'}</span>
        </div>
        <Select value={value} onValueChange={(v) => { onValue(v as 'none' | 'miniorange'); onChange?.(); }}>
          <SelectTrigger aria-label="Per-App VPN provider" className={selectClass}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="miniorange">miniOrange</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {value === 'miniorange' && (
        <InfoAlert>
          {appCount === 0 ? 'This profile has no apps yet. ' : `This profile has ${appCount} app${appCount === 1 ? '' : 's'}. `}
          Open an app’s settings in the App Catalog and switch on “Requires VPN for networking” for each app that should reach internal systems. Apps without it stay on the normal connection.{' '}
          <button type="button" onClick={onOpenCatalog} className="border-0 bg-transparent p-0 font-semibold text-uem hover:underline">Go to App Catalog</button>
        </InfoAlert>
      )}
    </div>
  );
}
