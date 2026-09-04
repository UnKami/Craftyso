# 13 — Design & Interaction System

The brief was "the smoothest navigation is essential". That is a design
constraint, so it gets specified like one.

## 13.1 Foundations

**RTL-native.** Hebrew is not a translation layer. Build with CSS logical
properties (`margin-inline-start`, not `margin-left`), `dir="rtl"` on the
document, mirrored icons where directional (arrows, progress), and LTR islands
for numbers, SKUs, phone numbers, prices and Latin text. Every component is
tested in both directions before merge.

**Typography.** A Hebrew typeface with real weights and good small-size
legibility (Heebo / Assistant / Rubik class), paired with a matching Latin
face. Type scale: 12 / 14 / 16 / 20 / 24 / 32 / 40. Body 16px minimum on
mobile — Hebrew loses legibility faster than Latin at small sizes.

**Colour.** The catalog is the colour. The interface should be quiet: a warm
neutral ground, one brand accent for actions, and a strict semantic set
(success / warning / danger / info). Product colour swatches must render on a
neutral background with a subtle border so white and cream stay distinguishable.
Full light and dark palettes, both AA-compliant.

**Spacing & layout.** 4px base grid. Container widths: mobile fluid, tablet
768, desktop 1280 max for the storefront, full-width for admin lists.

**Motion.** 150–250ms, ease-out, transform/opacity only. Every animation
respects `prefers-reduced-motion`. Motion communicates state change (item added
to cart, row saved), never decorates.

**Density modes.** The storefront is comfortable; the admin has a
comfortable/compact toggle, because a warehouse list and an owner's dashboard
want different densities.

## 13.2 Navigation ergonomics (the core requirement)

1. **Search is always visible** on the storefront — never collapsed behind an
   icon on any breakpoint.
2. **Bottom tab bar on mobile**: Home · Search · Camera · Cart · Account. Thumb
   zone. This single decision removes most hamburger-hunting.
3. **Max two menu levels.** Depth beyond that becomes filters, not menus.
4. **Breadcrumbs everywhere** on storefront and admin, and they're clickable
   objects, not decoration.
5. **Back always works** — scroll position, filters and pagination restore.
   Filter state lives in the URL.
6. **⌘K command palette in the admin**, reaching every object and action.
7. **Persistent context**: the cart, the current order being packed, the open
   thread — nothing is lost by navigating away; the app remembers where you
   were per section.
8. **Progressive disclosure**: the common case is one tap; the advanced case is
   one more. Never a wall of fields (see the import intake, doc 05 §5.2).
9. **No modal traps.** Modals are for confirmations only. Editing happens
   inline or on a page.
10. **Every list row is a link, every number is a drill-down.**
11. **Loading is never blank** — skeletons that match the final layout, and
    streamed server components so content appears in stages.
12. **Errors are actionable** — what happened, what to do, and a button that
    does it.

## 13.3 Component library

Built once, used by storefront, admin, POS and portal:

`Button` · `IconButton` · `Input` · `NumberStepper` · `Select` · `Combobox` ·
`ColorSwatch` · `SwatchPicker` · `Slider` (mm ranges) · `Checkbox` · `Radio` ·
`Toggle` · `DatePicker` (Hebrew + Gregorian calendars) · `FileDrop` ·
`CameraCapture` · `Badge` · `StatusChip` · `Avatar` · `Card` · `ProductCard` ·
`PriceBlock` · `StockIndicator` · `Table` (sortable, selectable, virtualised) ·
`DataList` · `SavedViews` · `FilterBar` · `Drawer` · `Sheet` · `Modal` ·
`Toast` · `EmptyState` · `Timeline` · `Stepper` · `KpiTile` · `Chart` ·
`CommandPalette` · `Tabs` · `Breadcrumbs` · `Pagination` · `Skeleton` ·
`AiChip` (marks generated content) · `ConfidenceMeter` · `ApprovalBar`.

**AI surfaces have their own visual language**: a consistent subtle chip, a
confidence indicator, and an approval bar with Accept / Edit / Reject. A user
must always be able to tell at a glance what a machine wrote.

## 13.4 Accessibility — IS 5568 (WCAG 2.0 AA and above)

Legally required in Israel, and this catalog serves people who work with their
hands and their eyes.

- Semantic HTML first; ARIA only where semantics fall short.
- Full keyboard operability, visible focus rings, logical tab order in RTL.
- Contrast ≥ 4.5:1 for text, ≥ 3:1 for UI boundaries and swatch borders.
- **Colour is never the only signal** — critical for a site built on colour:
  every swatch has a name, every stock state has text, every chart has labels.
- Alt text on every product image, generated then reviewed.
- Forms: labels (never placeholder-only), inline errors tied by `aria-describedby`,
  clear required marking.
- Touch targets ≥ 44px.
- Accessibility widget with contrast, text size, link highlighting, reduced
  motion — persisted, and an `/accessibility` statement page with a contact.
- Screen-reader testing in Hebrew, with a Hebrew-language pass on all labels.

## 13.5 Performance budget

| Surface | Target |
|---------|--------|
| Storefront LCP (4G mobile) | < 2.0s |
| Category page JS | < 120KB gzipped |
| Search-as-you-type | < 150ms |
| Admin list / detail | < 400ms / < 600ms |
| POS scan → line added | < 250ms, works offline |

Techniques: server components by default, ISR for catalog, image CDN with
responsive AVIF, route-level code splitting, prefetch on hover/intent, no
client-side state library where the server can hold it.

## 13.6 Content & voice

Hebrew, warm, practical, expert — the voice of someone behind the counter who
knows what will actually work. Short sentences. No marketing inflation. Product
descriptions state material, dimensions and use before adjectives. Error
messages apologise once and then help. English copy is a real translation, not
a machine pass — trade customers and suppliers read it.
