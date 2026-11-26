import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { verifyFactoryPortalToken } from "@/lib/factory-portal/token";
import { FactoryPortalBoard } from "@/components/factory/FactoryPortalBoard";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "פורטל מפעל | SO Atelier",
  robots: {
    index: false,
    follow: false,
  },
};

type Props = { params: Promise<{ token: string }> };

export default async function FactoryPortalPage({ params }: Props) {
  const { token } = await params;
  const isValid = await verifyFactoryPortalToken(token);
  if (!isValid) notFound();

  let orders: Order[] = [];
  try {
    const snap = await adminDb.collection("orders").orderBy("createdAt", "desc").get();
    orders = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, "id">) }));
  } catch (err) {
    console.warn("[factory-portal] Failed to load orders:", err);
  }

  return <FactoryPortalBoard token={token} orders={orders} />;
}
