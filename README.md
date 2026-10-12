# miniOrange UEM · Apple iOS Profile App Catalog

The App Catalog for Apple iOS profiles in miniOrange Endpoint Defence. Every screen in the design file (`iOS_Profile_App_Catalog_UI_Options.html`) is built here as a working, interactive React screen.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check and production build
```

The home page is the Profiles list. The "Prototype" chip in the header opens a menu of all 16 screen states.

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
| `#/l1` | Applications (App Library), reached from the prototype chip |
| `#/s2` | App settings drawer, in-house app with builds |
| `#/k1` | Kiosk, Single App picks from App Catalog |
| `#/k2` | Kiosk, Multi App home screen and dock |
| `#/k3` | Extensible SSO, allowed apps |
| `#/k4` | Removing an app that Kiosk or SSO uses |

Reference renders of each design screen are in `docs/design/`.

## Design system

Visuals follow the **mO WEB Design System** in Figma (UEM Dashboard design, frame "Extensible SSO"). `src/components/ds.tsx` holds the primitives taken from it: page and section titles, labelled fields with the Required badge, the input + Add button row, info card and info alert, section headers with icon tiles, dashed empty states, radio cards and the footer actions. `src/assets/ds/` holds the SVG icons exported from the frame. Tokens live in `src/styles/index.css`: primary `#0052cc`, text `#171821`, borders `#ebebeb`, active nav `#e0f2ff`, Segoe UI with Inter as the bundled fallback.

Icons the Figma export returned as placeholders (Getting started, Email policy, Notification, Manage devices, Devices policy, Manage User, Approval requests, and the first five profile sections) use the matching lucide icon at the same size.

## App icons

App Store apps show their real App Store artwork, fetched from Apple's iTunes Search API and stored in `src/assets/logos/`. In-house apps have no public artwork and show a generic app tile in the app's colour. Nothing uses letter avatars.

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

Layout: the app has a 1180px minimum width and scrolls on narrower windows. On short screens the working area scrolls while the header, sidebar and footer stay put. The "Prototype" chip in the header switches between screen states.

Data is mock data in `src/data.ts`. There is no backend yet.

## Prototype routes
`/#/` Profiles · `/#/l1` App Groups · `/#/d1`–`/#/d9` App Catalog states · `/#/s1`, `/#/s2` App settings drawers · `/#/k1`–`/#/k4` Kiosk and SSO · `/#/p1`–`/#/p3` Email, Web Shortcuts, Web Content Filter · `/#/v1`–`/#/v3` Apple VPP Token states · `/#/v4`–`/#/v6` App Catalog VPP tab · `/#/v7` App Groups VPP licences.

Every clickable control does something: sidebar items outside the built screens say so in a toast, the sidebar collapses, the org and account menus open, row triple-dot menus act, drawers read a real file pick. The click crawler in the design audit (`scratchpad/audit2/crawl.js` during development) was used to verify this.
