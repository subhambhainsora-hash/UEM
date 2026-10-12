import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileLayout, type Section } from '../components/ProfileLayout';
import { AppCatalogSection, type SourceTab } from './AppCatalog';
import { AddInhouseDrawer, AddStoreDrawer, AppSettingsDrawer } from './Drawers';
import { DiscardDialog, type Issue } from './Dialogs';
import { KioskSection, SsoSection, type KioskMode } from './KioskSso';
import { EmailSection, WebContentFilterSection, WebShortcutsSection } from './PolicySections';
import { ProfileFields, SectionTitle } from '../components/ds';
import { appStoreApps, enterpriseApps, libraryApps, plural, profile, storeSearchResults, type CatalogApp } from '../data';
import { useToast } from '../components/toast';

export interface ProfileState {
  section?: Section;
  tab?: SourceTab;
  drawer?: 'store' | 'library' | 'upload' | 'settings' | 'settings-enterprise';
  dialog?: 'country' | 'remove';
  kiosk?: KioskMode;
  kioskPicker?: boolean;
}

export function ProfilePage({ initial = {} }: { initial?: ProfileState }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [section, setSection] = React.useState<Section>(initial.section ?? 'App Catalog');
  const [tab, setTab] = React.useState<SourceTab>(initial.tab ?? 'store');
  const [store, setStore] = React.useState(appStoreApps);
  const [ent, setEnt] = React.useState(enterpriseApps);
  const [country, setCountry] = React.useState('United States');
  const [pendingCountry, setPendingCountry] = React.useState<string | null>(initial.dialog === 'country' ? 'India' : null);
  const [storeOpen, setStoreOpen] = React.useState(initial.drawer === 'store');
  const [inhouse, setInhouse] = React.useState<null | 'library' | 'upload'>(
    initial.drawer === 'library' || initial.drawer === 'upload' ? initial.drawer : null,
  );
  const [settingsApp, setSettingsApp] = React.useState<CatalogApp | null>(
    initial.drawer === 'settings' ? appStoreApps[0] : initial.drawer === 'settings-enterprise' ? enterpriseApps[0] : null,
  );
  const [confirming, setConfirming] = React.useState<string | null>(initial.dialog === 'remove' ? enterpriseApps[1].id : null);
  const [undo, setUndo] = React.useState<{ app: CatalogApp; index: number } | null>(null);
  /** Apps added since the last submit, for the "New · not submitted" chip. */
  const [addedIds, setAddedIds] = React.useState<string[]>([]);
  const [editedIds, setEditedIds] = React.useState<string[]>([]);
  const [kiosk, setKiosk] = React.useState<KioskMode>(initial.kiosk ?? 'single');
  const [kioskApp, setKioskApp] = React.useState('survey');
  const [ssoAllowed, setSsoAllowed] = React.useState(
    initial.dialog === 'remove' ? ['slack', 'outlook', 'crm', 'survey'] : ['slack', 'outlook', 'crm'],
  );
  const [ssoAll, setSsoAll] = React.useState(false);
  const catalog = [...store, ...ent];

  /* Unsaved-change tracking. Every mutation that would reach devices bumps the count. */
  const [dirty, setDirty] = React.useState(0);
  const [dirtySections, setDirtySections] = React.useState<string[]>([]);
  const [status, setStatus] = React.useState<'idle' | 'blocked' | 'submitted'>('idle');
  const touch = () => { setDirty((d) => d + 1); setDirtySections((x) => (x.includes(section) ? x : [...x, section])); setStatus('idle'); };
  const [discardOpen, setDiscardOpen] = React.useState(false);
  const stateOf = (a: CatalogApp): 'new' | 'edited' | null => (addedIds.includes(a.id) ? 'new' : editedIds.includes(a.id) ? 'edited' : null);
  const clean = () => { setDirty(0); setDirtySections([]); setAddedIds([]); setEditedIds([]); setUndo(null); setConfirming(null); };
  /* Discard: back to what devices have today. */
  const discard = () => {
    setStore(appStoreApps); setEnt(enterpriseApps); setCountry('United States'); setKiosk(initial.kiosk ?? 'single'); setKioskApp('survey');
    setSsoAllowed(['slack', 'outlook', 'crm']); setSsoAll(false); setShowIssues(false); clean(); setStatus('idle');
    toast({ title: 'Changes discarded', sub: `${profile.name} is back to what its ${plural(profile.deviceCount, 'device')} have today.`, tone: 'info' });
  };
  React.useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  /* Validation. Runs on Submit; flagged sections stay marked until fixed. */
  const issues: Issue[] = [];
  if (kiosk === 'single' && !catalog.some((a) => a.id === kioskApp)) issues.push({ section: 'Kiosk', message: 'Single App mode needs an app from this profile’s App Catalog' });
  if (!ssoAll && ssoAllowed.length === 0) issues.push({ section: 'Extensible SSO', message: 'Pick at least one app that may use SSO, or allow every app' });
  const expired = ent.filter((a) => a.signingExpires && new Date(a.signingExpires) < new Date('2026-10-12'));
  for (const a of expired) issues.push({ section: 'App Catalog', message: `${a.name} has an expired signing profile and can’t install. Upload a re-signed build or remove it` });
  const [showIssues, setShowIssues] = React.useState(false);

  const submit = () => {
    if (!dirty) return;
    if (issues.length) { setShowIssues(true); setStatus('blocked'); return; }
    const n = dirty;
    setShowIssues(false); clean(); setStatus('submitted');
    toast({ title: `${profile.name} submitted`, sub: `${plural(n, 'change')} reach ${plural(profile.deviceCount, 'device')} at next check-in, usually within 15 minutes. Recorded in the audit log.` });
    window.setTimeout(() => setStatus((s) => (s === 'submitted' ? 'idle' : s)), 6000);
  };
  const cancel = () => (dirty ? setDiscardOpen(true) : navigate('/'));

  const removeApp = (a: CatalogApp) => {
    const index = (a.source === 'App Store' ? store : ent).findIndex((x) => x.id === a.id);
    setUndo({ app: a, index });
    setStore((s) => s.filter((x) => x.id !== a.id));
    setEnt((s) => s.filter((x) => x.id !== a.id));
    setSsoAllowed((s) => s.filter((x) => x !== a.id));
    if (kioskApp === a.id) setKioskApp('');
    setConfirming(null);
    if (addedIds.includes(a.id)) { setAddedIds((x) => x.filter((y) => y !== a.id)); setDirty((d) => Math.max(0, d - 1)); } else touch();
  };
  const undoRemove = () => {
    if (!undo) return;
    const { app, index } = undo;
    const put = (s: CatalogApp[]) => { const l = [...s]; l.splice(Math.min(index, l.length), 0, app); return l; };
    if (app.source === 'App Store') setStore(put); else setEnt(put);
    setUndo(null);
    setDirty((d) => Math.max(0, d - 1));
  };

  return (
    <ProfileLayout
      section={section}
      onSection={setSection}
      dirty={dirty}
      dirtySections={dirtySections}
      issueSections={showIssues ? issues.map((i) => i.section) : []}
      status={showIssues && issues.length ? 'blocked' : status}
      onCancel={cancel}
      onSubmit={submit}
      onDiscard={discard}
    >
      {section === 'App Catalog' && (
        <AppCatalogSection
          tab={tab}
          onTab={setTab}
          storeApps={store}
          enterpriseApps={ent}
          country={country}
          onCountry={(c) => c !== country && setPendingCountry(c)}
          onAddStore={() => setStoreOpen(true)}
          onAddInhouse={() => setInhouse('library')}
          onConfigure={setSettingsApp}
          onRemove={(a) => { setConfirming(a.id); setUndo(null); }}
          showIssues={showIssues}
          onChange={touch}
          stateOf={stateOf}
          confirming={confirming}
          impactOf={(a) => ({ kiosk: kiosk === 'single' && kioskApp === a.id, sso: !ssoAll && ssoAllowed.includes(a.id) })}
          onConfirmRemove={removeApp}
          onCancelRemove={() => setConfirming(null)}
          undo={undo}
          onUndo={undoRemove}
          pendingCountry={pendingCountry}
          onKeepCountry={() => setPendingCountry(null)}
          onSwitchCountry={() => { setCountry(pendingCountry!); setPendingCountry(null); touch(); toast({ title: `App Store country switched to ${pendingCountry}`, sub: 'Contoso Payroll leaves the catalog after you submit. Recorded in the audit log.' }); }}
        />
      )}
      {section === 'Kiosk' && (
        <KioskSection
          mode={kiosk}
          onMode={(m) => { setKiosk(m); touch(); }}
          catalog={catalog}
          singleApp={kioskApp}
          onSingleApp={(id) => { setKioskApp(id); touch(); }}
          pickerOpen={initial.kioskPicker}
          onAddApps={() => { setSection('App Catalog'); setStoreOpen(true); }}
          onChange={touch}
          error={showIssues ? issues.find((i) => i.section === 'Kiosk')?.message : undefined}
        />
      )}
      {section === 'Extensible SSO' && (
        <SsoSection
          catalog={catalog}
          allowed={ssoAllowed}
          onAllowed={(ids) => { setSsoAllowed(ids); touch(); }}
          all={ssoAll}
          onAll={(v) => { setSsoAll(v); touch(); }}
          onChange={touch}
          error={showIssues ? issues.find((i) => i.section === 'Extensible SSO')?.message : undefined}
        />
      )}
      {section === 'Email' && <EmailSection onChange={touch} />}
      {section === 'Web Shortcuts' && <WebShortcutsSection onChange={touch} />}
      {section === 'Web Content Filter' && <WebContentFilterSection onChange={touch} />}
      {!['App Catalog', 'Kiosk', 'Extensible SSO', 'Email', 'Web Shortcuts', 'Web Content Filter'].includes(section) && (
        <div className="flex flex-col gap-5">
          <SectionTitle sub="This section keeps its current screens; it isn't part of the App Catalog design.">{section}</SectionTitle>
          <ProfileFields onChange={touch} />
        </div>
      )}

      <AddStoreDrawer
        open={storeOpen}
        onOpenChange={setStoreOpen}
        country={country}
        existing={store.map((a) => a.id)}
        onAdd={(ids) => {
          const added = storeSearchResults
            .filter((r) => ids.includes(r.id) && !store.some((s) => s.id === r.id))
            .map((r) => ({ id: r.id, name: r.name, bundleId: r.bundleId, initials: r.initials, color: r.color, logo: r.logo, source: 'App Store' as const, chips: [] }));
          if (added.length) { setStore((s) => [...s, ...added]); setAddedIds((x) => [...x, ...added.map((a) => a.id)]); touch(); toast({ title: `${plural(added.length, 'app')} added to the App Catalog`, sub: `${plural(profile.deviceCount, 'device')} install ${added.length === 1 ? 'it' : 'them'} after you submit.` }); }
          setStoreOpen(false);
        }}
      />
      <AddInhouseDrawer
        open={!!inhouse}
        onOpenChange={(o) => !o && setInhouse(null)}
        initialMode={inhouse ?? 'library'}
        inProfile={ent.map((a) => a.id)}
        onAdd={(ids) => {
          const added = libraryApps
            .filter((l) => ids.includes(l.id) && !ent.some((a) => a.id === l.id))
            .map((l) => ({ id: l.id, name: l.name, bundleId: l.bundleId, initials: l.initials, color: l.color, source: 'Enterprise' as const, chips: [], meta: `build ${l.build} · ${l.delivery === 'Hosted .ipa' ? 'hosted .ipa' : 'manifest URL'}`, signingExpires: l.signingExpires }));
          if (added.length) { setEnt((s) => [...s, ...added]); setAddedIds((x) => [...x, ...added.map((a) => a.id)]); touch(); toast({ title: `${plural(added.length, 'app')} added to the App Catalog`, sub: `${plural(profile.deviceCount, 'device')} install ${added.length === 1 ? 'it' : 'them'} after you submit.` }); }
          setInhouse(null);
        }}
        onUpload={(b, src) => {
          const id = b.bundleId.split('.').pop() + '-' + Date.now();
          setAddedIds((x) => [...x, id]);
          setEnt((s) => [...s, { id, name: b.appName, bundleId: b.bundleId, initials: b.appName.slice(0, 2).toUpperCase(), color: '#455a64', source: 'Enterprise' as const, chips: [], meta: `build ${b.version} · ${src === 'ipa' ? 'hosted .ipa' : 'manifest URL'}`, signingExpires: b.signingExpires }]);
          touch();
          toast({ title: `${b.appName} ${b.version} saved to App Groups and added here`, sub: `${plural(profile.deviceCount, 'device')} install it after you submit.` });
        }}
      />
      <AppSettingsDrawer app={settingsApp} onOpenChange={(o) => !o && setSettingsApp(null)} onSave={() => { touch(); if (settingsApp && !addedIds.includes(settingsApp.id)) setEditedIds((x) => (x.includes(settingsApp.id) ? x : [...x, settingsApp.id])); if (settingsApp) toast({ title: `Settings saved for ${settingsApp.name}`, sub: `${plural(profile.deviceCount, 'device')} get them after you submit.` }); }} />
      <DiscardDialog open={discardOpen} count={dirty} onKeep={() => setDiscardOpen(false)} onDiscard={() => { clean(); setDiscardOpen(false); navigate('/'); }} />
    </ProfileLayout>
  );
}
