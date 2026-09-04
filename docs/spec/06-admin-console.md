# 06 — Admin Console

**Design brief for the admin:** the person using it is standing behind a
counter, or on a phone, or has 40 tabs open. Every screen must answer "what do
I do next?" before it shows data. Lists are work queues, not tables.

Shared shape for every module: **Today-relevant queue → list with saved views →
detail page (facts left, timeline right, related below) → bulk actions →
automation hooks.**

---

## 6.1 `/admin` — Today

One screen the owner can run the business from. Cards, each with a count and a
one-tap action, ordered by urgency:

| Card | Contents |
|------|----------|
| **Needs you now** | Failed payments, orders past promised ship date, angry-tone messages, customs holds, negative reviews, credit-limit breaches |
| **Approvals** | AI-drafted items awaiting sign-off: quotes, POs, product listings, price changes, social posts, refunds |
| **Money** | Today/MTD revenue vs last period, gross margin **after landed cost**, cash in, receivables due, upcoming supplier payments |
| **Fulfilment** | To pick, to pack, to ship, click&collect waiting, late |
| **Inbound** | Shipments in transit with ETA, arriving this week, in customs, discrepancies found on receipt |
| **Stock risk** | Predicted stockouts before a named date/season, items below reorder point, dead stock |
| **Inbox** | Unread across WhatsApp/email/IG/site, oldest unanswered age |
| **Import requests** | New requests, quotes awaiting customer, gates waiting on us |
| **Marketing** | Live campaigns, spend vs ROAS-on-margin, scheduled posts today |

Below the cards: the **Ask bar** — a natural-language question box wired to
`/admin/ask` ("כמה סרטי סטן זהב נשארו ומתי מגיעה אספקה?").

---

## 6.2 Orders `/admin/orders`

**List:** saved views (Unfulfilled, Paid today, Backordered, Trade, Pickup,
At risk, Refund pending). Columns configurable. Bulk: print labels, mark
fulfilled, capture, cancel, tag, export.

**Detail `/admin/orders/[id]`:**
- Header: order number, customer (with lifetime value + trade badge), status
  chips (payment / fulfilment / delivery), primary actions.
- Items with cost & margin per line (staff-visible only), stock allocation
  state per line, and the shipment each backordered line is allocated to.
- Payment block: Grow transaction, capture/refund/partial refund, invoice
  document, on-account balance impact.
- Fulfilment block: location, picker, packing slip, carrier, label, tracking,
  proof of delivery.
- Delivery/pickup details with the customer's "needed by" date.
- **Timeline**: every event, human and automated and AI, with actor and diff.
- **Comms**: every message with this customer about this order, inline.
- Actions: edit (with re-price warning), split, duplicate, refund, exchange,
  convert to quote, add manual line, apply discount with reason.

**Manual order `/admin/orders/new`** — for phone and shop orders: customer
search or create, quick SKU add with scanner, trade pricing applied, payment
link sent by WhatsApp or charged in person.

---

## 6.3 Catalog `/admin/products`

**List:** grid or table, filter by category, stock state, published, supplier,
margin band, missing-data flags ("no image", "no colour attribute", "no HS
code"). Bulk edit prices, categories, publish state, and **bulk AI enrich**.

**Detail:** tabs —
1. **Content** — Hebrew + English name/description/SEO, generated then edited;
   a "regenerate" with instructions box.
2. **Media** — drag order, background removal, auto-crop, alt text generation,
   video, 360.
3. **Variants** — matrix editor (colour × width), per-variant SKU, barcode,
   price, cost, stock, weight, image.
4. **Attributes** — the physical facts that drive filtering and matching:
   colour (hex + name + Lab), width mm, length, material, finish, pack qty,
   weight, stretch, care, compatible-with.
5. **Pricing** — retail, price lists, quantity breaks, promotions, and a live
   **margin panel** vs current landed cost with a warning band.
6. **Sourcing** — supplier(s), supplier SKU, FOB price + currency, MOQ, carton
   qty, lead time, HS code, duty rate, country of origin, last PO, alternates.
7. **Inventory** — on hand / allocated / available per location, reorder point,
   safety stock, incoming with ETA.
8. **Insights** — views, conversion, returns rate, review sentiment, co-purchase.

**`/admin/products/new` and `/admin/products/import`** — three intake paths:
manual, CSV/supplier feed mapping, and **photo intake**: drop a folder of
supplier photos → AI produces draft products (name, category, attributes,
description, suggested price from cost + target margin) → staff approve in a
swipeable review queue. This is the difference between listing 20 SKUs a week
and 200.

**Categories** — drag-and-drop tree, with merchandising rules per node.
**Attributes** — global registry so filters stay consistent; AI proposes new
attribute values but a human promotes them.
**Collections** — manual, rule-based (`colour = gold AND category = hardware`),
or AI-suggested seasonal sets awaiting approval.
**Media library** — searchable by visual similarity, reused across products,
projects and social.
**Reviews** — moderation queue with AI-flagged spam/abuse and drafted replies.

---

## 6.4 Pricing `/admin/pricing`

- Price lists (Retail, Trade A/B/C, Export) and who is on each.
- Quantity break tables per SKU or per category.
- **Rules**: "target margin 55% on hardware", "never below landed cost + 12%",
  "round to ₪X.90".
- **Repricing runs**: triggered by a new landed cost, an FX move beyond a
  threshold, or a supplier price change. Produces a proposal list — old price,
  new price, margin before/after, volume affected — for one-click approval.
- Change history per SKU, with who/why.

---

## 6.5 Inventory & fulfilment
Full detail in [08 — Inventory, warehouse & POS](./08-inventory-and-pos.md).
Admin-side entry points: `/admin/inventory` (stock by SKU × location, movement
ledger, adjustments with reasons), `/admin/inventory/counts` (cycle counts),
`/admin/inventory/transfers`, `/admin/fulfilment` (pick/pack/ship queue with
batch picking and label printing), `/admin/shipping` (zones, rates, carrier
config), `/admin/locations`.

---

## 6.6 Import & supply chain
Full detail in [07](./07-supply-chain-ops.md). Modules: `/admin/suppliers`,
`/admin/rfqs`, `/admin/purchase-orders`, `/admin/shipments`, `/admin/customs`,
`/admin/landed-cost`, `/admin/import-requests`.

---

## 6.7 Customers & CRM

**`/admin/customers/[id]` — the 360° view.** Identity, channels, orders,
lifetime value, margin contributed, projects, lists, alerts, reviews, returns
rate, every message across every channel, loyalty balance, and an AI summary
("buys satin ribbon monthly; last order 41 days ago — overdue; asked twice
about gold buckles we don't stock").

**Segments** — rule-based plus AI-discovered clusters ("bridal makers", "Purim
seasonal", "bulk elastic buyers"), each usable as a campaign audience.

**Leads** — extends the existing module: source, status pipeline, assignment,
next action with a due date, and automatic creation from newsletter, contact
form, import request, trade application, abandoned high-value cart, and
in-store capture.

---

## 6.8 Marketing & content

- **`/admin/content`** — pages, guides, tutorials, glossary; scheduled publish,
  versioning, AI drafting with a house-style prompt, SEO scoring.
- **`/admin/projects`** — project pages and their materials lists (links real
  SKUs, so stock is reserved for workshop kits).
- **`/admin/social`** — calendar view; drafts generated from new arrivals, UGC,
  and projects; per-platform variants (Instagram/TikTok/Facebook); approval →
  scheduled publish → performance pulled back in.
- **`/admin/campaigns`** — extends the existing module with spend, revenue,
  **margin after landed cost**, ROAS, attributed orders, and UTM management.
- **`/admin/email`** — templates and lifecycle flows (welcome, abandoned cart,
  back-in-stock, post-purchase, win-back, replenishment, review request), each
  editable and measurable, plus broadcasts to segments.
- **`/admin/seo`** — metadata health, redirect manager (including all legacy
  Folyou URLs), structured-data validation, sitemap, broken links.

---

## 6.9 Unified inbox `/admin/inbox`

Every customer conversation, one thread per person, regardless of channel:
WhatsApp Business, email, site chat, Instagram/Facebook DM, and internal notes.

- Right pane shows the person's full context (orders, value, open requests).
- **AI drafts a reply** grounded in that context; staff edit and send, or let
  approved intents auto-send (see doc 10 §4.2 autonomy levels).
- Assignment, snooze, tags, SLA timers, saved replies, and escalation.
- Any message can create an order, a quote, an import request, a return or a
  task without leaving the thread.
- Translation for supplier threads (HE ⇄ EN ⇄ ZH) inline.

---

## 6.10 Intelligence

- **`/admin/ask`** — natural-language questions over live business data,
  returning a number, a table or a chart plus the query it ran (auditable).
  Follow-up questions keep context. Answers can be saved as a report or pinned
  to Today.
- **`/admin/analytics`** — dashboards: revenue, margin, category performance,
  cohort retention, funnel, search terms with zero results, stock turns,
  supplier performance, import cycle times.
- **`/admin/forecast`** — per-SKU demand forecast with seasonality (Purim is
  the single largest signal in this catalog), reorder proposals with quantities
  and dates working backwards from supplier lead time.
- **`/admin/automations`** — the automation library: every workflow listed with
  its trigger, its actions, on/off, run history, success rate, and an editor.
  Nothing runs invisibly.
- **`/admin/agents`** — per-agent autonomy level (suggest / draft / act with
  approval / act autonomously), cost, usage, and a full action audit.
- **`/admin/reports`** — saved reports, scheduled email/WhatsApp delivery
  (e.g. Sunday 08:00 weekly business summary to the owner).

---

## 6.11 Finance

- **`/admin/finance`** — cash position, receivables aging, payables (supplier
  deposits/balances due, freight, broker), and a 90-day cash projection that
  includes committed POs.
- **`/admin/invoices`** — tax invoices, receipts, credit notes; issued
  automatically, exportable for the accountant.
- **`/admin/payouts`** — Grow settlements reconciled against orders; unmatched
  flagged.
- **`/admin/expenses`** — freight, customs duty, broker fees, port charges, ad
  spend; each allocatable to a shipment for landed cost.
- **`/admin/vat`** — VAT period summary and export in the accountant's format.

---

## 6.12 System

- **`/admin/users`** — staff, roles (doc 14), invitations, 2FA enforcement.
- **`/admin/settings`** — business details, locales, tax, shipping defaults,
  notification templates, branding, shop hours & holiday calendar.
- **`/admin/integrations`** — connected services with health status and last
  sync; reconnect flows.
- **`/admin/audit`** — every mutation with actor (human or agent), before/after,
  timestamp, IP. Filterable, exportable, immutable.
- **`/admin/developer`** — API keys, webhooks, product feed URLs (Google
  Merchant, Meta catalog), sandbox toggles.

---

## 6.13 Admin UX requirements (non-negotiable)

1. **⌘K palette** reaches every object and every action.
2. **Inline editing** everywhere it's safe; no modal-inside-modal, ever.
3. **Optimistic updates** with clear failure recovery.
4. **Bulk actions** on every list, with a preview of what will change.
5. **Undo** on destructive actions (soft delete + 30-day restore).
6. **Keyboard**: `j/k` navigate, `e` edit, `/` search, `?` shortcuts.
7. **Mobile admin**: Today, orders, inbox, stock lookup and receiving all work
   one-handed on a phone. Warehouse and POS flows are touch-first by design.
8. **Empty states teach** — every empty list explains what goes there and
   offers the action that fills it.
9. **Every number is clickable** — drill from a KPI to the rows behind it.
10. **Latency budget**: list < 400ms, detail < 600ms, search-as-you-type < 150ms.
