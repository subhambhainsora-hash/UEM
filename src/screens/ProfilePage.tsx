import * as React from 'react';
import { ProfileLayout, type Section } from '../components/ProfileLayout';
import { AppCatalogSection, type SourceTab } from './AppCatalog';
import { AddInhouseDrawer, AddStoreDrawer, AppSettingsDrawer } from './Drawers';
import { CountryDialog, RemoveDialog } from './Dialogs';
import { KioskSection, SsoSection, type KioskMode } from './KioskSso';
import { appStoreApps, enterpriseApps, storeSearchResults, type CatalogApp } from '../data';

export interface ProfileState {
  section?: Section;
  tab?: SourceTab;
  drawer?: 'store' | 'library' | 'upload' | 'settings' | 'settings-enterprise';
  dialog?: 'country' | 'remove';
  kiosk?: KioskMode;
  kioskPicker?: boolean;
}

export function ProfilePage({ initial = {} }: { initial?: ProfileState }) {
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
  const catalog = [...store, ...ent];

  const removeApp = (a: CatalogApp) => {
    setStore((s) => s.filter((x) => x.id !== a.id));
    setEnt((s) => s.filter((x) => x.id !== a.id));
    setSsoAllowed((s) => s.filter((x) => x !== a.id));
    if (kioskApp === a.id) setKioskApp('');
    setRemoving(null);
  };

  return (
    <ProfileLayout section={section} onSection={setSection}>
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
        />
      )}
      {section === 'Kiosk' && (
        <KioskSection
          mode={kiosk}
          onMode={setKiosk}
          catalog={catalog}
          singleApp={kioskApp}
          onSingleApp={setKioskApp}
          pickerOpen={initial.kioskPicker}
          onAddApps={() => { setSection('App Catalog'); setStoreOpen(true); }}
        />
      )}
      {section === 'Extensible SSO' && <SsoSection catalog={catalog} allowed={ssoAllowed} onAllowed={setSsoAllowed} />}
      {!['App Catalog', 'Kiosk', 'Extensible SSO'].includes(section) && (
        <div className="pt-4">
          <h2 className="m-0 text-[20px] font-semibold text-heading">{section}</h2>
          <p className="mt-2 text-[14px] text-muted">This section isn't part of the App Catalog design and keeps its current screens.</p>
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
            .map((r) => ({ id: r.id, name: r.name, bundleId: `com.microsoft.${r.id}`, initials: r.initials, color: r.color, source: 'App Store' as const, chips: [] }));
          setStore((s) => [...s, ...added]);
          setStoreOpen(false);
        }}
      />
      <AddInhouseDrawer
        open={!!inhouse}
        onOpenChange={(o) => !o && setInhouse(null)}
        initialMode={inhouse ?? 'library'}
        inProfile={ent.map((a) => a.id)}
        onAdd={(ids) => {
          if (ids.includes('expense') && !ent.some((a) => a.id === 'expense'))
            setEnt((s) => [...s, { id: 'expense', name: 'Acme Expense', bundleId: 'com.acme.expense', initials: 'AE', color: '#1565c0', source: 'Enterprise', chips: [], meta: 'build 2.0.3 · hosted .ipa' }]);
          setInhouse(null);
        }}
      />
      <AppSettingsDrawer app={settingsApp} onOpenChange={(o) => !o && setSettingsApp(null)} />
      <CountryDialog
        open={!!pendingCountry}
        to={pendingCountry ?? ''}
        from={country}
        onKeep={() => setPendingCountry(null)}
        onSwitch={() => { setCountry(pendingCountry!); setPendingCountry(null); }}
      />
      <RemoveDialog
        open={!!removing}
        name={removing?.name ?? ''}
        usedByKiosk={!!removing && kiosk === 'single' && kioskApp === removing.id}
        usedBySso={!!removing && ssoAllowed.includes(removing.id)}
        onKeep={() => setRemoving(null)}
        onRemove={() => removing && removeApp(removing)}
      />
    </ProfileLayout>
  );
}
