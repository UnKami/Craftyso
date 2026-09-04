# 09 — Supplier Portal `/portal`

## 9.1 Why it exists

Today a supplier's confirmation is a WhatsApp message; their packing list is a
photo of a printout; their ship date is a sentence in broken English. The
portal turns each of those into a record — without asking the factory to change
how they work more than a little.

**Design constraints:** English-first (with Chinese and Turkish UI strings),
phone-usable, no training, no app install, magic-link login (no passwords), and
**every action also possible by email or WhatsApp reply** — the portal is the
preferred path, not the only one. Whatever arrives by message is parsed by AI
into the same records.

## 9.2 Access model

- Supplier contacts are invited per supplier record; each gets a magic link.
- A supplier sees only their own POs, RFQs, items and documents.
- Roles: `supplier_admin` (can edit catalog & prices), `supplier_user`
  (confirm, upload, message).
- All portal activity is written to the audit log and shows in the supplier's
  scorecard.

## 9.3 Screens

**`/portal` — dashboard.** "What we need from you": POs awaiting confirmation,
RFQs awaiting a quote, shipments needing a packing list, documents expiring
(certificates), and overdue promises — each with a due date.

**`/portal/rfqs/[id]`.** The brief with photos and specs, a structured response
form (unit price, currency, MOQ, lead time, tooling, sample cost, validity,
carton spec, incoterm), file upload for their own quote, and a message box.
Everything translated both ways.

**`/portal/orders/[id]` — the PO.** Confirm as-is, or propose changes (price,
quantity, date, substitution) which come back to us as an approval task. Upload
the proforma. See the payment status of their deposit. Post production
milestones ("cutting done", "50% complete") with photos.

**`/portal/shipments/[id]`.** Declare the ship date, upload the packing list
and commercial invoice, enter carton count / CBM / gross weight, add container
or AWB numbers, upload loading photos, and add the forwarder's booking details.

**`/portal/catalog`.** Their items: price, price validity, MOQ, carton spec,
lead time, photos, spec sheets. When they update a price, it lands as a
**pending change** that triggers our landed-cost and repricing review rather
than silently changing anything.

**`/portal/documents`.** Certificates, test reports, material declarations,
factory audit documents, with expiry tracking and automatic renewal reminders.

**`/portal/messages`.** The same thread that appears in our unified inbox, with
automatic translation in both directions.

## 9.4 Automation around the portal

- Invitation, reminder and escalation sequences for anything overdue.
- Anything a supplier sends by email or WhatsApp instead (PDF proforma, photo
  of a packing list, "we ship Friday") is parsed by AI, matched to the right PO
  or shipment, and posted as a suggested update for a coordinator to confirm —
  so the record stays complete even when the supplier ignores the portal.
- Scorecard metrics update from portal timestamps automatically.
- Certificate expiry, price validity expiry and lead-time drift all raise tasks.
