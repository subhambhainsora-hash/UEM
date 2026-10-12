import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileLayout, type Section } from '../components/ProfileLayout';
import { AppCatalogSection, type SourceTab } from './AppCatalog';
import { AddInhouseDrawer, AddStoreDrawer, AppSettingsDrawer } from './Drawers';
import { CountryDialog, DiscardDialog, RemoveDialog, SavedDialog, SubmitBlockedDialog, type Issue } from './Dialogs';
import { KioskSection, SsoSection, type KioskMode } from './KioskSso';
import { EmailSection, WebContentFilterSection, WebShortcutsSection } from './PolicySections';
import { ProfileFields, SectionTitle } from '../components/ds';
import { appStoreApps, enterpriseApps, libraryApps, storeSearchResults, type CatalogApp } from '../data';

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
  const [removing, setRemoving] = React.useState<CatalogApp | null>(initial.dialog === 'remove' ? enterpriseApps[1] : null);
  const [kiosk, setKiosk] = React.useState<KioskMode>(initial.kiosk ?? 'single');
  const [kioskApp, setKioskApp] = React.useState('survey');
  const [ssoAllowed, setSsoAllowed] = React.useState(
    initial.dialog === 'remove' ? ['slack', 'outlook', 'crm', 'survey'] : ['slack', 'outlook', 'crm'],
  );
  const [ssoAll, setSsoAll] = React.useState(false);
  const catalog = [...store, ...ent];

  /* Unsaved-change tracking. Every mutation that would reach devices bumps the count. */
  const [dirty, setDirty] = React.useState(0);
  const touch = () => setDirty((d) => d + 1);
  const [discardOpen, setDiscardOpen] = React.useState(false);
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
  const [blockedOpen, setBlockedOpen] = React.useState(false);
  const [savedOpen, setSavedOpen] = React.useState(false);
  const [savedCount, setSavedCount] = React.useState(0);

  const submit = () => {
    if (issues.length) { setShowIssues(true); setBlockedOpen(true); return; }
    setSavedCount(dirty); setDirty(0); setShowIssues(false); setSavedOpen(true);
  };
  const cancel = () => (dirty ? setDiscardOpen(true) : navigate('/'));

  const removeApp = (a: CatalogApp) => {
    setStore((s) => s.filter((x) => x.id !== a.id));
    setEnt((s) => s.filter((x) => x.id !== a.id));
    setSsoAllowed((s) => s.filter((x) => x !== a.id));
    if (kioskApp === a.id) setKioskApp('');
    setRemoving(null);
    touch();
  };

  return (
    <ProfileLayout
      section={section}
      onSection={setSection}
      dirty={dirty}
      issueSections={showIssues ? issues.map((i) => i.section) : []}
      onCancel={cancel}
      onSubmit={submit}
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
          onRemove={setRemoving}
          showIssues={showIssues}
          onChange={touch}
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
          if (added.length) { setStore((s) => [...s, ...added]); touch(); }
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
          if (added.length) { setEnt((s) => [...s, ...added]); touch(); }
          setInhouse(null);
        }}
      />
      <AppSettingsDrawer app={settingsApp} onOpenChange={(o) => !o && setSettingsApp(null)} onSave={touch} />
      <CountryDialog
        open={!!pendingCountry}
        to={pendingCountry ?? ''}
        from={country}
        onKeep={() => setPendingCountry(null)}
        onSwitch={() => { setCountry(pendingCountry!); setPendingCountry(null); touch(); }}
      />
      <RemoveDialog
        open={!!removing}
        name={removing?.name ?? ''}
        usedByKiosk={!!removing && kiosk === 'single' && kioskApp === removing.id}
        usedBySso={!!removing && !ssoAll && ssoAllowed.includes(removing.id)}
        onKeep={() => setRemoving(null)}
        onRemove={() => removing && removeApp(removing)}
      />
      <DiscardDialog open={discardOpen} count={dirty} onKeep={() => setDiscardOpen(false)} onDiscard={() => { setDirty(0); setDiscardOpen(false); navigate('/'); }} />
      <SubmitBlockedDialog open={blockedOpen} issues={issues} onClose={() => setBlockedOpen(false)} onGo={(s) => { setSection(s as Section); setBlockedOpen(false); }} />
      <SavedDialog open={savedOpen} count={savedCount} onClose={() => setSavedOpen(false)} />
    </ProfileLayout>
  );
}
