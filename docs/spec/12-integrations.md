# 12 — Integrations

Each entry: what it does, where it plugs in, and what happens when it fails.
Everything sits behind a thin adapter in `lib/integrations/<service>/` so a
provider can be swapped without touching feature code. Health and last-sync for
all of them is visible in `/admin/integrations`.

---

## 12.1 Payments

**Grow (by Meshulam)** — already scaffolded in `lib/grow/`. Handles card,
**Bit**, Apple Pay and Google Pay, plus payment links (essential for phone and
WhatsApp orders) and recurring charges for subscriptions.
- Checkout, POS card-not-present, trade balance payments, import deposits.
- Webhook → order payment status; settlement reports → `/admin/payouts`.
- **Failure:** order stays `pending_payment`, cart preserved, customer gets a
  fresh payment link automatically; nothing is lost.
- Reference: https://grow-il.readme.io/

**In-store terminal (EMV)** — physical card reader for the shop, reconciled
into the same `payments` collection so daily takings are one number.

**Bank transfer** — generated reference per invoice; matched by an automation
against bank statement imports (manual CSV at first).

---

## 12.2 Invoicing & accounting (Israel)

A certified Israeli invoicing provider (Green Invoice / EZcount / Morning class)
issues **חשבונית מס** and **קבלה** for every order, POS sale, trade invoice and
import deposit.
- Must support: allocation numbers under the Israeli Tax Authority's invoice
  allocation requirement, credit notes (חשבונית זיכוי), foreign-currency
  documents for export sales, and per-series numbering for shop vs web.
- Exports for the bookkeeper; VAT period file from `/admin/vat`.
- **VAT is 18%** (standard rate, unchanged for 2026 — confirm at go-live and
  keep it a setting, never a constant in code).
- **Failure:** the sale still completes; invoice issuance retries and raises a
  task if it can't — never block a customer on a document service.

---

## 12.3 Shipping & delivery

| Provider | Use |
|----------|-----|
| **Israel Post (דואר ישראל)** | Small parcels, national coverage, cheapest |
| **HFD / Cheetah / Baldar-class courier** | Next-day courier, cash on delivery, lockers |
| **Locker networks** | Pickup points as a checkout option |
| **Own pickup (Levontin 9)** | Click & collect with slots |

Adapter responsibilities: rate quote at checkout, label creation, tracking
pull, delivery webhooks, returns labels, and pickup-point lists.
**Failure:** rates fall back to a configured static table; labels queue for
batch retry; tracking degrades to a link.

---

## 12.4 Freight, customs & trade

- **Freight forwarder portals / email** — no standard API; the practical
  integration is **document intelligence** (doc 10 §4.8) parsing their emails
  and PDFs, plus manual milestone entry. A container-tracking service can be
  added for sea legs (BL/container-number lookup) for live ETA.
- **Customs broker** — document pack generation and file exchange; entry
  numbers and clearance dates entered by the broker or parsed from their
  documents.
- **Israeli customs tariff data** — HS codes and duty rates maintained as a
  reference dataset in the platform, refreshed periodically; the classification
  assistant reads it rather than guessing.
- **FX rates** — daily Bank of Israel rates for reporting plus the actual rate
  achieved on each supplier payment for true landed cost.

---

## 12.5 Communications

**WhatsApp Business Platform** — the primary customer channel in Israel.
- Template messages for transactional flows (order paid, shipped, out for
  delivery, ready for pickup, back in stock, import milestone, invoice due).
- Two-way conversation into the unified inbox, with the AI assistant on the
  first response and a human takeover.
- Opt-in captured explicitly at checkout and in the preference centre.

**Email** — transactional via a provider with good deliverability to Israeli
inboxes; marketing broadcasts from the same list with consent segregation.

**SMS** — OTP login and fallback for customers without WhatsApp.

**Web push** — PWA notifications for alerts.

**Failure:** every notification has a channel fallback chain
(WhatsApp → SMS → email) and is queued, never dropped.

---

## 12.6 Search & AI infrastructure

- **Search service** — Typesense (self-hostable, cheap, excellent typo
  tolerance) or Algolia. Requirements: Hebrew tokenisation, synonyms, faceting
  on numeric attributes (width mm), and vector search in the same index so
  text and image results can be blended.
- **Embeddings** — image and text models via the agent gateway; vectors stored
  in the search service (or a dedicated vector store).
- **LLM providers** — at least two configured, with automatic failover and
  per-capability model selection (cheap model first, escalate on low
  confidence).
- **ASR** for Hebrew voice search; **OCR** for document intelligence.
- **Background removal / image processing** — a hosted API or a self-hosted
  model in a worker; results cached in the media library.

---

## 12.7 Marketing & analytics

- **Google Merchant Center** + **Meta catalog** feeds, generated nightly with
  availability and price accuracy (out-of-stock items must drop out fast, or
  ad money burns).
- **Google Ads / Meta Ads** — spend and conversion pulled back into
  `/admin/campaigns` so ROAS is measured **against margin after landed cost**,
  not revenue.
- **GA4 + server-side events** (Consent Mode aware) and a first-party event
  stream into our own `events` collection — the analytics we actually trust.
- **Instagram / TikTok / Facebook publishing** for the social module.
- **Review platform** (or native reviews) with product-level aggregation.

---

## 12.8 Infrastructure & platform

- **Firebase**: Firestore (system of record), Auth (customers, staff, supplier
  magic links via custom tokens), Storage (media & documents), Cloud Functions
  or Next.js route handlers for webhooks and scheduled jobs.
- **Hosting**: Next.js on Vercel or Firebase App Hosting; ISR for catalog
  pages, server components for personalised surfaces.
- **Image CDN** with on-the-fly resize/format (AVIF/WebP) — non-negotiable for
  a catalog this image-heavy on Israeli mobile networks.
- **Scheduled jobs**: forecasting, feed generation, ETA polling, exception
  checks, backups, report delivery.
- **Queues** for anything slow or retryable (enrichment, document parsing,
  label printing, notification sending).
- **Observability**: error tracking, structured logs, uptime checks on
  checkout and POS specifically, and alerting to WhatsApp for P1s.
- **Backups**: daily Firestore export with restore drills; document/media
  bucket versioning.

---

## 12.9 Data ownership & migration

- Catalog migration from Folyou extends the existing
  `scripts/scrape-catalog.ts`: products, images, categories, plus a
  **redirect map** for every legacy URL.
- Customer and order history import (CSV export from the legacy platform)
  with de-duplication by phone number.
- No integration is allowed to become the system of record for anything —
  Firestore holds the truth; every external service is a projection or a
  transport. This is what makes the platform swappable and the data ours.

---

**Sources consulted:** [Grow Payments developer docs](https://grow-il.readme.io/),
[Israel VAT rate 2026 (18%)](https://vatinfo.org/countries/il),
[Israel VAT rise to 19% proposal dropped](https://www.vatcalc.com/vat/israel-vat-rise-to-19-jan-2026-proposal/)
