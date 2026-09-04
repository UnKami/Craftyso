# 10 — AI & Automation Layer

The differentiator. Everything below is specified as a **capability** with a
trigger, inputs, outputs, an autonomy level and a failure mode — because an AI
feature without those four things is a demo, not a product.

---

## 1. Architecture

```
                       ┌──────────────────────────────┐
   Storefront ────────►│                              │
   Admin      ────────►│      Agent Gateway           │──► Model providers
   POS        ────────►│  (auth, routing, budget,     │    (LLM, vision,
   Portal     ────────►│   caching, audit, fallback)  │     embeddings, ASR)
   WhatsApp   ────────►│                              │
                       └──────────────┬───────────────┘
                                      │  tools
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
              Firestore data     Vector index      External APIs
              (typed tools:      (products,        (carriers, FX,
               orders, stock,     images, docs,     customs, ads,
               POs, customers)    guides)           invoicing)
```

**Principles:**
- Agents never touch the database directly. They call **typed tools** that
  enforce the same permission rules a human has (doc 14).
- Every agent call is logged: prompt hash, tools invoked, tokens, cost,
  latency, outcome, and whether a human accepted the result.
- Every generated artefact is stored with `generatedBy`, `model`, `confidence`
  and `reviewedBy` — visible in the UI as a small "AI" chip that a human can
  clear on approval.
- **Autonomy levels** per capability, configured in `/admin/agents`:

| Level | Behaviour |
|-------|-----------|
| `off` | Disabled |
| `suggest` | Shows a suggestion; a human does the work |
| `draft` | Creates a draft object in a review queue |
| `approve` | Executes on one click, with a diff preview |
| `auto` | Executes and notifies; fully reversible; audited |

A capability starts at `draft`, and graduates only when its measured accept
rate crosses a configured threshold. **Money-moving and customer-facing-promise
actions never reach `auto`** without an explicit owner decision per action type.

- **Kill switch**: `/admin/agents` has a global pause. The platform must remain
  fully operable with every agent off — AI is leverage, never a dependency.
- **Cost control**: per-capability monthly budget, model tiering (cheap model
  first, escalate on low confidence), aggressive caching of embeddings and
  enrichment, batch processing overnight for non-urgent jobs.
- **Data handling**: customer PII is redacted from prompts where not needed;
  no training on our data; supplier prices and landed costs never leave the
  gateway in prompts sent to consumer-facing capabilities.

---

## 2. The vector & knowledge layer

Three indexes underpin most capabilities:

1. **Product image embeddings** — every product photo and every supplier photo,
   for visual search, matching, duplicate detection and "find it on the shelf".
2. **Product text embeddings** — name, description, attributes, synonyms in
   Hebrew and English, for semantic search and pairing.
3. **Document & knowledge embeddings** — guides, policies, FAQs, past import
   requests, supplier specs, customs rulings. This is what makes the assistant
   answer like someone who has worked here for ten years.

Plus a **colour index**: every variant's dominant colours stored in CIE Lab so
matching is a distance query (ΔE2000), not a string comparison. This is
cheap, exact, and it is the feature this particular catalog lives or dies on.

---

## 3. Consumer-facing capabilities

### 3.1 Visual search — "צלם ומצא"
**Trigger:** camera/upload/paste anywhere (header, product page, POS, WhatsApp).
**Input:** photo. **Process:** object detection → user taps the item → image
embedding → nearest neighbours filtered by availability → re-rank by category
plausibility. **Output:** ranked products with a similarity indication.
**Autonomy:** `auto` (read-only). **Failure:** low similarity → show nearest
colour/category matches plus the import CTA; never an empty page.

### 3.2 Material & colour matching — "התאם לחומר שלי"
**Input:** photo of fabric/leather/thread, optionally with a reference card for
white balance. **Process:** dominant colour extraction → Lab conversion →
ΔE search across variants, filtered by the categories that make sense to match
(thread, ribbon, buttons, zips). **Output:** matched items grouped by category,
with a ΔE-derived confidence and an offer to have a human confirm.
**Why it matters:** this is the shop's counter service, delivered online.

### 3.3 Conversational assistant (site + WhatsApp)
**Grounded in:** the catalog, live stock, the customer's own orders, shipping
policy, guides, and the shop's hours. **Can:** answer product questions,
recommend, check stock and ETAs, build a cart, look up an order, start a
return, create a back-in-stock alert, book a workshop, open an import request,
and hand off to a human with full context.
**Guardrails:** never invents stock, prices, dates or policy — every factual
claim comes from a tool call; if a tool has no answer, it says so and offers a
human. Never negotiates prices. Never promises a delivery date the fulfilment
engine hasn't computed.
**Autonomy:** `auto` for answering, `approve` for anything that writes.
**Language:** Hebrew by default, matches the customer's language otherwise.

### 3.4 Project → materials list
**Input:** a photo of a finished item, a pattern PDF, or a description
("שמלת נסיכה לפורים, מידה 6").
**Output:** a materials list with SKUs, quantities computed from stated
dimensions, alternatives per line, and a total — editable, then one-click to
cart. **Autonomy:** `suggest` (the customer always edits).

### 3.5 Smart quantity help
Ribbon-length and yield calculators backed by a small model that reads the
user's description ("מכפלת של שמלה, היקף 90 ס״מ, פי 2") and returns a quantity
with the assumption stated. Wrong quantities are the #1 cause of returns here.

### 3.6 Personalised merchandising
Home rails, category ordering, "goes with this", and email/WhatsApp product
picks, computed from behaviour + season + stock health + margin. Never shows
what can't be delivered in time.

### 3.7 Zero-result rescue
Any search with no results triggers: closest colour, closest category, a guide,
and "we can import this" — plus the query is logged into a **catalog gap
report** that feeds sourcing. Demand data that today evaporates becomes a
purchasing input.

---

## 4. Internal capabilities

### 4.1 Catalog enrichment ("photo → live product")
**Trigger:** supplier photos uploaded, a supplier feed row, or a receipt of new
goods. **Input:** images + any supplier text (often Chinese) + the PO cost.
**Output, as a draft product:** Hebrew and English name and description in the
house voice, category assignment, physical attributes (material, width, finish,
pack size) with the ones it isn't sure about flagged, extracted colour(s) with
hex + Hebrew colour name + Lab, background-removed primary image, alt text,
SEO title/description, suggested price from landed cost × target margin, and a
duplicate check against the existing catalog.
**Autonomy:** `draft` → a swipeable review queue (approve / fix / reject).
**Impact target:** 200 SKUs listed per week with one person.

### 4.2 Inbox copilot
Drafts replies in the unified inbox grounded in the customer's full context,
suggests the action the message implies (refund, reorder, quote, return,
address change), auto-tags by intent and sentiment, escalates anger and
high-value customers, and translates supplier threads.
**Autonomy:** `draft` by default; specific intents (order status, opening
hours, shipping cost, stock check) may be promoted to `auto` once their accept
rate holds above threshold, always with "a human is one message away".

### 4.3 Merchandising & content engine
- New arrivals → collection membership, home rail, social drafts, an email
  block, and a guide-post outline.
- Seasonal calendars (Hebrew calendar aware) generate campaign and content
  plans weeks ahead.
- UGC and reviews → curated product-page content and social drafts.
- Bundle proposals from co-purchase data, priced with a margin check.
**Autonomy:** `draft` for anything published; `approve` for collection changes.

### 4.4 Demand forecasting & replenishment
Described in doc 07 §7.9. The agent's output is a **grouped PO proposal per
supplier** with reasoning, cash impact and the risk if not ordered.
**Autonomy:** `approve` — a PO is never sent without a human.

### 4.5 Returns & claims triage
Photo + reason → classification (defect / wrong item / not as described /
change of mind) → decision proposal within policy (refund, exchange, partial,
reject) → drafted message. Defects are traced back to the PO and the supplier
scorecard, and a supplier claim is drafted if a pattern appears.
**Autonomy:** `approve`; low-value change-of-mind returns may go `auto`.

### 4.6 Customer & account intelligence
Per-customer summary, churn risk with a reason, next-best-action, and for trade
accounts an early warning when order cadence breaks. Surfaces as a task with a
drafted outreach message, not as a dashboard nobody opens.

### 4.7 Sourcing & import agent
The most valuable internal agent, working across doc 05 and doc 07:
1. **Understand the brief** — photos + text → a structured product spec.
2. **Match suppliers** — from our supplier catalog, past POs and past import
   requests, ranked by scorecard, category fit and price history.
3. **Draft the RFQ** in each supplier's language.
4. **Parse the responses** — PDFs, Excels, WhatsApp photos → structured quotes.
5. **Compute landed cost** per option, including duty by HS code, freight by
   mode, FX buffer and our margin.
6. **Draft the customer quote** with a validity window and terms.
7. **Write every status update** as milestones change, in Hebrew, with the new
   dates already recalculated.
**Autonomy:** `draft`/`approve` at every step. A customer-facing price is never
sent without a human. This agent's job is to turn three days into fifteen
minutes, not to remove the person.

### 4.8 Document intelligence
Any document dropped anywhere in the system — proforma, commercial invoice,
packing list, BL/AWB, customs entry, freight invoice, certificate, a supplier's
handwritten note photographed at the counter — is classified, parsed into
structured fields, matched to the PO/shipment it belongs to, reconciled against
what we expected, and filed. Discrepancies become tasks.
**Autonomy:** `draft` (parsed values shown next to expected values for
one-click confirmation).

### 4.9 HS classification & compliance assistant
Proposes HS codes with reasoning and duty rates, flags goods classes likely to
need standards approval, and keeps a per-product classification history.
**Autonomy:** `suggest` — a wrong code is a legal and financial problem.

### 4.10 Pricing agent
Watches landed cost, FX, supplier price changes, competitor signals and stock
age. Produces repricing proposals with margin before/after and volume affected.
Enforces guardrails absolutely: no proposal below the floor, ever.
**Autonomy:** `approve`.

### 4.11 Ask-your-business (`/admin/ask`)
Natural-language questions → a planned query over the data tools → an answer
with a table or chart and the query shown for audit. Handles follow-ups,
saves to reports, schedules recurring answers. Read-only by construction.

### 4.12 Ops exception watcher
A continuously running set of checks that create tasks rather than emails:
payment failed, order past promised date, shipment ETA slipped, PO unconfirmed,
customs hold, stock below reorder point before a season, price below margin
floor, review below 3 stars, message unanswered past SLA, certificate expiring,
credit limit breached, unusual refund pattern, catalog page 404ing.

### 4.13 Photo studio automation
Batch background removal, consistent crops and shadows, colour-accurate swatch
generation, scale-reference overlay, lifestyle scene generation for categories
that lack photography, and video thumbnails. Generated imagery is watermarked
in metadata as generated and never used to misrepresent a physical product's
colour — the swatch photo is always real.

### 4.14 In-store assistant (POS)
The counter version of 3.1/3.2: photograph what the customer brought, get the
matching SKU **and its bin location**, plus "we have 4 here, 30 in the
warehouse, 500 arriving 12.10, or we can import 5,000". Turns every staff
member into the most experienced staff member.

---

## 5. Deterministic automations (no AI needed, and none should be added)

These are workflow rules — reliable, cheap, and they carry most of the daily
load. All configured and logged in `/admin/automations`.

**Order lifecycle**
`paid` → allocate stock → issue tax invoice → create fulfilment task → (on
ship) carrier label + tracking → WhatsApp with tracking → (on delivery)
delivered notice → +3 days review request → +N days replenishment reminder for
consumables.

**Payment**
Failed capture → retry schedule → customer notice with a payment link → cancel
and release stock after N days. Refund → credit note → notify.

**Stock**
Below reorder point → replenishment proposal. Receipt → release backorders →
notify waitlists → publish to New Arrivals → generate social drafts.
Zero stock → hide from ads feed, keep the page live with alternatives.

**Inbound**
PO sent → confirmation reminder at +48h → escalation at +96h. Ship date
approaching → packing-list request. ETA change → recalculate every dependent
date → notify affected customers and trade accounts. Arrival → receiving task.
Customs cleared → landed cost run → repricing proposal.

**Import requests**
Stage SLAs with escalation; quote sent → follow-up at +3 days, +7 days, expire
at validity; every milestone change → customer notification.

**B2B**
Invoice due in 3 days → reminder. Overdue → escalate to account manager.
Credit utilisation > 80% → alert. Contract expiring in 45 days → renewal task.
No order in 1.5× their usual cadence → win-back task.

**Marketing**
Abandoned cart (1h / 24h / 72h, stops on purchase). Browse abandonment.
Back-in-stock. Price drop. Post-purchase cross-sell built from the actual
project the items suggest. Birthday/anniversary. Win-back. All consent-gated,
all frequency-capped across channels (a customer must never get the same thing
on WhatsApp and email).

**Content & feeds**
Nightly: sitemap, Google Merchant and Meta catalog feeds, broken-link scan,
schema validation, image optimisation of anything new.

**Ops hygiene**
Daily backup verification, integration health checks, failed-webhook replay,
audit-log integrity check, and a Sunday 08:00 business summary to the owner
over WhatsApp.

---

## 6. Measuring the AI layer

Every capability reports: usage, acceptance rate (how often a human took the
draft unchanged), edit distance, error/complaint rate, latency, cost per
action, and the business metric it targets. `/admin/agents` shows this as a
scorecard, and capabilities that don't earn their keep get turned off. The
autonomy ladder is driven by these numbers, not by enthusiasm.

## 7. Guardrails summary

1. No agent invents a fact that a tool could have provided.
2. No customer-facing price, date or promise is sent without either a human or
   a deterministic computation behind it.
3. Every AI action is reversible and audited.
4. PII minimisation in prompts; cost and rate limits per capability.
5. Prompt-injection defence: content fetched from suppliers, customers, or the
   web is treated as data, never as instructions, and tools enforce permissions
   independently of what any text says.
6. The whole platform works with AI disabled.
