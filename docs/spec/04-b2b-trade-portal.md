# 04 — B2B Trade Portal

The trade portal exists because Craftyso's most valuable customers — labels,
workshops, bag and hat makers, costume houses, other shops — currently buy by
phone and WhatsApp. Every one of those conversations is an unrecorded price
negotiation, an unlogged backorder and an invoice typed by hand.

## 4.1 Onboarding

`/wholesale` (public landing) → `/trade/apply`.

**Application form:** business name, ח.פ / ע.מ number, business type, expected
monthly volume, categories of interest, contact + role, delivery address,
accountant email for invoices, and an optional file upload (תעודת עוסק,
אישור ניכוי מס).

**Automation:** on submit →
1. Company number validated for format and, where available, against the open
   companies registry;
2. AI drafts a summary and a suggested tier based on stated volume + category
   mix + any existing retail order history;
3. Creates a `tradeApplications` record and an admin task in `/admin/trade-accounts`;
4. Applicant gets an immediate acknowledgement with an expected decision time,
   and browsing access to the catalog at retail prices meanwhile.

**Approval** sets `accountType: "trade"`, a `priceListId`, credit terms,
payment terms, an assigned account manager, and triggers a welcome sequence
with their price list attached.

## 4.2 Pricing model

Layered, evaluated in this order (first match wins per line):

1. **Contract price** — negotiated per customer per SKU, with validity dates.
2. **Customer price list** — the tier assigned to the account (e.g. Trade A/B/C).
3. **Quantity break** — volume tiers on the SKU (10+ / 50+ / 200+ / carton).
4. **Promotion** — campaign discounts, if the price list allows stacking.
5. **Retail price** — fallback.

Every price rule stores its **margin against current landed cost** and is
blocked (or requires an override with a reason) if it breaches the guardrail
set in `/admin/pricing`. This is the single most important control in the
system: it is what stops a hand-shake price from quietly going below cost when
the dollar moves.

## 4.3 Trade surfaces

### `/trade` dashboard
Open orders, open quotes awaiting their response, backorders with ETAs,
outstanding balance and next payment due, "buy again" rail, and their account
manager's photo + direct WhatsApp.

### `/trade/catalog`
Same catalog, their prices, plus trade-only data: MOQ, carton quantity, lead
time for replenishment, "next inbound shipment" date, and stock across
locations. Trade-only SKUs (bulk rolls, cartons) are visible only here.

### `/trade/quick-order`
The workhorse. Three input modes on one screen:
- a grid where you type or scan SKU + qty,
- paste a block of SKUs/quantities from a spreadsheet or WhatsApp,
- upload a CSV / photograph a handwritten list (**AI parses it into lines**,
  showing confidence per line and asking about ambiguous ones).
Live totals, stock warnings per line, and a "what's not available and when it
will be" summary before adding to cart.

### `/trade/quotes`
Request a quote for quantities beyond the published breaks or for non-catalog
items. Flow: request → AI-drafted quote (price from landed cost + target margin
+ freight assumption) → human review → sent as a PDF and an interactive page →
customer accepts / counters → accepted quote converts to an order or, for
non-catalog items, to an **import request** (doc 05). Quotes have expiry dates
and are versioned.

### `/trade/samples`
Sample requests with a per-account allowance, tracked as a mini-order.
Sample → feedback → conversion rate is a reported metric.

### `/trade/orders`
Full order history including partial shipments, backorder lines with live ETAs
from the inbound shipment they're allocated to, and re-order of any past order.

### `/trade/invoices` & `/trade/credit`
Every חשבונית מס and קבלה, aging buckets, statement download, "pay open
balance" (card/Bit/bank transfer instructions), credit limit and utilisation,
and terms (שוטף +30/+60). Approaching-limit and overdue notices are automated
and also surfaced to the account manager.

### `/trade/contracts`
Agreed prices, validity windows, annual volume commitments and their progress.
Renewal reminders fire automatically 45 days out.

### `/trade/team`
Sub-users with roles: *buyer* (creates carts/orders up to a limit), *approver*
(releases orders above it), *viewer/accountant* (invoices only).

## 4.4 Trade-specific behaviours

- **Prices never shown before login** if the account's price list is marked
  confidential; the catalog shows "התחבר לצפייה במחיר".
- **PO number field** on every order — trade buyers need their own reference on
  the invoice.
- **Split delivery schedules** — order 1,000 now, deliver 250/month.
- **Backorder policy per account:** auto-allocate from the next inbound
  shipment, or cancel, or substitute with approval.
- **Delivery notes (תעודת משלוח)** printed and emailed with each shipment.
- **Account manager assignment** with a shared inbox thread per account.
- **Everything exportable** — price list, order history, invoices — as CSV/PDF,
  because their accountants live in Excel.

## 4.5 Admin counterpart

`/admin/trade-accounts` handles applications, approvals, price list assignment,
credit limits, terms, contract entry, and a per-account health view: revenue
trend, margin, order cadence, days since last order, and an AI-flagged churn
risk with a suggested action (see doc 10 §4.6).
