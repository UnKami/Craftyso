# 07 — Supply Chain & Import Operations

The internal engine. Everything here is currently WhatsApp, email and Excel;
the platform's job is to make each artifact a record with a state, an owner and
a date — and to have AI read the documents instead of a human retyping them.

## 7.1 The object chain

```
Demand signal ──► RFQ ──► Supplier quote ──► Purchase Order ──► Production
      │                                            │
      │                                            ▼
      │                                      Shipment (sea/air)
      │                                            │
      ▼                                            ▼
Import Request (customer)                    Customs entry ──► Landed cost run
                                                   │                 │
                                                   ▼                 ▼
                                            Goods receipt ──► Inventory + Price update
```

Every arrow is an automation candidate. Every box is a page.

---

## 7.2 Suppliers `/admin/suppliers`

**Record:** company, country, contacts (with WhatsApp/WeChat/email), languages,
incoterms usually used, currency, payment terms, bank details, MOQ policy,
lead-time profile (production days + transit days by mode), certifications,
factory audit notes, and a document vault.

**Their catalog:** items we buy from them with supplier SKU, FOB price and its
validity, MOQ, carton spec (qty/CBM/gross weight), and a link to our SKU.
Suppliers can maintain this themselves through the portal (doc 09).

**Performance scorecard, computed automatically:**
- on-time rate (promised vs actual ship date),
- quantity accuracy (ordered vs received),
- quality (defect/return rate traced back to the PO),
- price stability,
- responsiveness (median reply time in the message thread).
Used to rank suppliers when the sourcing agent proposes options.

**Communication:** a thread per supplier in the unified inbox with automatic
HE ⇄ EN ⇄ ZH translation, so the coordinator writes Hebrew and the factory
reads Chinese.

---

## 7.3 RFQs `/admin/rfqs`

**Trigger:** a new import request, a category gap, a repricing need, or a
"find a better source" task.

**Flow:**
1. Build the brief once — spec, photos, quantity, target price, customisation,
   deadline, packaging, incoterm.
2. **AI generates the RFQ document** in the supplier's language, per supplier,
   with the right units and terms.
3. Blast to N suppliers (portal + email + WhatsApp), each getting their own
   response link.
4. Responses land as structured quotes — typed into the portal, or **parsed by
   AI from whatever PDF/Excel/photo they send**.
5. **Comparison table**: unit price, MOQ, lead time, tooling, payment terms,
   sample cost, and a computed **landed cost per unit per supplier** (this is
   the number that actually decides), plus the supplier scorecard.
6. Award → converts to a PO in one click, or to a customer quote.

---

## 7.4 Purchase Orders `/admin/purchase-orders`

**Record:** supplier, currency, incoterm, lines (our SKU, supplier SKU, qty,
carton qty, unit price, total), tooling/setup costs, payment schedule
(deposit/balance), promised ship date, destination location, and the linked
demand (replenishment proposal, import request, or backorders).

**States:** `draft → sent → confirmed → in_production → ready_to_ship →
shipped → partially_received → received → closed` (+ `cancelled`, `disputed`).

**Automation:**
- POs are **drafted by the replenishment agent** from forecast + reorder points
  + open backorders + season, and presented for approval with the reasoning
  ("Purim in 62 days; lead time 45; last year sold 1,400").
- Sent via portal + email; supplier confirms or proposes changes in the portal.
- **Proforma invoice parsed by AI** and reconciled against the PO — quantity,
  price and term differences flagged before anyone pays.
- Deposit invoice creates a payable in Finance and a reminder.
- Late confirmation / late ship date triggers escalation with a drafted chase
  message.

**Documents attached per PO:** proforma, commercial invoice, packing list,
inspection report, photos, test certificates.

---

## 7.5 Shipments `/admin/shipments`

**Record:** mode (sea LCL / sea FCL / air / courier), forwarder, HBL/MBL or AWB,
container numbers, port of loading / discharge, ETD, ETA (planned and live),
CBM, gross weight, cartons, the PO lines it carries (a shipment can consolidate
several POs; a PO can split across shipments), freight cost, insurance, and the
customs entry.

**Views:** a list with ETA countdowns, and a **map/timeline view** — the single
screen that answers "where is my money right now".

**Milestones (auto-updated where an API exists, otherwise manual or parsed from
the forwarder's email):**
`booked → cargo received → departed → in transit → arrived at port →
documents released → customs submitted → customs cleared → delivered to
warehouse → received`.

**Automation:**
- **ETA changes propagate**: every product page showing "arriving 12.10", every
  backordered order line, every customer import request and every trade
  backorder is updated, and the affected customers are notified with the new
  date and the reason — automatically, before they ask.
- Documents (BL, packing list, commercial invoice) parsed on upload into
  structured line data.
- Discrepancy detection at receipt: expected vs actual cartons/quantities, with
  a claim draft against the supplier if short.
- Demurrage/storage risk warning as free days at port run down.

---

## 7.6 Customs `/admin/customs`

**Record per entry:** broker, entry number, declaration date, HS codes per line,
customs value (CIF), duty rate and amount, purchase tax if any, VAT base and
amount, standards/approval requirements (תקן), release date, and every fee.

**Features:**
- **HS classification assistant** — proposes a code per product with the
  reasoning and the applicable duty rate, flags where a ruling or a standards
  approval is likely needed; a human confirms and the code sticks to the
  product record for every future import.
- **Document pack generator** — assembles what the broker needs, per shipment,
  and sends it.
- **Duty & tax pre-calculation** at PO time, so landed cost is known before the
  goods ship, not after.
- **Hold handling** — a customs hold becomes a task with an owner, an SLA, a
  cost clock (storage/demurrage) and automatic downstream date recalculation.
- Compliance library: certificates, declarations of conformity, importer
  registrations, per product class.

---

## 7.7 Landed cost `/admin/landed-cost`

The number everything else depends on.

**Run:** select a shipment → allocate its cost pool across lines.

```
Cost pool = goods value (converted at the actual payment FX rate)
          + freight + insurance + port/handling/THC
          + customs duty + purchase tax + broker fees
          + inland transport + bank/transfer fees
          + tooling amortisation
```

Allocation basis per cost type, configurable: by value, by weight, by volume
(CBM), or by unit count — freight by CBM/weight, duty by line value, etc.

**Outputs:**
- `landedCostIls` per SKU per receipt, and a **moving weighted average cost**
  per SKU across receipts;
- margin recalculation on every price list that touches those SKUs;
- a **repricing proposal** where margin has fallen through its guardrail;
- COGS for the finance module.

**Automation:** the run is drafted automatically when a shipment reaches
`customs cleared` and all cost documents are present; it waits for approval,
then publishes costs and opens the repricing proposal.

---

## 7.8 Import requests (internal side) `/admin/import-requests`

The staff view of doc 05. A kanban by stage with SLA timers:

`new → understanding → sourcing → quoting → quote sent → sample → approved →
PO placed → in production → in transit → customs → received → delivered →
closed` (+ `lost` with a reason, which feeds win/loss analysis).

Per request: the customer's brief and photos, the AI product understanding,
matched suppliers (from our own supplier base and from historical imports of
similar goods), RFQs sent, quotes received, the customer quote and its margin,
the PO, the shipment, the customs entry, all documents, the full message
thread, the assigned owner, and the promised dates.

**AI assists here more than anywhere else** (doc 10 §4.7): understanding the
brief, drafting the RFQ, matching suppliers, estimating landed cost, drafting
the customer quote, and writing every status update.

**Metrics:** time-to-first-quote, quote win rate, margin per request, on-time
delivery rate, and repeat rate (which requests should become catalog SKUs).

---

## 7.9 Demand planning `/admin/forecast`

Inputs: sales history per SKU, current stock, open POs and their ETAs,
backorders, seasonality (a Hebrew-calendar-aware seasonality model — Purim,
Rosh Hashana, Sukkot, wedding season, summer), price changes, trade contract
commitments, campaign calendar, and website signals (search terms with no
results, back-in-stock subscribers, product views).

Outputs:
- forecast per SKU per week with a confidence band,
- reorder point and safety stock per SKU, recomputed as lead times shift,
- **replenishment proposals** grouped by supplier so a PO is one decision, not
  forty, and sized to carton/MOQ/container-fill,
- stockout risk list with the date each SKU runs dry,
- dead-stock list with markdown/bundle suggestions,
- a cash view: what the proposed POs will cost and when they'll need paying.
