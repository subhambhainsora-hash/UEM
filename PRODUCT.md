# miniOrange UEM · Apple profile configuration

## Product purpose
Admin console screens for miniOrange UEM (Unified Endpoint Management). An IT admin builds an Apple device profile: which apps install (App Store, in-house, VPP), how Kiosk locks a device, and which apps may use Extensible SSO. Every change reaches managed devices at their next check-in, so a wrong action has an operational cost.

## Users
- **IT admin / endpoint engineer.** Configures profiles for device groups. Works in the console for long stretches on a 1366 to 1920 px laptop or monitor, under office light. Wants to see the effect of a change before it goes out.
- **Security or compliance reviewer.** Opens a profile to check what is allowed. Reads more than edits.

## Register
product

## Brand and tone
miniOrange: calm, utility-first, audit-aware. Plain-spoken labels, no marketing voice inside the product. Blue `#0052CC` is the product accent; orange is reserved for the brand mark in the sidebar footer.

## Strategic principles
1. Nothing reaches devices silently. Every destructive or wide-reaching action states its impact (device counts, affected sections) before it happens.
2. One source for the catalog. Kiosk and SSO pick from the App Catalog; they never grow their own lists.
3. States are first-class: empty, expiring, expired, blocked and unsaved are all visible, with icon plus text, never colour alone.
4. The shared mO WEB Design System is the only visual vocabulary. No one-off components.

## Anti-references
- Generic SaaS dashboards with hero metrics and card grids.
- Consumer-app playfulness. This is an operations tool.
- Decorative gradients, glass panels or illustration inside the console.
