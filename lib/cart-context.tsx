"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  priceIls: number;
  image?: string;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  addItem: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  totalIls: number;
  totalItems: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "craftyso_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // Reading localStorage in a lazy useState initializer would run on
      // the server (where it's unavailable) and mismatch client hydration,
      // so this one-time sync-from-storage has to happen post-mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore corrupt local storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const addItem: CartContextValue["addItem"] = (line, quantity = 1) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.productId === line.productId);
        if (existing) {
          return prev.map((l) =>
            l.productId === line.productId ? { ...l, quantity: l.quantity + quantity } : l,
          );
        }
        return [...prev, { ...line, quantity }];
      });
    };

    const removeItem: CartContextValue["removeItem"] = (productId) => {
      setLines((prev) => prev.filter((l) => l.productId !== productId));
    };

    const setQuantity: CartContextValue["setQuantity"] = (productId, quantity) => {
      setLines((prev) =>
        quantity <= 0
          ? prev.filter((l) => l.productId !== productId)
          : prev.map((l) => (l.productId === productId ? { ...l, quantity } : l)),
      );
    };

    const clear = () => setLines([]);

    const totalIls = lines.reduce((sum, l) => sum + l.priceIls * l.quantity, 0);
    const totalItems = lines.reduce((sum, l) => sum + l.quantity, 0);

    return { lines, addItem, removeItem, setQuantity, clear, totalIls, totalItems };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
