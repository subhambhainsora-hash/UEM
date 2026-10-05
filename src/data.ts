export type Source = 'App Store' | 'Enterprise';

export interface CatalogApp {
  id: string;
  name: string;
  bundleId: string;
  initials: string;
  color: string;
  source: Source;
  chips: string[];
  meta?: string;
}

export const appStoreApps: CatalogApp[] = [
  { id: 'slack', name: 'Slack', bundleId: 'com.tinyspeck.chatlyio', initials: 'S', color: '#5b3a8c', source: 'App Store', chips: ['Removable', 'Managed config'] },
  { id: 'zoom', name: 'Zoom Workplace', bundleId: 'us.zoom.videomeetings', initials: 'Z', color: '#2d6cdf', source: 'App Store', chips: ['Removable', 'Per-app VPN'] },
  { id: 'outlook', name: 'Microsoft Outlook', bundleId: 'com.microsoft.Office.Outlook', initials: 'O', color: '#1f5fa8', source: 'App Store', chips: ['Managed config', 'Prevent backup'] },
];

export const enterpriseApps: CatalogApp[] = [
  { id: 'crm', name: 'Acme CRM (Production)', bundleId: 'com.acme.crm', initials: 'AC', color: '#b45309', source: 'Enterprise', chips: ['Per-app VPN', '1 associated domain'], meta: 'build 3.4.1 · hosted .ipa' },
  { id: 'survey', name: 'Acme Field Survey', bundleId: 'com.acme.survey', initials: 'FS', color: '#00695c', source: 'Enterprise', chips: ['Removable'], meta: 'build 1.8.0 · manifest URL' },
];

export const storeSearchResults = [
  { id: 'teams', name: 'Microsoft Teams', initials: 'T', color: '#4b53bc' },
  { id: 'outlook', name: 'Microsoft Outlook', initials: 'O', color: '#1f5fa8' },
  { id: 'auth', name: 'Microsoft Authenticator', initials: 'MA', color: '#0052cc' },
  { id: 'edge', name: 'Microsoft Edge', initials: 'E', color: '#00695c' },
  { id: 'onedrive', name: 'Microsoft OneDrive', initials: 'OD', color: '#1565c0' },
  { id: 'word', name: 'Microsoft Word', initials: 'W', color: '#1f5fa8' },
];

export interface LibraryApp {
  id: string;
  name: string;
  bundleId: string;
  initials: string;
  color: string;
  build: string;
  delivery: 'Hosted .ipa' | 'Manifest URL';
  signing: string;
  signingWarn?: boolean;
  usedBy: string;
  usedByLink?: boolean;
}

export const libraryApps: LibraryApp[] = [
  { id: 'crm', name: 'Acme CRM (Production)', bundleId: 'com.acme.crm', initials: 'AC', color: '#b45309', build: '3.4.1', delivery: 'Hosted .ipa', signing: '31 Mar 2027', usedBy: '2 profiles', usedByLink: true },
  { id: 'crm-beta', name: 'Acme CRM (Beta)', bundleId: 'com.acme.crm', initials: 'AC', color: '#7b341e', build: '3.5.0', delivery: 'Hosted .ipa', signing: '31 Mar 2027', usedBy: 'Not used' },
  { id: 'survey', name: 'Acme Field Survey', bundleId: 'com.acme.survey', initials: 'FS', color: '#00695c', build: '1.8.0', delivery: 'Manifest URL', signing: 'Not in manifest', usedBy: '1 profile', usedByLink: true },
  { id: 'expense', name: 'Acme Expense', bundleId: 'com.acme.expense', initials: 'AE', color: '#1565c0', build: '2.0.3', delivery: 'Hosted .ipa', signing: '12 Nov 2026 · in 47 days', signingWarn: true, usedBy: 'Not used' },
];

export const allCatalog = [...appStoreApps, ...enterpriseApps];
