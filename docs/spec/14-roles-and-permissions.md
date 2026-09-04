# 14 — Roles & Permissions

## 14.1 Role catalogue

| Role | Surface | Scope |
|------|---------|-------|
| `owner` | Admin, POS | Everything, including finance, costs, users, agent autonomy |
| `manager` | Admin, POS | Everything except user management, agent autonomy and some finance |
| `sales` | Admin, POS | Orders, customers, quotes, inbox, trade accounts (no costs) |
| `warehouse` | Admin (mobile), POS | Inventory, receiving, fulfilment, transfers, counts |
| `shop_staff` | POS, limited admin | Sell, lookup, returns, click&collect, customer create |
| `import_ops` | Admin | Suppliers, RFQs, POs, shipments, customs, landed cost, import requests |
| `marketing` | Admin | Content, social, campaigns, email, SEO, segments, collections |
| `finance` | Admin | Invoices, payments, payouts, expenses, VAT, receivables/payables |
| `support` | Admin | Inbox, orders (read + limited actions), returns, customers |
| `supplier` | Portal | Only their own POs, RFQs, shipments, items, documents |
| `trade_buyer` | Trade portal | Their account's catalog, orders, quotes, invoices |
| `trade_approver` | Trade portal | The above + release orders above the buyer limit |
| `trade_viewer` | Trade portal | Invoices and statements only |
| `customer` | Storefront/account | Their own data |

Roles are additive; a person can hold several (`sales` + `shop_staff`).

## 14.2 Sensitive data gates

Three things are gated harder than everything else, because they are what a
leak would actually cost:

1. **Cost, margin and landed cost** — visible to `owner`, `manager`,
   `import_ops`, `finance` only. Stored in a separate private subdocument so no
   client rule mistake can expose them (doc 11 §11.4).
2. **Supplier identity and pricing** — visible to `owner`, `manager`,
   `import_ops`. Never exposed on any customer-facing surface or in prompts
   sent to consumer-facing AI capabilities.
3. **Customer PII and payment data** — no card data is ever stored (Grow holds
   it); PII access is logged; exports require `owner`/`manager`.

## 14.3 Action-level permissions

Beyond read/write, these actions carry their own permission and always require
a reason that is written to the audit log:

- Refund above ₪X · discount above Y% · price change below the margin floor ·
  inventory adjustment above N units · cancel a confirmed PO · approve a trade
  credit limit · send a customer quote · change agent autonomy levels ·
  delete anything.

Approval limits are configurable per user, not hard-coded per role.

## 14.4 Enforcement

Three layers, all required:
1. **Firestore rules** — the last line, protecting against a compromised client.
2. **Server actions / route handlers** — `requireRole()` extending the existing
   `lib/auth/require-admin.ts`, checked before any mutation.
3. **UI** — hide what a user can't do, but never rely on hiding.

Agents inherit the permissions of the user or the service identity they act
for; there is no "AI can do anything" path. An agent action that would exceed
its identity's permissions becomes an approval task instead.

## 14.5 Account security

- 2FA required for `owner`, `manager`, `finance`, and enforced by policy for
  all staff.
- Session length short for admin, longer for POS with a device pin and a fast
  user switch (a shop tablet is shared).
- Magic-link auth for suppliers, with link expiry and device binding.
- Every login, permission change and sensitive read is audited.
