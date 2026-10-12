# miniOrange UEM · Apple iOS Profile App Catalog

The App Catalog for Apple iOS profiles in miniOrange Endpoint Defence. Every screen in the design file (`iOS_Profile_App_Catalog_UI_Options.html`) is built here as a working, interactive React screen.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check and production build
```

The home page lists all 16 screens. Each link opens the app in that state, and a bar at the bottom steps through them.

| Route | Screen |
| --- | --- |
| `#/d1` | App Store tab |
| `#/d2` | Add App Store apps drawer |
| `#/d3`, `#/s1` | App settings drawer, App Store app |
| `#/d4` | Enterprise tab |
| `#/d5` | Add in-house apps, from library |
| `#/d6` | Add in-house apps, upload .ipa |
| `#/d7` | VPP tab (later) |
| `#/d8` | App Store tab at 1366 × 768 |
| `#/d9` | Change App Store country, checked before save |
| `#/l1` | App Library page (replaces App Groups) |
| `#/s2` | App settings drawer, in-house app with builds |
| `#/k1` | Kiosk, Single App picks from App Catalog |
| `#/k2` | Kiosk, Multi App home screen and dock |
| `#/k3` | Extensible SSO, allowed apps |
| `#/k4` | Removing an app that Kiosk or SSO uses |

Reference renders of each design screen are in `docs/design/`.

## Shared components

`src/components/ui/` is the shared miniOrange component kit, copied unchanged from the Secure Share and AI Agent Governance apps. It is shadcn/ui on Radix, with Tailwind 4 and the same token file (`src/styles/default_theme.css`).

`src/components/uem.tsx` wraps those kit components with the UEM product styling from the design: blue `#1976d2` product theme, DM Sans, 4px radii. Use these wrappers in UEM screens instead of restyling kit components inline.

| UEM wrapper | Kit component |
| --- | --- |
| `UButton` | `Button` |
| `USwitch` | `Switch` |
| `UCheckbox` | `Checkbox` |
| `Chip`, `SourceBadge` | `Badge` |
| `Drawer` | `Sheet` |
| Dialogs | `AlertDialog` |
| Tabs, segmented controls | `Tabs`, `ToggleGroup` |
| Kiosk app picker, SSO picker | `Popover` |
| Multi App table | `Table` |

## Behaviour covered

- Apps added in App Catalog are the only apps Kiosk and Extensible SSO can pick from.
- Removing an app that Kiosk or SSO uses warns first, names each affected section and says how many devices uninstall it.
- Changing the App Store country is checked before it is saved and lists apps that will be removed.
- The Multi App dock is capped at 4 apps, and an app must be on the home screen before it can be docked.
- **Submit validates first.** Kiosk Single App without an app, an empty SSO allow list, or an enterprise app with expired signing blocks the submit, flags the section in the menu and links to it.
- **Cancel guards unsaved changes.** The footer counts unsaved changes; Cancel asks before discarding them, and so does closing the tab.
- **Builds can't be retired to nothing.** Retiring the only available build is blocked; retiring any other asks first and says which build devices roll back to and how many are affected.
- **Signing state is explicit.** Expired, expiring within 60 days and valid signing each show an icon and text, in the library, the catalog and the add drawer. Expired apps can't be added to a profile.
- **"Allow every app" for SSO asks first** and shows a persistent warning while it is on.

Layout: the app has a 1180px minimum width and scrolls on narrower windows. On short screens the working area scrolls while the header, sidebar and footer stay put. The prototype toolbar at the top steps between screens and can be hidden.

Data is mock data in `src/data.ts`. There is no backend yet.
