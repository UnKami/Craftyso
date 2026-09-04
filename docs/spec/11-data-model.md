# 11 — Data Model

Extends `lib/types.ts` as it exists today. The current model (Category,
Product, Order, Lead, Campaign, ContentPage, SocialPost, AdminUser) stays
recognisable; everything below either enriches it or adds the objects the new
business lines need.

## 11.1 Firestore collections

```
products/{productId}
  variants/{variantId}              subcollection
categories/{categoryId}
attributes/{attributeId}            colour, width, material… value registries
collections/{collectionId}
media/{mediaId}
priceLists/{priceListId}
  entries/{sku}                     subcollection
promotions/{promotionId}
reviews/{reviewId}
questions/{questionId}              product Q&A

inventory/{variantId_locationId}    denormalised current state
inventoryMovements/{movementId}     append-only ledger
locations/{locationId}
counts/{countId}
transfers/{transferId}

customers/{customerId}
  addresses/{addressId}
  alerts/{alertId}
tradeAccounts/{accountId}           trade profile hanging off a customer
tradeApplications/{applicationId}
contracts/{contractId}
lists/{listId}                      wishlists / shopping lists
projects/{projectId}                customer & staff projects

carts/{cartId}
orders/{orderId}
  items/{itemId}
fulfilments/{fulfilmentId}
returns/{returnId}
quotes/{quoteId}
invoices/{invoiceId}
payments/{paymentId}
giftCards/{cardId}
loyaltyAccounts/{customerId}
  transactions/{txId}

suppliers/{supplierId}
  items/{supplierItemId}
  contacts/{contactId}
rfqs/{rfqId}
  responses/{responseId}
purchaseOrders/{poId}
  lines/{lineId}
shipments/{shipmentId}
customsEntries/{entryId}
landedCostRuns/{runId}
importRequests/{requestId}
  events/{eventId}
documents/{documentId}              any parsed file, linked polymorphically

posSessions/{sessionId}
posTransactions/{txId}

threads/{threadId}                  unified inbox
  messages/{messageId}
tasks/{taskId}                      the work queue behind "Today"
notifications/{notificationId}

workshops/{workshopId}
  bookings/{bookingId}
contentPages/{pageId}
socialPosts/{postId}
campaigns/{campaignId}
segments/{segmentId}

automations/{automationId}
  runs/{runId}
agentActions/{actionId}             every AI action, for audit & metrics
events/{eventId}                    global append-only activity/timeline stream
auditLog/{entryId}
settings/{key}
redirects/{fromPath}                legacy Folyou URL map
searchQueries/{queryId}             incl. zero-result log → catalog gaps
```

## 11.2 Key types (TypeScript, extending `lib/types.ts`)

```ts
// ---------- Catalog ----------
export type Money = { amount: number; currency: "ILS" | "USD" | "EUR" | "CNY" };

export type ColorValue = {
  hex: string;
  nameHe: string;
  nameEn: string;
  lab: [number, number, number];   // for ΔE2000 matching
};

export type AttributeValue =
  | { type: "color"; value: ColorValue }
  | { type: "dimension"; value: number; unit: "mm" | "cm" | "m" }
  | { type: "text"; value: string }
  | { type: "number"; value: number }
  | { type: "boolean"; value: boolean };

export type UnitOfMeasure = "piece" | "meter" | "roll" | "card" | "pack" | "kg";

export type ProductVariant = {
  id: string;
  sku: string;
  barcode?: string;
  label: string;
  attributes: Record<string, AttributeValue>;   // colour, width, finish…
  baseUnit: UnitOfMeasure;
  packUnits?: { unit: UnitOfMeasure; factor: number }[];
  priceIls: number;
  compareAtIls?: number;
  costIls?: number;               // moving weighted average landed cost
  weightGrams?: number;
  imageIds: string[];
  active: boolean;
};

export type Product = {
  id: string;
  slug: string;
  nameHe: string;
  nameEn?: string;
  descriptionHe?: string;
  descriptionEn?: string;
  categoryId: string;
  categoryPath: string[];         // for breadcrumbs & faceting
  collectionIds: string[];
  attributes: Record<string, AttributeValue>;
  variants: ProductVariant[];
  media: string[];                // mediaIds
  priceIls: number;               // from default variant
  quantityBreaks?: { minQty: number; priceIls: number }[];
  taxClass: "standard" | "zero";
  published: boolean;
  visibility: ("retail" | "trade")[];
  seo?: { title?: string; description?: string; keywords?: string[] };
  sourcing?: {
    supplierIds: string[];
    primarySupplierId?: string;
    supplierSku?: string;
    fobPrice?: Money;
    moq?: number;
    cartonQty?: number;
    leadTimeDays?: number;
    hsCode?: string;
    dutyRatePct?: number;
    countryOfOrigin?: string;
  };
  planning?: { reorderPoint?: number; safetyStock?: number; abcClass?: "A"|"B"|"C" };
  ai?: AiProvenance;
  sourceUrl?: string;             // legacy Folyou URL (kept from the scraper)
  createdAt: string; updatedAt: string;
};

export type AiProvenance = {
  generatedFields: string[];
  model: string;
  confidence: number;             // 0–1
  reviewedBy?: string;
  reviewedAt?: string;
};

// ---------- Inventory ----------
export type LocationType = "warehouse" | "shop" | "supplier_direct" | "transit" | "quarantine";

export type InventoryRecord = {
  id: string;                     // `${variantId}_${locationId}`
  variantId: string;
  locationId: string;
  onHand: number;
  allocated: number;
  available: number;              // derived, denormalised for query speed
  binLocation?: string;
  incoming?: { shipmentId: string; qty: number; eta: string }[];
  updatedAt: string;
};

export type MovementReason =
  | "receipt" | "sale" | "pos_sale" | "return" | "transfer_in" | "transfer_out"
  | "adjustment" | "count" | "damage" | "sample" | "workshop" | "cut_remnant";

export type InventoryMovement = {
  id: string; variantId: string; locationId: string;
  qty: number;                    // signed
  reason: MovementReason;
  refType?: "order" | "po" | "shipment" | "count" | "transfer" | "posTransaction";
  refId?: string;
  note?: string; actorId: string; createdAt: string;
};

// ---------- Orders ----------
export type OrderChannel = "web" | "pos" | "phone" | "trade_portal" | "whatsapp";
export type OrderStatus =
  | "draft" | "pending_payment" | "paid" | "partially_fulfilled" | "fulfilled"
  | "completed" | "cancelled" | "refunded" | "failed";

export type OrderItem = {
  id: string; productId: string; variantId: string; sku: string; name: string;
  quantity: number; unit: UnitOfMeasure;
  unitPriceIls: number; discountIls?: number; taxIls: number; totalIls: number;
  unitCostIls?: number;                       // landed, for margin
  allocation?: { locationId: string; qty: number }[];
  backorder?: { qty: number; shipmentId?: string; eta?: string };
};

export type Order = {
  id: string; number: string; channel: OrderChannel;
  customerId?: string;
  contact: { name: string; email?: string; phone: string };
  items: OrderItem[];
  subtotalIls: number; discountIls: number; shippingIls: number;
  vatIls: number; totalIls: number; marginIls?: number;
  status: OrderStatus;
  paymentStatus: "unpaid" | "authorized" | "paid" | "partially_refunded" | "refunded";
  fulfilmentStatus: "unfulfilled" | "partial" | "fulfilled" | "picked_up";
  delivery: {
    method: "pickup" | "courier" | "post" | "locker" | "supplier_direct";
    address?: Address; locationId?: string;
    promisedDate?: string; neededByDate?: string;
    carrier?: string; trackingNumber?: string; trackingUrl?: string;
  };
  poNumber?: string;                          // trade buyer's own reference
  priceListId?: string;
  invoiceId?: string;
  growTransactionId?: string;
  notes?: string; tags?: string[];
  createdAt: string; updatedAt: string;
};

// ---------- Trade ----------
export type TradeAccount = {
  id: string; customerId: string;
  businessName: string; taxId: string;        // ח.פ / ע.מ
  status: "pending" | "approved" | "suspended" | "rejected";
  priceListId: string;
  paymentTerms: "prepaid" | "net30" | "net60";
  creditLimitIls?: number; balanceIls: number;
  accountManagerId?: string;
  subUsers?: { customerId: string; role: "buyer" | "approver" | "viewer"; orderLimitIls?: number }[];
  createdAt: string; updatedAt: string;
};

// ---------- Sourcing & import ----------
export type Supplier = {
  id: string; name: string; country: string;
  languages: string[]; currency: Money["currency"];
  incoterm?: "FOB" | "EXW" | "CIF" | "DDP";
  paymentTerms?: string; bankDetails?: string;
  leadTimeDays?: { production: number; transitSea?: number; transitAir?: number };
  scorecard?: { onTimePct: number; qtyAccuracyPct: number; defectPct: number; responseHours: number; updatedAt: string };
  active: boolean; createdAt: string; updatedAt: string;
};

export type PurchaseOrderStatus =
  | "draft" | "sent" | "confirmed" | "in_production" | "ready_to_ship"
  | "shipped" | "partially_received" | "received" | "closed" | "cancelled";

export type PurchaseOrder = {
  id: string; number: string; supplierId: string;
  currency: Money["currency"]; incoterm: string;
  lines: { variantId: string; supplierSku?: string; qty: number; unitPrice: number; cartonQty?: number; receivedQty?: number }[];
  toolingCost?: number;
  paymentSchedule?: { label: string; pct: number; dueOn: string; paidAt?: string }[];
  promisedShipDate?: string; destinationLocationId: string;
  demandRefs?: { type: "forecast" | "backorder" | "importRequest"; id: string }[];
  status: PurchaseOrderStatus;
  documentIds: string[];
  createdAt: string; updatedAt: string;
};

export type Shipment = {
  id: string; number: string;
  mode: "sea_lcl" | "sea_fcl" | "air" | "courier";
  poIds: string[]; forwarder?: string;
  blNumber?: string; containers?: string[];
  portOfLoading?: string; portOfDischarge?: string;
  etd?: string; eta?: string; etaOriginal?: string; ataPort?: string;
  cbm?: number; grossWeightKg?: number; cartons?: number;
  costs?: { freight?: number; insurance?: number; portFees?: number; inland?: number; currency: Money["currency"] };
  customsEntryId?: string;
  milestones: { key: string; plannedAt?: string; actualAt?: string; note?: string }[];
  status: string; documentIds: string[];
  createdAt: string; updatedAt: string;
};

export type CustomsEntry = {
  id: string; shipmentId: string; brokerId?: string; entryNumber?: string;
  lines: { variantId: string; hsCode: string; customsValueIls: number; dutyRatePct: number; dutyIls: number }[];
  purchaseTaxIls?: number; vatIls: number; feesIls?: number;
  submittedAt?: string; clearedAt?: string;
  holds?: { reason: string; openedAt: string; resolvedAt?: string; costIls?: number }[];
  documentIds: string[];
};

export type LandedCostRun = {
  id: string; shipmentId: string;
  fxRates: Record<string, number>;
  pools: { type: "goods" | "freight" | "insurance" | "duty" | "vat" | "fees" | "inland" | "tooling"; amountIls: number; basis: "value" | "weight" | "volume" | "units" }[];
  results: { variantId: string; qty: number; unitLandedCostIls: number }[];
  status: "draft" | "approved" | "posted";
  approvedBy?: string; createdAt: string;
};

export type ImportRequestStage =
  | "new" | "understanding" | "sourcing" | "quoting" | "quote_sent" | "sample"
  | "approved" | "po_placed" | "in_production" | "in_transit" | "customs"
  | "received" | "delivered" | "closed" | "lost";

export type ImportRequest = {
  id: string; number: string; customerId?: string;
  contact: { name: string; phone: string; email?: string; businessName?: string };
  brief: { text?: string; imageIds: string[]; referenceUrls?: string[]; quantity?: number; targetUnitPriceIls?: number; neededBy?: string; customisation?: string };
  understanding?: { productType: string; attributes: Record<string, AttributeValue>; ai: AiProvenance };
  stage: ImportRequestStage;
  ownerId?: string;
  rfqIds: string[]; quoteId?: string; poId?: string; shipmentId?: string;
  estimate?: { lowIls: number; highIls: number; assumptions: string[] };
  slaDueAt?: string; lostReason?: string;
  publicToken: string;                        // for /import/[requestId]
  createdAt: string; updatedAt: string;
};

// ---------- Cross-cutting ----------
export type PlatformEvent = {
  id: string; entityType: string; entityId: string;
  type: string;                               // "order.paid", "shipment.eta_changed"
  actor: { type: "user" | "customer" | "agent" | "system"; id: string };
  data?: Record<string, unknown>;
  visibility: ("internal" | "customer" | "supplier")[];
  createdAt: string;
};

export type Task = {
  id: string; title: string; type: string;
  entityType?: string; entityId?: string;
  assigneeId?: string; dueAt?: string; priority: "low" | "normal" | "high" | "urgent";
  status: "open" | "snoozed" | "done" | "dismissed";
  createdBy: { type: "user" | "agent" | "automation"; id: string };
  createdAt: string;
};

export type AgentAction = {
  id: string; capability: string; autonomy: "suggest" | "draft" | "approve" | "auto";
  entityType?: string; entityId?: string;
  input: Record<string, unknown>; output: Record<string, unknown>;
  confidence?: number; model: string; tokens?: number; costUsd?: number; latencyMs: number;
  outcome: "pending" | "accepted" | "edited" | "rejected" | "executed" | "failed";
  reviewedBy?: string; createdAt: string;
};
```

## 11.3 Indexing & query notes

- Composite indexes needed for: orders by `status + createdAt`, orders by
  `customerId + createdAt`, inventory by `variantId`, movements by
  `variantId + createdAt`, POs by `supplierId + status`, shipments by
  `status + eta`, tasks by `assigneeId + status + dueAt`, threads by
  `status + lastMessageAt`, importRequests by `stage + slaDueAt`.
- **Search does not run on Firestore.** Product search, faceting and vector
  queries go to a dedicated search service (doc 12) kept in sync by a Firestore
  trigger. Firestore stays the write model and system of record.
- `available` is denormalised onto `InventoryRecord` and onto a small
  `productAvailability` doc per product so listing pages never fan out.
- Money is stored as integers in agorot internally (`number` here for
  readability) — decide once, enforce with a `Money` helper, never float-add.
- Timestamps as ISO strings for portability (as the current code does), with
  Firestore `Timestamp` used for range-queried fields.

## 11.4 Security rules (extending `firestore.rules`)

- Public read: published products, categories, collections, content, approved
  reviews. Nothing else.
- Customer read/write: only documents where `customerId == request.auth.uid`,
  and only whitelisted fields.
- Trade: additionally their `tradeAccount`, their price list entries, their
  quotes/invoices.
- Supplier portal: only documents where the supplier claim matches
  `supplierId`, and only the fields the portal writes.
- Staff: role-based (doc 14), enforced in rules **and** re-checked in server
  actions — the existing `lib/auth/require-admin.ts` pattern extends to
  `requireRole(...)`.
- Cost, margin, supplier price and landed cost fields are **never** readable by
  a customer-authenticated client; they live on a separate subdocument
  (`products/{id}/private/costs`) so a rule mistake can't leak them.
- All writes that move money or stock go through server actions / route
  handlers with the Admin SDK; clients never write orders, inventory or
  payments directly.
