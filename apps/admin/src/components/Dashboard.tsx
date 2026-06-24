"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LogOut,
  ReceiptText,
  UtensilsCrossed,
  IndianRupee,
  Soup,
  TrendingUp,
  History as HistoryIcon,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { formatPaise } from "@sriambika/db";
import { supabaseBrowser } from "@/lib/supabase";
import OrdersPanel from "./OrdersPanel";
import HistoryPanel from "./HistoryPanel";
import MenuPanel from "./MenuPanel";
import ReportsPanel from "./ReportsPanel";
import { ACTIVE_STATUSES, type OrderWithItems, type MenuRow, type CategoryItem } from "./types";

type Tab = "orders" | "history" | "menu" | "reports";

export default function Dashboard({
  initialOrders,
  initialMenu,
  initialCategories,
  ownerName,
}: {
  initialOrders: OrderWithItems[];
  initialMenu: MenuRow[];
  initialCategories: CategoryItem[];
  ownerName: string;
}) {
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders);
  const [menu, setMenu] = useState<MenuRow[]>(initialMenu);
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [tab, setTab] = useState<Tab>("orders");
  const [refreshing, setRefreshing] = useState(false);

  const refetchOrders = useCallback(async () => {
    const sb = supabaseBrowser();
    if (!sb) return;
    const { data } = await sb
      .from("orders")
      .select("*, order_items(*), profiles(full_name, phone)")
      .order("created_at", { ascending: false })
      .limit(500);
    if (data) setOrders(data as OrderWithItems[]);
  }, []);

  // Manual full refresh (orders + menu + categories).
  const refresh = async () => {
    const sb = supabaseBrowser();
    if (!sb) return;
    setRefreshing(true);
    const [o, m, c] = await Promise.all([
      sb.from("orders").select("*, order_items(*), profiles(full_name, phone)").order("created_at", { ascending: false }).limit(500),
      sb.from("menu_items").select("*").order("sort"),
      sb.from("categories").select("*").order("sort"),
    ]);
    if (o.data) setOrders(o.data as OrderWithItems[]);
    if (m.data) setMenu(m.data as MenuRow[]);
    if (c.data) setCategories(c.data as CategoryItem[]);
    setRefreshing(false);
  };

  // Auto-refresh fallback: re-pull orders every 20s in case a realtime event
  // is ever missed, so a new order can't sit unseen.
  useEffect(() => {
    const id = setInterval(refetchOrders, 20000);
    const onFocus = () => refetchOrders();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [refetchOrders]);

  // Realtime: new orders + status changes (incl. customer cancellations).
  useEffect(() => {
    const sb = supabaseBrowser();
    if (!sb) return;
    const ch = sb
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        async (payload) => {
          if (payload.eventType === "DELETE") {
            setOrders((prev) => prev.filter((o) => o.id !== (payload.old as { id: string }).id));
            return;
          }
          const id = (payload.new as { id: string }).id;
          const { data } = await sb
            .from("orders")
            .select("*, order_items(*), profiles(full_name, phone)")
            .eq("id", id)
            .single();
          if (!data) return;
          setOrders((prev) => {
            const exists = prev.some((o) => o.id === data.id);
            return exists
              ? prev.map((o) => (o.id === data.id ? (data as OrderWithItems) : o))
              : [data as OrderWithItems, ...prev];
          });
        }
      )
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, []);

  const activeOrders = useMemo(
    () => orders.filter((o) => ACTIVE_STATUSES.includes(o.status)),
    [orders]
  );

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const isToday = (s: string) => new Date(s).toDateString() === today;
    const collected = orders
      .filter((o) => o.payment_status === "paid" && isToday(o.created_at))
      .reduce((a, o) => a + o.total_paise, 0);
    const live = menu.filter((m) => m.available).length;
    const todayCount = orders.filter((o) => isToday(o.created_at)).length;
    return { collected, open: activeOrders.length, live, total: menu.length, todayCount };
  }, [orders, menu, activeOrders]);

  const logout = async () => {
    await supabaseBrowser()?.auth.signOut();
    location.href = "/login";
  };

  const cards = [
    { icon: IndianRupee, label: "Collected today", value: formatPaise(stats.collected) },
    { icon: ReceiptText, label: "Open orders", value: String(stats.open) },
    { icon: Soup, label: "Items live", value: `${stats.live}/${stats.total}` },
    { icon: TrendingUp, label: "Orders today", value: String(stats.todayCount) },
  ];

  const tabs: [Tab, string, typeof ReceiptText][] = [
    ["orders", "Orders", ReceiptText],
    ["history", "History", HistoryIcon],
    ["menu", "Menu", UtensilsCrossed],
    ["reports", "Reports", BarChart3],
  ];

  return (
    <main className="min-h-screen bg-espresso-900">
      <div className="absolute inset-0 bg-aurora opacity-10" />
      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-body text-xs uppercase tracking-[0.35em] text-amber">
              Sri Ambika · Kitchen
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold text-ivory sm:text-4xl">
              {ownerName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl neu px-4 py-2.5 font-body text-sm text-ivory/70 transition-colors hover:text-ivory disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-xl neu px-4 py-2.5 font-body text-sm text-ivory/70 transition-colors hover:text-ivory"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl neu p-4 sm:p-5">
              <c.icon className="h-5 w-5 text-amber" />
              <p className="mt-2 font-display text-xl font-bold text-ivory sm:text-2xl">
                {c.value}
              </p>
              <p className="font-body text-[11px] uppercase tracking-wider text-ivory/45">
                {c.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-7 flex gap-2 overflow-x-auto pb-1">
          {tabs.map(([k, label, Icon]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 font-body text-sm font-semibold transition-all sm:px-5 sm:py-3 ${
                tab === k ? "clay-gold text-espresso-900" : "neu text-ivory/70"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-7 pb-16">
          {tab === "orders" && <OrdersPanel orders={activeOrders} setOrders={setOrders} />}
          {tab === "history" && <HistoryPanel orders={orders} />}
          {tab === "menu" && (
            <MenuPanel
              menu={menu}
              setMenu={setMenu}
              categories={categories}
              setCategories={setCategories}
            />
          )}
          {tab === "reports" && <ReportsPanel orders={orders} ownerName={ownerName} />}
        </div>
      </div>
    </main>
  );
}
