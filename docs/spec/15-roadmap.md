# 15 — Roadmap & Gap Analysis

## 15.1 What the repo already has

The scaffold in this project is a genuinely useful head start:

| Present | Notes |
|---------|-------|
| Next.js 16 App Router, TS, Tailwind 4 | Route groups `(store)` and `admin/(dashboard)` already split |
| Firebase client + Admin SDK wiring | `lib/firebase/{client,admin,queries,admin-queries}.ts` |
| Auth session route + `require-admin` | `app/api/auth/session`, `lib/auth/require-admin.ts` |
| Storefront skeleton | home, category, product, cart, checkout, contact, about, shipping |
| Cart context | `lib/cart-context.tsx` |
| Admin modules | orders, products, leads, campaigns, content, social |
| Grow client stub | `lib/grow/client.ts` (awaiting real merchant credentials) |
| Firestore & Storage rules | basic |
| **Catalog migration scraper** | `scripts/scrape-catalog.ts` with all 19 legacy categories mapped |
| Seed + admin-user scripts | `seed-sample.ts`, `create-admin-user.ts` |

## 15.2 The gaps, ranked by what blocks revenue

1. **No variant model, no attributes, no colour data** — the entire matching,
   filtering and search story depends on this. Highest-leverage schema change.
2. **No inventory model** — no locations, no ledger, no allocation. Blocks POS,
   click & collect, backorders and honest availability.
3. **No customer accounts** — orders exist, customers don't.
4. **No search service** — Firestore cannot power faceted or vector search.
5. **No supplier / PO / shipment / landed-cost objects** — the import side of
   the business has no representation at all.
6. **No trade pricing** — one `priceIls` per product.
7. **No invoicing integration** — legally required per sale.
8. **No unified inbox / WhatsApp** — the channel most customers actually use.
9. **No event/timeline or task model** — "tracked in one platform" needs both.
10. **No AI gateway** — every capability in doc 10 hangs off it.

## 15.3 Phases

Each phase ends with something the business can actually use. Nothing is built
that has to be thrown away in the next phase.

### Phase 0 — Foundations (2–3 weeks)
Design system + RTL primitives · component library core · event log + task model
· roles/permissions layer · audit log · search service wired with product sync ·
image CDN · observability. **Outcome:** the rails everything else runs on.

### Phase 1 — Sell properly (4–6 weeks)
Full catalog schema (variants, attributes, colour/Lab) · migration from Folyou
with redirects · storefront (home, category, product, search with facets, cart,
one-page checkout) · Grow live incl. Bit/Apple Pay · invoicing integration ·
shipping rates + labels · order lifecycle automations · customer accounts and
guest tracking · admin orders/products/customers. **Outcome: the new site
replaces the old one and takes money.** This is the go-live gate.

### Phase 2 — Stock truth & the shop (3–4 weeks)
Inventory model + ledger · locations · receiving · fulfilment queue with batch
picking · POS with offline mode · click & collect · cycle counts.
**Outcome:** one stock number across web and shop; the counter runs on the
platform.

### Phase 3 — The AI layer that customers feel (4–5 weeks)
Agent gateway + audit + autonomy config · image/text/colour embeddings ·
**visual search, colour matching, materials lists** · Hebrew assistant on site
and WhatsApp · catalog enrichment pipeline · zero-result rescue + catalog gap
report. **Outcome:** the finding experience no competitor has.

### Phase 4 — Trade (3–4 weeks)
Trade applications & approval · price lists, contracts, quantity breaks, margin
guardrails · quick order incl. list parsing · quotes · credit, terms, statements
· invoices portal · sub-users · account manager tooling.
**Outcome:** the phone-and-WhatsApp B2B business becomes a system.

### Phase 5 — Import & supply chain (5–7 weeks)
Suppliers · RFQs · POs · shipments with milestones · customs entries · landed
cost runs and repricing · supplier portal · document intelligence · demand
forecasting and replenishment proposals · **customer-facing import service
(intake, quoting, status page)**.
**Outcome:** the business's hardest, most valuable process is tracked and
partly automated.

### Phase 6 — Growth & intelligence (ongoing)
Community (projects, learn, workshops, UGC) · loyalty and referrals ·
merchandising and content engines · campaigns with margin-true ROAS ·
ask-your-business · exception watcher · forecasting refinement · autonomy
graduation for proven capabilities.

## 15.4 Sequencing rules

- **Nothing customer-facing ships without its admin counterpart.** A feature
  staff can't manage is a support ticket generator.
- **Migration is not a phase, it's a discipline** — every phase that adds a
  schema keeps the legacy import path green until go-live.
- **Every phase adds automations to `/admin/automations`**, visible and
  switchable, never hidden in code.
- **AI capabilities ship at `draft` autonomy** and graduate only on measured
  acceptance.
- **The old site stays live** until Phase 1 passes a checklist: all products
  migrated with images, all URLs redirecting, checkout tested end-to-end with
  real payments, invoices issuing, and a rollback path.

## 15.5 Team shape (indicative)

Two full-stack engineers, one product designer (RTL-fluent), and part-time:
content/merchandising, and an ops person who owns the import process and is the
first user of every ops screen. The owner is the product owner — the "Today"
screen is designed for him and should be reviewed with him weekly.

## 15.6 The measures that decide if this worked

| Metric | Today (est.) | Target |
|--------|--------------|--------|
| Zero-result search rate | unknown | < 3% |
| Photo-search → cart | 0 | > 15% of visual searches |
| SKUs listed per person per week | ~20 | 200 |
| Stock accuracy (web vs shelf) | unmeasured | > 98% |
| Time to first import quote | 2–3 days | < 4 hours |
| Import quote win rate | unknown | measured, then improved |
| Trade orders placed self-serve | ~0% | > 60% |
| Manual ops minutes per order | unmeasured | < 2 |
| Gross margin visibility | after the fact | live, per line |
