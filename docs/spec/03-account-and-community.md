# 03 — Customer Account & Community

## 3.1 Account model

One `customers` record, one login (phone OTP primary, email/password and Google
as alternates), and an `accountType` that decides which surfaces unlock:

| accountType | Sees | Notes |
|-------------|------|-------|
| `guest` | Storefront + tokenised order tracking | No record until first order |
| `retail` | `/account/*` | Default on signup |
| `trade` | `/account/*` **+** `/trade/*` | Requires approval (doc 04) |
| `staff` | Also `/admin` or `/pos` per role | Never mixed into customer data |

A retail customer who applies for trade keeps the same account, order history
and loyalty — the upgrade is a flag, not a new identity. Trade accounts can
have **sub-users** (an assistant who orders, an owner who approves).

## 3.2 `/account` — dashboard

Answers three questions above the fold: *where's my order*, *what do I buy
again*, *what did I save*.

- Open orders with live status and delivery date.
- **Reorder rail** — most-repurchased SKUs with one-tap add, quantity
  pre-filled from history.
- **Running low** — consumables predicted to be due (thread, elastic, glue),
  based on purchase cadence; each with a "remind me" or "add".
- Saved projects and lists.
- Loyalty points + progress to next tier.
- Alerts summary (back-in-stock hits waiting).

## 3.3 Orders, returns, invoices

`/account/orders/[id]` mirrors the admin order page's shape (learn once):
timeline, items, payment, delivery, documents.

- **Every order has its invoice** (חשבונית מס / קבלה) downloadable as PDF.
- **Reorder** — whole order or selected lines, with a diff shown if prices or
  availability changed.
- **Return / exchange** — self-service: pick lines, pick reason, optionally
  upload a photo. AI triages (doc 10 §4.5) into: auto-approve refund,
  auto-approve exchange, or route to a human. Returns produce a label or a
  "bring it to the shop" QR code.
- **Partial shipments** shown as separate parcels with their own tracking,
  including "the remaining 8 units arrive with shipment #SH-2044 on 12.10".

## 3.4 Projects, lists and alerts

**Projects** (`/account/projects`) are the account's most differentiated
feature. A project is a named container with:
- a cover photo (the user's own or a catalog one),
- a materials list of SKUs + quantities + "have it / need it" state,
- notes and measurements,
- an optional shopping cart snapshot and a budget,
- sharing (read-only link, or collaborate with a client),
- **AI assist**: upload a reference photo or a pattern PDF → suggested
  materials list with quantities the user edits before adding to cart.

**Lists** are lighter: wishlists, "for the studio", shareable via WhatsApp.

**Alerts** (`/account/alerts`) collects back-in-stock, price-drop, restock
reminders and import-request updates, each with per-channel toggles.

## 3.5 Loyalty, referrals, gift cards

- Points on ₪ spent, extra for reviews with photos, project publishing and
  referrals. Redeemable at checkout **and at the POS** (same balance).
- Tiers with tangible perks: free shipping thresholds, early access to new
  arrivals from an inbound shipment, workshop discounts, sample allowance.
- Referral link per customer, attributed to the referred order.
- Gift cards sold online, redeemable in shop; balance visible in account.

## 3.6 Community & learning

This is what turns a supplies shop into a destination — and it feeds SEO,
email and social with no extra work.

### `/learn` — guides hub
Replaces the current "Blog". Content types: how-to guide, technique tutorial,
material explainer, project walkthrough, glossary entry. Each article can embed
a **live product block** (real price, real stock) and a materials list.

### `/projects` — project gallery
Staff projects plus customer-submitted ones (with moderation). Every project
carries its materials list, so browsing inspiration ends in a cart.

### `/workshops` — classes
The Tel Aviv shop's workshops as a bookable product: schedule, capacity,
price, materials included (drawn from real SKUs, so a booking can reserve
stock), waitlist, reminders, and post-class follow-up with the materials used.

### UGC loop
Post-delivery message asks "מה יצרתם?" → photo upload → moderation → appears on
the product page and optionally becomes a project. Points awarded. The content
engine (doc 10 §4.4) can turn approved UGC into social posts and guide drafts.

### Glossary `/learn/glossary`
Hebrew ⇄ English haberdashery terms with photos. Genuinely useful for trade
customers ordering abroad, and a quiet SEO asset ("מה זה ליבית", "grosgrain
בעברית").

## 3.7 Notifications & consent

One preference centre covering WhatsApp, SMS, email and web push, split by
purpose: transactional (always on), stock alerts, marketing, community. Consent
recorded with timestamp and source for compliance with Israeli spam law
(תיקון 40 לחוק התקשורת) — opt-in must be explicit and revocable in one tap,
and every marketing message carries a working unsubscribe.
