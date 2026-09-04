# 00 — Overview & Product Principles

## 1. What Craftyso is becoming

Today the business runs on three disconnected surfaces:

1. **craftyso.co.il** — a Folyou-hosted Hebrew catalog: buttons, buckles,
   ribbons (satin / crochet / braid / lacing / elastic / lace), fabrics,
   iron-on patches, heat-transfer studs, chains, necklace bases, turbans and
   head coverings, beach hats, masks, sewing notions. Flat category list,
   thin product data, no accounts worth having, no stock truth.
2. **The Levontin St. shop, Tel Aviv** — walk-in trade: designers, costume
   people, seamstresses, hobbyists. Knowledge lives in staff heads; stock
   lives in drawers; a sale here is invisible to the website.
3. **The import desk** — sourcing from overseas suppliers, proformas, samples,
   shipments, customs clearance, landed cost. Runs on WhatsApp, email and
   spreadsheets. Customers who want something sourced ask by phone.

The new platform's thesis: **these are one business and should be one system.**
A ribbon that lands in a container on Tuesday should be sellable online on
Tuesday, priced from its real landed cost, visible to the shop's POS, offered
to the trade customer who backordered it, and posted to Instagram — without a
human retyping anything.

## 2. Business lines the platform must run

| Line | Who buys | What the platform must do |
|------|----------|---------------------------|
| **B2C retail** | Hobbyists, crafters, home sewers, costume makers, parents before Purim | Storefront, search, checkout, delivery, returns |
| **B2B / trade** | Designers, fashion labels, workshops, tailors, bag makers, other shops | Tier pricing, quotes, credit terms, tax invoices, fast reorder, sample requests |
| **Physical shop** | Walk-ins | POS on shared inventory, click & collect, in-store lookup, "we can import that" capture |
| **Managed import (service)** | Customers who need something we don't stock, at volume | Request → sourcing → quote → sample → order → shipment → customs → delivery, tracked end to end |
| **Own-stock importing** | Us | Demand forecast → PO → supplier → freight → customs → landed cost → pricing → replenishment |
| **Dropship / direct-from-supplier** | Anyone | Catalog items that never touch our warehouse; supplier ships, we track |

## 3. Personas

### Consumer side

**Noa — hobbyist crafter, 34, Ramat Gan.** Mobile, Hebrew, evenings. Came from
an Instagram reel. Needs "the gold buckle from that bag video" — she has a
photo, not a name. Buys ₪60–₪200. Success = she finds it in under a minute and
checkouts with Bit or Apple Pay without creating an account.

**Yael — costume & wardrobe, 41, freelance.** Buys in bursts, deadlines are
brutal (Purim, a production week). Needs exact colour matching to a fabric
swatch, needs to know *today* what's in the Tel Aviv shop right now, and needs
20 of something that shows 12 in stock — with a real answer about when the
other 8 land.

**Dana — fashion label owner, 29, 3 employees.** Trade account. Buys the same
6 SKUs every season plus new trims. Needs her price list, a quote she can
forward to her accountant, a *חשבונית מס* automatically, 30-day terms, and a
one-click reorder of "the same as last time, but 500 instead of 200."

**Avi — small bag manufacturer, 52.** Doesn't want a website; wants WhatsApp.
Sends a photo of a broken clasp at 22:00 and expects a price. Will happily let
an AI agent answer if the answer is right and a human is one message away.

**Moshe — wants to import.** Has a product idea (branded ribbon, custom-printed
labels, 5,000 units of a specific buckle). Today he'd need a broker, a
forwarder and luck. Needs a quoted landed price, in shekels, with a date.

### Internal side

**Yossi — owner.** Wants one screen that tells him what needs him today: money
in, money out, what's stuck in customs, what's about to stock out, what a
customer is angry about. Wants to ask questions in Hebrew and get answers.

**Rivka — shop staff.** Serves walk-ins, runs the POS, checks stock, packs web
orders between customers. Needs a tablet-sized UI, barcode scanning, and
zero training.

**Import/logistics coordinator.** Lives in POs, proformas, packing lists, BLs,
customs files, freight quotes. Needs documents parsed, not retyped, and a
timeline per shipment.

**Marketing.** Needs new arrivals to become content, campaigns to be measurable
down to landed-cost margin, and to never write the same product description
twice.

**Supplier (external, China/Turkey/Italy).** Needs to confirm a PO, upload a
packing list, and tell us it ships Thursday — in English, on a phone.

## 4. Product principles

1. **One record, many faces.** A product is a single object; retail price,
   trade tiers, cost, stock, supplier and content are facets of it, not copies.
   Never two sources of truth.
2. **Three clicks to anything.** For customers *and* admins. If a task needs a
   fourth click, it gets a shortcut: command palette, saved view, or automation.
3. **Search is the primary navigation.** Categories are a browse aid; the
   search bar (text, photo, colour, voice) is how people actually arrive.
4. **The photo is the query.** This business is visual and physical. Every
   entry point that accepts text must also accept an image.
5. **AI drafts, humans approve — until trust is earned.** Every AI action has a
   confidence level, an audit trail and a reversible state. High-frequency,
   low-risk actions graduate to fully automatic per-action, by config, not by
   code change.
6. **Nothing is entered twice.** If a number exists on a supplier's PDF, an
   incoming payment, a carrier's API or a previous order, the system reads it.
   Manual entry is a fallback, never the design.
7. **Hebrew-first, RTL-native, bilingual-ready.** Hebrew is the default and the
   design language; English is a first-class second locale (trade + suppliers);
   Chinese appears only in supplier-facing generated documents.
8. **Mobile is the real device.** Consumers, shop staff, warehouse and the owner
   are all on phones. The admin is not a desktop-only afterthought.
9. **Accessible by law and by intent.** Israeli standard IS 5568 (WCAG 2.0 AA+)
   is a hard requirement, not a plugin.
10. **Every object has a timeline.** Order, shipment, product, customer,
    supplier, quote: an append-only event log rendered as a human-readable
    history. This is what makes "tracked through a single platform" true.
11. **Fast beats rich.** Hebrew shoppers on 4G. Server components, streamed
    lists, image CDN, no client-side mega-bundles.
12. **Degrade gracefully.** If the AI is down, the site sells. If Grow is down,
    the order queues. If the carrier API is down, labels batch.

## 5. What "AI-native" means here (and what it doesn't)

It does **not** mean a chat bubble bolted to the corner. AI shows up in five
concrete places, each with a measurable job:

| Place | Job | Metric it moves |
|-------|-----|-----------------|
| **Find** | Photo/colour/intent search, matching, materials lists | Search→cart rate, zero-result rate |
| **Answer** | Hebrew assistant on site + WhatsApp, order & stock aware | First-response time, deflection %, CSAT |
| **Enrich** | Turn a supplier photo + a Chinese spec sheet into a full Hebrew product page | Hours per 100 SKUs listed |
| **Decide** | Forecast, replenishment drafts, landed-cost pricing, quote generation | Stockout days, GM%, quote turnaround |
| **Operate** | Document parsing, exception alerts, drafted comms, content generation | Manual ops minutes per order/shipment |

Full detail in [10 — AI & automation layer](./10-ai-and-automation.md).

## 6. Success criteria for v1

- A customer can go from an Instagram screenshot to a completed order in under
  90 seconds on a phone, without an account.
- Stock shown online is the same number the shop's POS sees, within 5 seconds.
- Listing a new SKU from a supplier photo takes under 2 minutes of human time.
- An import quote request gets a priced, dated answer within 1 business day
  (target: 15 minutes for known-supplier categories).
- The owner has one "Today" screen that answers "what needs me?" without
  opening anything else.
- No business-critical fact lives only in WhatsApp or a spreadsheet.
