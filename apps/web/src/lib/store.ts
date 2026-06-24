"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MenuItem, Order, OrderStatus } from "./types";
import { SEED_MENU, TAX_RATE } from "./data";

interface AppState {
  // menu (now sourced from Supabase, hydrated on load)
  menu: MenuItem[];
  setMenu: (items: MenuItem[]) => void;
  toggleAvailable: (id: string) => void;
  updateItem: (id: string, patch: Partial<MenuItem>) => void;
  addItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  setImage: (id: string, dataUrl: string) => void;

  // cart
  cart: Record<string, number>;
  addToCart: (id: string) => void;
  addManyToCart: (entries: { id: string; qty: number }[]) => void;
  decFromCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;

  // orders
  orders: Order[];
  placeOrder: (o: Omit<Order, "id" | "createdAt" | "status" | "paid">) => string;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  togglePaid: (id: string) => void;

  // admin
  adminAuthed: boolean;
  setAdminAuthed: (v: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      menu: SEED_MENU,
      setMenu: (items) => set({ menu: items }),
      toggleAvailable: (id) =>
        set((s) => ({
          menu: s.menu.map((m) =>
            m.id === id ? { ...m, available: !m.available } : m
          ),
        })),
      updateItem: (id, patch) =>
        set((s) => ({
          menu: s.menu.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      addItem: (item) => set((s) => ({ menu: [item, ...s.menu] })),
      removeItem: (id) =>
        set((s) => ({ menu: s.menu.filter((m) => m.id !== id) })),
      setImage: (id, dataUrl) =>
        set((s) => ({
          menu: s.menu.map((m) => (m.id === id ? { ...m, image: dataUrl } : m)),
        })),

      cart: {},
      addToCart: (id) =>
        set((s) => ({ cart: { ...s.cart, [id]: (s.cart[id] ?? 0) + 1 } })),
      addManyToCart: (entries) =>
        set((s) => {
          const next = { ...s.cart };
          for (const { id, qty } of entries) next[id] = (next[id] ?? 0) + qty;
          return { cart: next };
        }),
      decFromCart: (id) =>
        set((s) => {
          const next = { ...s.cart };
          const v = (next[id] ?? 0) - 1;
          if (v <= 0) delete next[id];
          else next[id] = v;
          return { cart: next };
        }),
      removeFromCart: (id) =>
        set((s) => {
          const next = { ...s.cart };
          delete next[id];
          return { cart: next };
        }),
      clearCart: () => set({ cart: {} }),

      orders: [],
      placeOrder: (o) => {
        const id = "ORD-" + Math.floor(1000 + Math.random() * 9000);
        const order: Order = {
          ...o,
          id,
          createdAt: Date.now(),
          status: "new",
          paid: false,
        };
        set((s) => ({ orders: [order, ...s.orders] }));
        return id;
      },
      setOrderStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),
      togglePaid: (id) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, paid: !o.paid } : o
          ),
        })),

      adminAuthed: false,
      setAdminAuthed: (v) => set({ adminAuthed: v }),
    }),
    {
      name: "sri-ambika-store",
      // Only the cart is local now. Menu + orders live in Supabase.
      partialize: (s) => ({ cart: s.cart }),
    }
  )
);

export function cartTotals(menu: MenuItem[], cart: Record<string, number>) {
  const lines = Object.entries(cart)
    .map(([id, qty]) => {
      const item = menu.find((m) => m.id === id);
      if (!item) return null;
      return { id, name: item.name, price: item.price, qty };
    })
    .filter(Boolean) as { id: string; name: string; price: number; qty: number }[];
  const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const count = lines.reduce((a, l) => a + l.qty, 0);
  return { lines, subtotal, tax, total: subtotal + tax, count };
}
