# Craftyso Platform Spec

Product specification for the new craftyso.co.il — a single platform that runs
the whole business: retail storefront, B2B trade, the Tel Aviv shop, managed
importing, supplier relations, marketing and operations.

Written for the stack already scaffolded in this repo: **Next.js 16 (App Router)
+ Firebase (Firestore / Auth / Storage) + Grow payments**, extended where the
current scaffold is not enough.

## Read in this order

| # | Doc | What it covers |
|---|-----|----------------|
| 00 | [Overview & principles](./00-overview.md) | Business model, personas, product principles, what "AI-native" means here |
| 01 | [Information architecture](./01-information-architecture.md) | Complete sitemap, URL scheme, navigation model, search |
| 02 | [Storefront (B2C)](./02-storefront.md) | Every consumer page and feature |
| 03 | [Customer account & community](./03-account-and-community.md) | Account area, projects, learning, workshops, loyalty |
| 04 | [B2B trade portal](./04-b2b-trade-portal.md) | Trade accounts, tier pricing, quotes, credit, reorder |
| 05 | [Import-as-a-service](./05-import-service.md) | Customer-facing sourcing & import product |
| 06 | [Admin console](./06-admin-console.md) | Every internal module, screen by screen |
| 07 | [Supply chain & import ops](./07-supply-chain-ops.md) | Suppliers, POs, shipments, customs, landed cost |
| 08 | [Inventory, warehouse & POS](./08-inventory-and-pos.md) | Stock model, warehouse app, physical shop |
| 09 | [Supplier portal](./09-supplier-portal.md) | External supplier logins |
| 10 | [AI & automation layer](./10-ai-and-automation.md) | Every AI capability and automated workflow |
| 11 | [Data model](./11-data-model.md) | Firestore collections, TypeScript types, indexes, rules |
| 12 | [Integrations](./12-integrations.md) | Payments, invoicing, shipping, comms, ads, customs |
| 13 | [Design & interaction system](./13-design-system.md) | RTL, navigation ergonomics, accessibility (IS 5568), components |
| 14 | [Roles & permissions](./14-roles-and-permissions.md) | Who can see and do what |
| 15 | [Roadmap & gap analysis](./15-roadmap.md) | Phases, and what the current repo already has vs needs |

## One-paragraph summary

Craftyso today is a Hebrew catalog of ~19 categories of haberdashery and craft
supplies on a legacy Folyou store, plus a physical shop on Levontin St. in Tel
Aviv, plus an import operation that nobody outside the office can see. The new
platform makes all three the same system: one product record carries its
retail price, its trade tiers, its supplier, its landed cost and its live stock
across web and shop; one order object covers a ₪18 ribbon and a ₪40,000
container; and an AI layer sits on top of all of it so that finding a matching
button, quoting an import job, drafting a purchase order or answering a
WhatsApp message is a two-second action instead of a two-day one.
