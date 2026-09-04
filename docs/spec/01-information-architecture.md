# 01 — Information Architecture

## 1. Route groups

```
app/
  (store)/          Public storefront, Hebrew/RTL default        craftyso.co.il/
  (account)/        Logged-in customer area                      /account/*
  (trade)/          B2B trade portal (gated by account type)      /trade/*
  (import)/         Import-as-a-service surfaces                 /import/*
  admin/            Internal console (staff only)                /admin/*
  portal/           External supplier portal                     /portal/*
  pos/              Point of sale, shop tablet                   /pos/*
  api/              Route handlers, webhooks, agent endpoints    /api/*
```

Locale prefix: `/` = Hebrew (default, `he-IL`, RTL). `/en/...` = English
(LTR) for trade, tourists and suppliers. Never `/he/` — the legacy site's
`/he/…` URLs are 301-redirected to the new clean equivalents (see §6).

## 2. Complete sitemap — consumer

```
/                                     Home
/search                               Universal search results (text/photo/colour)
/search/visual                        Photo search intake (camera / upload / paste)

/c                                    All categories (visual index)
/c/[category]                         Category listing (e.g. /c/buttons)
/c/[category]/[subcategory]           e.g. /c/ribbons/satin
/c/[category]/[subcategory]/[leaf]    e.g. /c/ribbons/satin/10mm
/p/[slug]                             Product detail
/p/[slug]/reviews                     Deep-linked review section
/collections/[slug]                   Curated & AI-merchandised collections
                                      (purim, new-arrivals, back-in-stock,
                                       gold-hardware, bridal, summer-hats…)
/brands/[slug]                        Where a supplier/brand is public-facing
/new                                  New arrivals (auto-populated on receipt)
/sale                                 Markdowns & clearance
/bundles/[slug]                       Project kits & AI-generated bundles

/color                                Colour finder — swatch grid / upload fabric
/color/[hex]                          Everything we stock near this colour
/match                                "Match my material" tool (photo → results)
/projects                             Project gallery (staff + UGC)
/projects/[slug]                      Project page + full materials list → cart
/tools/calculator                     Quantity calculators (ribbon length, yield)
/tools/size-guide                     Widths, gauges, needle/thread charts

/cart
/checkout                             One-page checkout
/checkout/success/[orderId]
/order/track/[token]                  Guest order tracking (no login)

/store                                The Tel Aviv shop: hours, map, live "in stock here"
/store/appointment                    Book a consultation / bulk pickup slot
/workshops                            Classes & workshops
/workshops/[slug]                     Detail + booking

/learn                                Guides & tutorials hub (replaces "Blog")
/learn/[slug]                         Article / tutorial
/learn/glossary                       Haberdashery glossary (HE/EN terms)

/about
/contact
/faq
/shipping                             Shipping, delivery times, pickup
/returns                              Returns & exchanges
/terms
/privacy
/accessibility                        IS 5568 statement + settings
/wholesale                            Trade programme landing → apply
/import                               Import service landing (see doc 05)
```

## 3. Sitemap — customer account

```
/account                              Dashboard: open orders, reorder, saved
/account/orders
/account/orders/[id]                  Timeline, invoice, tracking, reorder, return
/account/returns/[id]
/account/projects                     Saved projects & materials lists
/account/projects/[id]
/account/lists                        Wishlists / shopping lists (shareable)
/account/lists/[id]
/account/alerts                       Back-in-stock, price-drop, restock reminders
/account/addresses
/account/payment-methods
/account/loyalty                      Points, tier, referrals
/account/workshops                    Booked classes
/account/import-requests              (if they've used the import service)
/account/settings                     Profile, language, notifications, consent
```

## 4. Sitemap — B2B trade portal

Gated: account has `accountType: "trade"` and `tradeStatus: "approved"`.

```
/trade                                Trade dashboard
/trade/apply                          Application (public, from /wholesale)
/trade/catalog                        Catalog at *their* prices, MOQ-aware
/trade/pricelist                      Their live price list, exportable CSV/PDF
/trade/quick-order                    SKU + qty paste/scan grid, CSV upload
/trade/quotes                         Quote requests & received quotes
/trade/quotes/[id]                    Accept / negotiate / convert to order
/trade/samples                        Sample requests & their status
/trade/orders                         Orders incl. partial shipments & backorders
/trade/orders/[id]
/trade/invoices                       חשבוניות מס / receipts, aging, pay open balance
/trade/credit                         Credit limit, terms, statement
/trade/contracts                      Agreed prices & validity windows
/trade/import-requests                Their managed-import jobs (doc 05)
/trade/team                           Sub-users, roles, approval limits
/trade/settings
```

## 5. Sitemap — internal

### Admin console (`/admin`)

```
/admin                                Today — the single work queue (see doc 06)
/admin/search                         Global search across every object type

Commerce
/admin/orders                         List, saved views, bulk actions
/admin/orders/[id]                    Timeline, payment, fulfilment, comms, notes
/admin/orders/new                     Manual / phone order
/admin/returns
/admin/returns/[id]
/admin/quotes
/admin/quotes/[id]
/admin/carts                          Live & abandoned carts
/admin/subscriptions                  Replenishment subscriptions (if enabled)

Catalog
/admin/products
/admin/products/[id]                  Edit + variants + media + AI enrich + cost
/admin/products/new
/admin/products/import                Bulk CSV / supplier feed / AI photo intake
/admin/categories                     Tree editor with drag reorder
/admin/attributes                     Colour, width, material, gauge, pack size…
/admin/collections                    Manual + rule-based + AI-suggested
/admin/media                          Asset library, background removal, retouch
/admin/pricing                        Price lists, tiers, rules, margin guardrails
/admin/promotions                     Discounts, coupons, automatic offers
/admin/reviews                        Moderation queue

Inventory & fulfilment
/admin/inventory                      Stock by SKU × location, adjustments
/admin/inventory/counts               Cycle counts & stocktake sessions
/admin/inventory/transfers            Warehouse ↔ shop transfers
/admin/fulfilment                     Pick/pack/ship queue, batch labels
/admin/shipping                       Zones, rates, carriers, label defaults
/admin/locations                      Warehouse, shop, supplier-direct

Import & supply chain
/admin/suppliers
/admin/suppliers/[id]                 Terms, lead times, performance, catalog, chat
/admin/rfqs                           RFQs out, quotes in, comparison
/admin/purchase-orders
/admin/purchase-orders/[id]           Lines, confirmations, docs, payments
/admin/shipments                      Freight in transit — map + timeline
/admin/shipments/[id]                 HBL/AWB, containers, ETA, customs, costs
/admin/customs                        Declarations, HS codes, duties, broker files
/admin/landed-cost                    Cost allocation runs, FX, freight apportion
/admin/import-requests                Customer import jobs (service side of doc 05)
/admin/import-requests/[id]

Customers & CRM
/admin/customers
/admin/customers/[id]                 360°: orders, messages, projects, value, notes
/admin/trade-accounts                 Applications, approvals, limits, terms
/admin/leads                          Pipeline (extends existing leads module)
/admin/segments                       Rule-based & AI-discovered segments
/admin/inbox                          Unified WhatsApp / email / IG / site chat
/admin/inbox/[threadId]

Content & marketing
/admin/content                        Pages, guides, tutorials, glossary
/admin/content/[id]
/admin/social                         Calendar, drafts, scheduling, performance
/admin/campaigns                      Ads, email, SMS/WhatsApp; spend vs margin
/admin/email                          Templates, flows, broadcasts
/admin/seo                            Metadata, redirects, schema, sitemap health
/admin/projects                       Project pages & their materials lists

Intelligence
/admin/ask                            Ask-your-business (NL → answer + chart)
/admin/analytics                      Dashboards: sales, margin, cohort, funnel
/admin/forecast                       Demand forecast & replenishment proposals
/admin/automations                    Automation library: on/off, logs, edit
/admin/agents                         AI agent settings, autonomy levels, audit
/admin/reports                        Saved & scheduled reports, exports

Finance
/admin/finance                        Cash view, receivables, payables
/admin/invoices                       Tax invoices/receipts, credit notes
/admin/payouts                        Grow settlements, reconciliation
/admin/expenses                       Freight, customs, broker, ad spend
/admin/vat                            VAT/מע״מ periods, export files for the accountant

System
/admin/users                          Staff, roles, permissions
/admin/settings                       Store, locale, tax, notifications, branding
/admin/integrations                   Connected services + health
/admin/audit                          Full audit log (who/what/when, incl. AI)
/admin/developer                      API keys, webhooks, feed URLs
```

### POS (`/pos`) — shop tablet

```
/pos                Sell screen (scan, search, quick tiles)
/pos/checkout       Payment: card, Bit, cash, on-account (trade)
/pos/customer       Attach customer, look up history, apply trade price
/pos/lookup         Stock lookup incl. "in the warehouse" / "arriving"
/pos/match          Photo match (camera → find the matching item on shelf)
/pos/orders         Click & collect queue, web order pickup
/pos/special-order  Capture "we can get it for you" → import request or PO
/pos/returns
/pos/cash           Open/close drawer, X/Z reports
```

### Supplier portal (`/portal`)

```
/portal                     Dashboard: open POs, actions needed
/portal/orders/[id]         Confirm PO, propose changes, upload proforma
/portal/shipments/[id]      Packing list, photos, ship date, tracking
/portal/documents           Invoices, certificates, MSDS, test reports
/portal/catalog             Their items, prices, MOQ, lead time — self-maintained
/portal/rfqs/[id]           Respond to RFQ
/portal/messages            Thread with us (auto-translated HE ⇄ EN ⇄ ZH)
```

## 6. URL & migration rules

- Product: `/p/[slug]` where slug is a stable Hebrew-safe slug + numeric
  suffix on collision. Never change a slug; add `redirects` doc instead.
- Legacy Folyou paths (`/he/כפתורים`, `/he/124`, `/he/<id>`) map 1:1 through a
  `redirects` collection built during the catalog migration (the existing
  `scripts/scrape-catalog.ts` already records `sourceUrl` — extend it to write
  the redirect map). Serve as 301 from middleware.
- Category slugs stay in Latin transliteration (`/c/buttons`) with Hebrew names
  rendered in UI, so URLs are shareable in WhatsApp without percent-encoding
  noise. Hebrew alias URLs 301 to the canonical Latin one.
- `hreflang` pairs for every `he`/`en` page; canonical always to the `he` URL
  unless the page is trade/supplier English-native.

## 7. Navigation model

### Consumer header (mobile-first)

**Top bar (sticky, 56px):** menu ⋮ · logo · **search (always visible, never
behind an icon)** · camera icon inside the search field · cart.

**Search field** is the centrepiece: tap → full-screen overlay with
- recent & trending queries,
- category chips,
- **camera / upload / paste-image** as a first-class action,
- colour-swatch row,
- as-you-type results grouped: Products · Categories · Guides · Projects.

**Mega menu** (desktop) / **drawer** (mobile): visual tiles with real product
photos, two levels max, plus a persistent rail: New · Sale · Colour finder ·
Projects · Trade · Import · The Shop.

**Bottom tab bar (mobile only):** Home · Search · Camera-match · Cart · Account.
Thumb-zone, always reachable — this is the single biggest navigation win on a
phone and replaces hunting through a hamburger.

**Persistent context strip** (below header, dismissible): free-shipping
threshold progress, or "Pick up today at Levontin 9" when stock allows.

### Admin navigation

- **Left rail** grouped exactly as §5 (Commerce / Catalog / Inventory / Import
  / Customers / Content / Intelligence / Finance / System), collapsible,
  remembers state, badge counts driven by the work queue.
- **⌘K / Ctrl+K command palette** — the real navigation. Fuzzy-search across
  objects *and* actions: "order 10432", "refund", "create PO for Yiwu Textile",
  "stock of satin 10mm gold". Every admin action must be reachable here.
- **Global search** with typed results (orders, products, customers, POs,
  shipments, invoices, messages).
- **Saved views** per list, per user, shareable. Lists are never re-filtered
  from scratch.
- **Detail pages are the same shape everywhere:** header (identity + status +
  primary actions) · left column (facts, editable inline) · right column
  (timeline + comments) · bottom (related objects). Learn one, know all.
- **No dead ends:** every object links to the objects around it (order →
  customer → their POs → the shipment that brought the stock).

## 8. Search architecture

One query endpoint, many input types.

| Input | Path | Backend |
|-------|------|---------|
| Text (Hebrew, typos, synonyms, English) | `/api/search` | Typesense/Algolia-class index (see doc 12) with a Hebrew synonym dictionary + query understanding via LLM for long queries |
| Photo | `/api/search/visual` | CLIP-class image embeddings over catalog imagery, vector index |
| Colour (swatch or uploaded fabric) | `/api/search/color` | Extracted dominant colours → ΔE2000 nearest in Lab space over product colour attributes |
| Natural language intent | `/api/search` (long query) | LLM → structured facet filter set + ranked results, "20 gold buckles 25mm for a bag" → category + colour + width + qty |
| Voice | mic → transcription → text path | Hebrew ASR |
| Barcode / SKU | POS + admin | Direct lookup |

Rules:
- **Zero results is a bug.** Always fall back to: nearest colour, same
  category, "we can import this" CTA, and a human handoff.
- Facets must be *physical*: colour swatch, width in mm, material, pack
  quantity, finish, hole count, weight, stretch, washability.
- Synonyms matter more than relevance tuning here (סרט/רצועה, אבזם/סוגר,
  ניט/מסמרת, פאץ'/טלאי, ליבית/בסיס לשרשרת). Maintain in `/admin/settings`.
