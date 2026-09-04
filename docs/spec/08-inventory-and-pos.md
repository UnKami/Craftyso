# 08 — Inventory, Warehouse & Point of Sale

## 8.1 Stock model

Stock is tracked per **variant × location**, never as a single number on the
product.

**Locations:** `warehouse` (main), `shop` (Levontin 9, Tel Aviv),
`supplier_direct` (dropship — virtual, availability from the supplier feed),
`in_transit` (owned but not landed), `quarantine` (received, pending QC).

**Per variant per location:**

| Field | Meaning |
|-------|---------|
| `onHand` | Physically present |
| `allocated` | Reserved to orders not yet shipped |
| `available` | `onHand − allocated` — the only number shown to customers |
| `incoming[]` | Quantities on open POs/shipments with ETAs |
| `reorderPoint`, `safetyStock` | Set by the forecast, overridable |
| `binLocation` | Where it physically is (aisle/drawer/box) |

**Units matter here.** Ribbon sells by the metre and by the roll; buttons by
the piece, the card and the bag of 100. Every variant declares a base unit and
its sellable pack units with conversion factors, so a 50m roll consumed as
3m cuts stays accurate.

**Movement ledger:** every change is an append-only movement — receipt, sale,
POS sale, return, transfer, adjustment (with a reason code), cycle count
correction, damage, sample, workshop consumption. Stock is the sum of the
ledger, so it can always be explained.

**Reservation rules:** stock is allocated at payment (not at add-to-cart), with
a short soft-hold during checkout; oversell protection at capture; backorder
lines are explicitly allocated to a named inbound shipment so their ETA is real.

---

## 8.2 Receiving

Mobile-first, done on a phone in the warehouse:

1. Open the shipment → see expected lines.
2. Scan carton/barcode, or photograph the label — **AI reads the packing list
   and the carton labels** and pre-fills what it thinks arrived.
3. Confirm quantities; discrepancies are recorded against the PO and open a
   supplier claim draft.
4. QC step for flagged categories: photo + pass/fail; failures go to
   `quarantine`.
5. Assign bin locations (suggested from history/size).
6. Receipt posts stock, triggers the landed cost run, and fires the
   **release cascade**: backorders allocated, waitlisted customers notified,
   "new arrivals" and social drafts generated, trade backorders scheduled.

---

## 8.3 Fulfilment `/admin/fulfilment`

- Queue with priority (promised date, express, "needed by" from checkout).
- **Batch picking** — multiple orders picked in one walk, sorted by bin path,
  on a phone with scan verification per line.
- Pack station: verify, weigh, choose packaging, print label + delivery note +
  invoice in one action.
- Carrier selection by rule (weight, destination, service, cost) with manual
  override; label printed via the carrier API; tracking pushed to the customer
  automatically over WhatsApp.
- Click & collect: pick, place in the shop's collection shelf, notify with a
  pickup code; POS closes the pickup.
- Cut-to-length workflow for ribbons/elastic: the picker records the cut length,
  the ledger deducts from the roll, and any remnant below a threshold is
  flagged for the remnant bin (which becomes a discounted `/sale` listing —
  a small, genuinely nice touch that turns waste into revenue).

---

## 8.4 Point of Sale `/pos`

The shop is not a separate business. The POS is a route in the same app,
running on a tablet behind the counter.

**Sell screen:**
- Barcode scan, text search, and **camera match** (customer brings a fabric
  swatch or a broken buckle → photograph it → find it on the shelf, with the
  bin location shown).
- Quick tiles for the top 24 SKUs, cut-to-length entry with a price-per-metre
  keypad.
- Customer attach: phone number → their history, trade pricing, loyalty
  balance, open web orders and import requests all appear.
- Line discounts with reason codes and a permission limit.

**Payment:** card terminal, Bit, cash with drawer, gift card, loyalty points,
split payment, and "on account" for approved trade customers (posts straight
to their balance and generates the tax invoice).

**Receipts & invoices:** printed or sent by WhatsApp/SMS; every sale produces a
compliant חשבונית מס / קבלה through the invoicing integration.

**Other POS flows:**
- **Stock lookup** — including warehouse stock and inbound ETAs, so staff can
  answer "when will you have it?" truthfully.
- **Special order** — "we can get that for you" captured at the counter as a
  reserved sale against an incoming shipment, or as an import request; deposit
  taken on the spot.
- **Returns & exchanges** — including returns of web orders, which reconcile to
  the original online order.
- **Cash management** — open/close drawer, cash counts, X/Z reports, variance.
- **Offline mode** — the sell screen keeps working with a local cache and
  queues transactions when the connection drops; the shop cannot stop selling
  because the internet did.

**Why unified matters:** the same stock number, the same customer, the same
loyalty balance, the same invoice series, and the same product content — so a
sale in the shop instantly changes what the website says is available, and a
walk-in customer's history informs the web experience and vice versa.

---

## 8.5 Workshop & sample consumption

Workshops (doc 03) and samples (doc 04) consume real stock. Both post
movements with their own reason codes so the ledger stays honest and the cost
of a workshop kit or a sample allowance is measurable.

---

## 8.6 Counts, audits and shrinkage

- **Cycle counting** — the system schedules counts by ABC class and by
  discrepancy history rather than a yearly shutdown; a count is a guided
  mobile session by bin.
- Variances above a threshold require a reason and a manager approval.
- Shrinkage and adjustment reporting by category, location and reason, with
  anomaly alerts.
