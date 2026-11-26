"use client";

import type { Order, ProductionStatus } from "@/lib/types";
import {
  updateFactoryOrder,
  updateProductionStatus,
} from "@/app/admin/(dashboard)/factory/actions";
import { FactoryOrdersGrid } from "@/components/factory/FactoryOrdersGrid";

export function AdminFactoryGrid({ orders }: { orders: Order[] }) {
  async function handleStatus(orderId: string, status: ProductionStatus) {
    await updateProductionStatus(orderId, status);
  }

  async function handleSave(input: {
    orderId: string;
    factoryNotes: string;
    trackingNumber: string;
  }) {
    await updateFactoryOrder(input);
  }

  return (
    <FactoryOrdersGrid
      orders={orders}
      defaultFilter="all"
      onUpdateStatus={handleStatus}
      onSaveDetails={handleSave}
    />
  );
}
