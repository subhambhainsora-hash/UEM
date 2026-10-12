# DESIGN.md · mO WEB Design System as used in UEM

Source of truth: Figma "UEM Dashboard design" (frame "Extensible SSO"). Code: `src/styles/index.css` (tokens), `src/components/ds.tsx` (primitives), `src/components/uem.tsx` (kit wrappers), `src/components/ui/` (shared shadcn/Radix kit from Secure Share and AI Agent Governance).

## Color
| Role | Value | Notes |
|---|---|---|
| Primary | `#0052cc` | Buttons, links, active tab text and indicator |
| Primary hover / active | `#0065ff` / `#0747a6` | |
| Text | `#171821` | Headings and body |
| Muted text | `#5c5c5c` | Subtitles, helper text |
| Placeholder | `#b1b1b1` | |
| Border | `#ebebeb` | Inputs, dividers, cards |
| Active nav | `#e0f2ff` | Sidebar and section nav selected state |
| Info surface | `#e3ecfc` | Info alerts |
| Chip / badge | `#ebebeb` on `#262626` | Required badge, attribute chips |
| Dashed empty state | `#cbd0dc` | 1.5px dashed, 12px radius |
| Success / danger / warning | `#12b28c` / `#de350b` / `#b45309` | Status only, never decoration |
| Brand orange | `#f07d2c` | "Powered by miniOrange" only |

## Typography
Segoe UI, falling back to Inter (bundled). Page title 24/32 bold. Section title 20/27 semibold with 15px muted subtitle. Section header 18 semibold with 33px icon tile. Field label 14 semibold. Body 14/20. Helper 12/20 muted. Badges use Inter 13 medium.

## Spacing and shape
Page gutter 50px, top 32px. Section nav 229px with 25px right padding and a full-height right rule. Content column starts 24px after it. Vertical rhythm inside a section is 20px. Inputs 44px tall, 6px radius, 10px horizontal padding. Buttons 40px, 5px radius, 16px padding, 15px semibold. Nav items 36px, 8px radius. Alerts 8px radius, cards 12px.

## Components
- **Buttons.** Primary (blue fill), outline (1.5px blue border), secondary (white with `#ebebeb` border, for row actions like Retire), danger (red fill). Text is always white on a filled button, in every state.
- **Segmented control** (Kiosk mode). Outline items; the selected item is `#e0f2ff` with blue text. Hover never changes text colour.
- **Tabs.** Kit tabs: one 2px blue indicator under the active trigger, grey baseline under the list.
- **Field.** Label row (label · Required badge · info dot) above a 44px input. No floating labels.
- **Alerts.** InfoAlert (info / warn / error tones) and the gradient InfoCard for a selected mode.
- **Empty state.** Dashed box, 51px icon, 18px title, 12px helper.
- **Drawer.** 520 to 600px, 20px semibold title, footer with Cancel + primary.
- **App icon.** Real App Store artwork, 22.5% radius, hairline border. In-house apps use the generic package tile. Never initials.

## States
Hover: subtle surface change only. Focus: 2px `#4c9aff` outline. Disabled: `rgba(9,30,66,0.04)` surface with `#adadad` text. Invalid: `#de350b` border plus a message. Unsaved: count in the footer.

## Flow patterns (ported from AI Agent Governance › Access Policy)
- **Confirm inline, in the row that owns the action.** No modal for delete, remove, retire or publish. The row grows a line that states the computed consequence (device counts, Kiosk/SSO dependencies, what rolls back) with the action and Cancel underneath. Cancel takes focus. The only modals left are the App Store country switch (a list of consequences) and the leave-with-unsaved-changes interrupt.
- **Undo where the row was.** After a removal the list shows a `UndoRow` ("Removed: X. 148 devices uninstall it after you submit. Undo") in place, not a toast.
- **Status bar inside the container.** The profile footer carries one `aria-live` sentence per state: idle ("Devices match this profile"), unsaved ("N unsaved changes. Devices stay on the last submitted profile"), blocked (red, with a "Show me" link to the first flagged section) and submitted (green check). Submit is disabled when nothing is pending; Ctrl/Cmd+S submits; "Discard changes" appears only when dirty.
- **Row-state chips.** "New · not submitted" and "Edited · not submitted" on catalog rows; a blue dot on section-nav items with unsaved edits; a warning icon on sections that block submit.
- **Overflow menus.** `UMenu` / `UMenuItem` (kit dropdown-menu) for row actions; the destructive item is last, after a separator, and is disabled with a hint rather than hidden when a dependency blocks it.
- **Toasts** (`useToast`) only confirm something that already happened and never ask a question. Top-right, auto-dismiss, optional one action.
- **Explainer on demand.** "How submitting works" opens an inline strip under the page title; closed by default.
