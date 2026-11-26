"use client";

import type { Order, ProductionStatus } from "@/lib/types";
import {
  portalUpdateOrderDetails,
  portalUpdateProductionStatus,
} from "@/app/factory-portal/[token]/actions";
import { FactoryOrdersGrid } from "./FactoryOrdersGrid";

export function FactoryPortalBoard({
  token,
  orders,
}: {
  token: string;
  orders: Order[];
}) {
  async function handleStatus(orderId: string, status: ProductionStatus) {
    await portalUpdateProductionStatus(token, orderId, status);
  }

  async function handleSave(input: {
    orderId: string;
    factoryNotes: string;
    trackingNumber: string;
  }) {
    await portalUpdateOrderDetails({ token, ...input });
  }

  return (
    <div className="min-h-screen bg-[#0c0907] text-[#f3ede2]">
      <header className="sticky top-0 z-30 border-b border-[#2d2118] bg-[#120c08]/95 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#c59b5f]">
              SO ATELIER • PRIVATE FACTORY PORTAL
            </span>
            <h1 className="font-serif-hebrew text-xl font-bold text-[#fbf8f2] sm:text-2xl">
              פורטל הזמנות לייצור ומשלוח
            </h1>
          </div>
          <p className="text-xs text-[#aa9c8d]">
            לחצו על כל כרטיס הזמנה לצפייה מלאה, הורדת גרפיקה ועדכון משלוח
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <FactoryOrdersGrid
          orders={orders}
          defaultFilter="paid_active"
          onUpdateStatus={handleStatus}
          onSaveDetails={handleSave}
        />
      </main>
    </div>
  );
}
