import slackLogo from './assets/logos/slack.png';
import zoomLogo from './assets/logos/zoom.png';
import outlookLogo from './assets/logos/outlook.png';
import teamsLogo from './assets/logos/teams.png';
import authenticatorLogo from './assets/logos/authenticator.png';
import edgeLogo from './assets/logos/edge.png';
import onedriveLogo from './assets/logos/onedrive.png';
import wordLogo from './assets/logos/word.png';

export type Source = 'App Store' | 'Enterprise';

/** The profile being edited. Device count drives every impact message. */
export const profile = { name: 'Sales Baseline', deviceCount: 148 };

/** Prototype "today". Signing states are computed against this date. */
export const TODAY = new Date('2026-10-12T00:00:00Z');

export type SigningState =
  | { kind: 'ok'; label: string }
  | { kind: 'expiring'; label: string; days: number }
  | { kind: 'expired'; label: string; days: number }
  | { kind: 'none'; label: string };

export function signingState(expires?: string): SigningState {
  if (!expires) return { kind: 'none', label: 'Not in manifest' };
  const d = new Date(expires + 'T00:00:00Z');
  const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const days = Math.round((d.getTime() - TODAY.getTime()) / 86_400_000);
  if (days < 0) return { kind: 'expired', label, days: -days };
  if (days <= 60) return { kind: 'expiring', label, days };
  return { kind: 'ok', label };
}

export interface CatalogApp {
  id: string;
  name: string;
  bundleId: string;
  initials: string;
  color: string;
  source: Source;
  chips: string[];
  meta?: string;
  /** Real App Store artwork. In-house apps have none and show the generic tile. */
  logo?: string;
  /** Enterprise apps only: ISO date the signing profile expires. */
  signingExpires?: string;
}

export const appStoreApps: CatalogApp[] = [
  { id: 'slack', name: 'Slack', bundleId: 'com.tinyspeck.chatlyio', initials: 'S', color: '#5b3a8c', logo: slackLogo, source: 'App Store', chips: ['Removable', 'Managed config'] },
  { id: 'zoom', name: 'Zoom Workplace', bundleId: 'us.zoom.videomeetings', initials: 'Z', color: '#2d6cdf', logo: zoomLogo, source: 'App Store', chips: ['Removable', 'Per-app VPN'] },
  { id: 'outlook', name: 'Microsoft Outlook', bundleId: 'com.microsoft.Office.Outlook', initials: 'O', color: '#1f5fa8', logo: outlookLogo, source: 'App Store', chips: ['Managed config', 'Prevent backup'] },
];

export const enterpriseApps: CatalogApp[] = [
  { id: 'crm', name: 'Acme CRM (Production)', bundleId: 'com.acme.crm', initials: 'AC', color: '#b45309', source: 'Enterprise', chips: ['Per-app VPN', '1 associated domain'], meta: 'build 3.4.1 · hosted .ipa', signingExpires: '2027-03-31' },
  { id: 'survey', name: 'Acme Field Survey', bundleId: 'com.acme.survey', initials: 'FS', color: '#00695c', source: 'Enterprise', chips: ['Removable'], meta: 'build 1.8.0 · manifest URL' },
];

export const storeSearchResults = [
  { id: 'teams', name: 'Microsoft Teams', bundleId: 'com.microsoft.skype.teams', initials: 'T', color: '#4b53bc', logo: teamsLogo },
  { id: 'outlook', name: 'Microsoft Outlook', bundleId: 'com.microsoft.Office.Outlook', initials: 'O', color: '#1f5fa8', logo: outlookLogo },
  { id: 'auth', name: 'Microsoft Authenticator', bundleId: 'com.microsoft.azureauthenticator', initials: 'MA', color: '#0052cc', logo: authenticatorLogo },
  { id: 'edge', name: 'Microsoft Edge', bundleId: 'com.microsoft.microsoftedge', initials: 'E', color: '#00695c', logo: edgeLogo },
  { id: 'onedrive', name: 'Microsoft OneDrive', bundleId: 'com.microsoft.skydrive', initials: 'OD', color: '#1565c0', logo: onedriveLogo },
  { id: 'word', name: 'Microsoft Word', bundleId: 'com.microsoft.Office.Word', initials: 'W', color: '#1f5fa8', logo: wordLogo },
];

export interface Build {
  version: string;
  status: 'Available' | 'Retired';
  uploaded: string;
}

export interface LibraryApp {
  id: string;
  name: string;
  bundleId: string;
  initials: string;
  color: string;
  build: string;
  delivery: 'Hosted .ipa' | 'Manifest URL';
  /** In-house apps ship no public artwork; the generic tile is used. */
  logo?: string;
  signingExpires?: string;
  /** Profiles that install this app, and the devices they cover. */
  usedBy: { profiles: number; devices: number };
  builds: Build[];
}

export const libraryApps: LibraryApp[] = [
  { id: 'crm', name: 'Acme CRM (Production)', bundleId: 'com.acme.crm', initials: 'AC', color: '#b45309', build: '3.4.1', delivery: 'Hosted .ipa', signingExpires: '2027-03-31', usedBy: { profiles: 2, devices: 312 },
    builds: [{ version: '3.4.1', status: 'Available', uploaded: '18 Sep 2026' }, { version: '3.4.0', status: 'Retired', uploaded: '2 Jul 2026' }, { version: '3.3.2', status: 'Retired', uploaded: '14 Apr 2026' }] },
  { id: 'crm-beta', name: 'Acme CRM (Beta)', bundleId: 'com.acme.crm', initials: 'AC', color: '#7b341e', build: '3.5.0', delivery: 'Hosted .ipa', signingExpires: '2027-03-31', usedBy: { profiles: 0, devices: 0 },
    builds: [{ version: '3.5.0', status: 'Available', uploaded: '1 Oct 2026' }] },
  { id: 'survey', name: 'Acme Field Survey', bundleId: 'com.acme.survey', initials: 'FS', color: '#00695c', build: '1.8.0', delivery: 'Manifest URL', usedBy: { profiles: 1, devices: 148 },
    builds: [{ version: '1.8.0', status: 'Available', uploaded: '22 Aug 2026' }] },
  { id: 'expense', name: 'Acme Expense', bundleId: 'com.acme.expense', initials: 'AE', color: '#1565c0', build: '2.0.3', delivery: 'Hosted .ipa', signingExpires: '2026-11-12', usedBy: { profiles: 0, devices: 0 },
    builds: [{ version: '2.0.3', status: 'Available', uploaded: '9 Sep 2026' }] },
  { id: 'inventory', name: 'Acme Inventory', bundleId: 'com.acme.inventory', initials: 'AI', color: '#4e342e', build: '1.2.0', delivery: 'Hosted .ipa', signingExpires: '2026-09-30', usedBy: { profiles: 1, devices: 36 },
    builds: [{ version: '1.2.0', status: 'Available', uploaded: '3 Mar 2026' }] },
];

export const allCatalog = [...appStoreApps, ...enterpriseApps];

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
