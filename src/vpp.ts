/**
 * Apple Volume Purchase Program (Apps and Books): the token that connects this MDM to
 * Apple Business Manager, the licensed apps it exposes, and per-device assignments.
 * Content and flows follow the engineering VPP screens; the UI is the UEM design system.
 */
import wordLogo from './assets/logos/word.png';
import slackLogo from './assets/logos/slack.png';
import lightroomLogo from './assets/logos/lightroom.png';
import keynoteLogo from './assets/logos/keynote.png';
import finalcutLogo from './assets/logos/finalcut.png';
import { plural } from './data';

export type TokenState = 'none' | 'connected' | 'releasing' | 'expiring' | 'revoked' | 'expired';

export interface VppToken {
  org: string;
  location: string;
  expires: string;
  lastSynced: string;
  licensedApps: number;
  /** Profiles that currently install VPP apps through this token. */
  usedBy: { name: string; devices: number }[];
  assignedLicenses: number;
  assignedDevices: number;
}

export const vppToken: VppToken = {
  org: 'Xecurify Inc.',
  location: 'HQ Location',
  expires: '2027-09-18',
  lastSynced: '30 Sep 2026, 02:00',
  licensedApps: 7,
  usedBy: [{ name: 'Sales Baseline', devices: 148 }, { name: 'Warehouse Kiosk', devices: 36 }, { name: 'Exec iPads', devices: 12 }],
  assignedLicenses: 42,
  assignedDevices: 38,
};

/** What another MDM already holds on this token; shown on upload before taking it over. */
export const takeover = { mdm: 'JumpCloud', licenses: 46, apps: 5 };

export type Platform = 'iOS' | 'macOS';
export type AssignStatus = 'Installed' | 'Installing' | 'Pending' | 'Associated' | 'Failed';

export interface Assignment {
  device: string;
  group: string;
  location: string;
  serial?: string;
  user?: string;
  status: AssignStatus;
  reason?: string;
}

export interface VppApp {
  id: string;
  name: string;
  bundleId: string;
  platforms: Platform[];
  /** null means unlimited. */
  total: number | null;
  available: number | null;
  logo?: string;
  color: string;
  /** Apple returned no metadata for this bundle; only the adam id is known. */
  metadataMissing?: boolean;
  /** Device-based licences aren't offered; only User Enrollment devices receive it. */
  userLicenseOnly?: boolean;
  assignments: Assignment[];
}

export const vppApps: VppApp[] = [
  { id: 'lightroom', name: 'Adobe Lightroom', bundleId: 'com.adobe.lrmobile', platforms: ['iOS'], total: 10, available: 4, logo: lightroomLogo, color: '#1e73be', assignments: [
    { device: 'iPad13,18', group: 'Field Ops', location: 'HQ Location', serial: 'DMPXQ3N1Q1GC', user: 'r.shah@xecurify.com', status: 'Installed' },
    { device: 'iPad14,3', group: 'Field Ops', location: 'HQ Location', serial: 'H7QW2KX0PF', user: 'm.iyer@xecurify.com', status: 'Installing' },
    { device: 'iPhone15,2', group: 'Sales Team', location: 'HQ Location', serial: 'LKPMQ6X9V2', user: 'j.doe@xecurify.com', status: 'Pending' },
    { device: 'iPhone14,5', group: 'default', location: 'HQ Location', user: 'a.kumar@xecurify.com', status: 'Associated' },
    { device: 'iPhone13,2', group: 'default', location: 'HQ Location', user: 'a.kumar@xecurify.com', status: 'Associated' },
    { device: 'iPad12,1', group: 'Warehouse', location: 'HQ Location', serial: 'GG7ZK9V1Q2', user: 's.patel@xecurify.com', status: 'Failed', reason: 'No licences available. Buy more in Apple Business Manager.' },
  ] },
  { id: 'agslides', name: 'AG Slides', bundleId: 'com.agslides.ipad', platforms: ['iOS'], total: 10, available: 10, color: '#b45309', assignments: [] },
  { id: 'word', name: 'Microsoft Word', bundleId: 'com.microsoft.Office.Word', platforms: ['iOS', 'macOS'], total: 50, available: 31, logo: wordLogo, color: '#1f5fa8', assignments: [
    { device: 'iPhone15,2', group: 'Sales Team', location: 'HQ Location', serial: 'LKPMQ6X9V2', user: 'j.doe@xecurify.com', status: 'Installed' },
    { device: 'iPad13,18', group: 'Field Ops', location: 'HQ Location', serial: 'DMPXQ3N1Q1GC', user: 'r.shah@xecurify.com', status: 'Installed' },
    { device: 'MacBookPro18,3', group: 'Exec', location: 'HQ Location', serial: 'C02XG2JHJG5J', status: 'Installed' },
    { device: 'iPhone14,5', group: 'default', location: 'HQ Location', user: 'a.kumar@xecurify.com', status: 'Associated' },
  ] },
  { id: 'keynote', name: 'Keynote', bundleId: 'com.apple.iWork.Keynote', platforms: ['iOS', 'macOS'], total: null, available: null, logo: keynoteLogo, color: '#1565c0', assignments: [] },
  { id: 'finalcut', name: 'Final Cut Pro', bundleId: 'com.apple.FinalCut', platforms: ['macOS'], total: 5, available: 3, logo: finalcutLogo, color: '#111', assignments: [
    { device: 'MacBookPro18,3', group: 'Exec', location: 'HQ Location', serial: 'C02XG2JHJG5J', status: 'Installed' },
    { device: 'Mac14,2', group: 'Exec', location: 'HQ Location', serial: 'F9FXK1Z4HG7F', status: 'Installed' },
  ] },
  { id: 'slack-ipad', name: 'Slack for iPad', bundleId: 'com.tinyspeck.chatlyio', platforms: ['iOS'], total: 25, available: 0, logo: slackLogo, color: '#5b3a8c', assignments: [
    { device: 'iPad12,1', group: 'Warehouse', location: 'HQ Location', serial: 'GG7ZK9V1Q2', user: 's.patel@xecurify.com', status: 'Failed', reason: 'No licences available. Buy more in Apple Business Manager.' },
    { device: 'iPad12,2', group: 'Warehouse', location: 'HQ Location', serial: 'GG7ZK9V1Q3', user: 'n.rao@xecurify.com', status: 'Failed', reason: 'No licences available. Buy more in Apple Business Manager.' },
  ] },
  { id: 'fieldforce', name: 'FieldForce Inspect', bundleId: 'com.fieldforce.inspect', platforms: ['iOS'], total: 40, available: 40, color: '#00695c', userLicenseOnly: true, assignments: [] },
  { id: '1486329711', name: '1486329711', bundleId: 'Metadata unavailable', platforms: ['iOS'], total: 5, available: 5, color: '#6b7280', metadataMissing: true, assignments: [] },
];

export const licenceLabel = (a: VppApp) => (a.total === null ? 'Unlimited licences' : `${a.available} of ${a.total} available`);
export const failedCount = (a: VppApp) => a.assignments.filter((x) => x.status === 'Failed').length;
export const installCounts = (a: VppApp) => ({
  installed: a.assignments.filter((x) => x.status === 'Installed').length,
  pending: a.assignments.filter((x) => x.status === 'Pending' || x.status === 'Installing').length,
  failed: failedCount(a),
});
export const tokenExpiryLabel = (iso: string) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
export const daysUntil = (iso: string) => Math.round((new Date(iso + 'T00:00:00Z').getTime() - new Date('2026-10-12T00:00:00Z').getTime()) / 86_400_000);
export const plur = plural;
