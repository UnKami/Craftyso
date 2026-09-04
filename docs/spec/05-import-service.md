# 05 — Import-as-a-Service (customer-facing)

This is the line of business that no competitor's website exposes, and the
reason the platform is worth building. Craftyso already knows how to source and
import; today that knowledge is delivered over the phone. The platform turns it
into a **product with a funnel, a price, a timeline and a status page.**

## 5.1 The promise

> "Tell us what you need. We'll find it, price it landed in Israel, ship it,
> clear it, and deliver it — and you'll see exactly where it is the whole way."

Three entry motions:
- **Catalog overflow** — "we don't stock 500 of these" → import quote.
- **Custom / branded** — printed ribbon, custom labels, own-logo hardware,
  bespoke colours.
- **Full sourcing** — "here's a photo/sample, find me a supplier."

## 5.2 Public funnel

### `/import` — landing
Explains the service in three steps with real timelines, shows worked examples
("2,000 custom-printed satin ribbons, ₪X landed, 38 days"), the cost components
in plain language (FOB · freight · מכס · מע״מ · שירות), an interactive
**landed-cost estimator**, FAQ (MOQs, samples, IP, who is the importer of
record, what needs a standards approval), and one CTA.

### `/import/new` — request intake
Deliberately conversational, not a 30-field form. Steps, each skippable:

1. **What is it?** — photo upload (multiple), sketch, link to an example
   (AliExpress/Alibaba/Instagram/competitor page), or free text. AI extracts a
   product understanding and shows it back: "buckle, zinc alloy, ~25mm,
   gold finish" — the customer corrects it.
2. **How many?** — quantity, and whether it's one-off or recurring.
3. **Customisation** — colour, size, logo/print (file upload), packaging.
4. **When do you need it?** — a date drives which freight mode gets quoted.
5. **Budget** — optional target price per unit; tells us whether to search sea
   or air, and which supplier tier.
6. **Who are you?** — contact, business details, existing account linking.

On submit the customer immediately gets: a request number, a **preliminary
AI estimate range** (clearly labelled as an estimate), a promised response
time, and a live status page.

### `/import/[requestId]` — the status page (tokenised, no login required)
The centrepiece. A timeline the customer can watch:

```
נקלטה הבקשה  →  איתור ספקים  →  הצעת מחיר  →  דגימה  →  הזמנה
   →  ייצור  →  יצא מהמפעל  →  בהפלגה/בטיסה  →  הגיע לנמל
   →  שחרור מכס  →  במחסן שלנו  →  נשלח אליך  →  הושלם
```

Each milestone carries a date (actual or estimated), an owner, and any
document the customer is allowed to see (quote PDF, sample photos, proforma,
delivery note). Plus: a message thread, the cost breakdown once quoted, and
approve/reject buttons at the decision gates.

### Decision gates (the only places the customer must act)
1. **Approve the quote** — line-item landed cost, validity date, payment terms.
2. **Approve the sample** — sample photos/video, or physical sample dispatched;
   approve, request changes, or cancel.
3. **Approve production/shipping changes** — supplier proposes a substitution,
   freight mode changes, or the price moves beyond an agreed tolerance.
4. **Confirm final delivery**.

Everything else happens without them.

## 5.3 Quoting

The quote a customer sees is one number per unit and one total, but it is
computed from a transparent model (expandable, because trade buyers will ask):

```
Unit FOB (supplier, USD)                     × qty
+ Tooling / setup / plate cost (amortised)
+ Sample cost (credited on order, optional)
= Goods value (USD)  →  ILS at quote FX + hedging buffer %
+ Freight (sea LCL/FCL or air, per kg or per CBM, allocated)
+ Insurance
+ Port / handling / THC / broker fees
+ Customs duty (per HS code, % of CIF)
+ Purchase tax if applicable
+ VAT (מע״מ) on the full CIF+duty base
+ Inland delivery
+ Craftyso service margin
= Landed price per unit, ILS, incl. VAT
```

Rules:
- Every quote states its **FX assumption and validity window** and what happens
  if the rate moves beyond a stated tolerance.
- Every quote states who is the **importer of record** and whether standards
  (תקן) approval is needed for the goods class.
- Deposit / balance terms are explicit (typical: 50% on order, 50% before
  release), and payable online.
- AI drafts the quote; a human approves before it is sent. Always.

## 5.4 What the customer can do at any time

- Message the thread (arrives in the staff unified inbox, doc 06 §6.9).
- Download every document they're entitled to.
- Ask the assistant a question about their own request ("מתי זה יוצא מסין?") and
  get an answer grounded in the request's real data.
- Reorder the same item — a completed import request becomes a **repeatable
  template**, and if it repeats often enough it graduates into a catalog SKU
  with its own supplier and replenishment rule.
- Convert to a standing order with scheduled shipments.

## 5.5 Payments

- Deposit and balance invoices issued automatically at their gates.
- Payment by card (Grow), bank transfer with generated reference, or on-account
  for approved trade customers.
- Currency shown in ILS; USD/EUR reference shown for trade customers who think
  in FOB terms.

## 5.6 Trust and expectation management

Import is a business where the failure mode is silence. The platform's job is
to make silence impossible:

- **Proactive milestone notifications** on WhatsApp — every state change, in
  Hebrew, with the next expected date.
- **Delay handling is a first-class flow**, not an apology email: when a
  milestone slips, the system detects it (from supplier update, carrier ETA, or
  a missed deadline), recalculates downstream dates, and sends a notification
  that states the new date and the reason before the customer asks.
- **A named human** on every request, visible with a photo and a direct line.
- **No hidden costs**: any cost change post-quote requires customer approval if
  it exceeds the agreed tolerance.

## 5.7 Relationship to internal ops

The customer-facing request is one side of a shared object. Internally the same
`importRequests` record drives RFQs to suppliers, the PO, the shipment, the
customs file and the landed-cost run — all specified in
[07 — Supply chain & import ops](./07-supply-chain-ops.md). The customer sees a
curated subset of the same timeline; there is no duplicate tracking.
