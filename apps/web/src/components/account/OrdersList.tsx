"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Soup, Clock, X, Loader2, RefreshCw } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import { useStore } from "@/lib/store";
import { inr } from "@/lib/utils";

type OrderItem = {
  menu_item_id: string | null;
  name: string;
  price_paise: number;
  qty: number;
};
type Order = {
  id: string;
  code: string;
  status: string;
  fulfilment: string;
  payment_method: string;
  payment_status: string;
  total_paise: number;
  created_at: string;
  order_items: OrderItem[];
};

const STATUS_STYLE: Record<string, string> = {
  new: "bg-amber/15 text-amber-glow",
  preparing: "bg-amber/20 text-amber",
  ready: "bg-leaf/20 text-leaf",
  completed: "bg-white/8 text-ivory/50",
  cancelled: "bg-terracotta/15 text-terracotta",
};

const STEPS = ["new", "preparing", "ready", "completed"];

export default function OrdersList({
  initialOrders,
  userId,
}: {
  initialOrders: Order[];
  userId: string;
}) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const addManyToCart = useStore((s) => s.addManyToCart);

  const refresh = useCallback(async (showSpinner = false) => {
    const sb = supabaseBrowser();
    if (!sb) return;
    if (showSpinner) setRefreshing(true);
    const { data } = await sb
      .from("orders")
      .select(
        "id, code, status, fulfilment, payment_method, payment_status, total_paise, created_at, order_items(menu_item_id, name, price_paise, qty)"
      )
      .order("created_at", { ascending: false });
    if (data) setOrders(data as Order[]);
    if (showSpinner) setRefreshing(false);
  }, []);

  const cancel = async (o: Order) => {
    if (!confirm(`Cancel order ${o.code}?`)) return;
    const sb = supabaseBrowser();
    if (!sb) return;
    setCancelling(o.id);
    const { error } = await sb.rpc("cancel_order", { p_order_id: o.id });
    setCancelling(null);
    if (!error) {
      setOrders((prev) =>
        prev.map((x) => (x.id === o.id ? { ...x, status: "cancelled" } : x))
      );
    } else {
      alert(error.message.replace(/^.*?:\s*/, ""));
    }
  };

  // Live status updates (Supabase Realtime, RLS-scoped to this user)
  useEffect(() => {
    const sb = supabaseBrowser();
    if (!sb) return;
    const channel = sb
      .channel("orders-" + userId)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `user_id=eq.${userId}` },
        (payload) => {
          const updated = payload.new as Partial<Order>;
          setOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
          );
        }
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }, [userId]);

  // Resilience: re-pull statuses whenever the tab regains focus, so a missed
  // realtime event can't leave a stale status on screen.
  useEffect(() => {
    const onFocus = () => refresh();
    const onVis = () => document.visibilityState === "visible" && refresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refresh]);

  const reorder = (o: Order) => {
    const entries = o.order_items
      .filter((i) => i.menu_item_id)
      .map((i) => ({ id: i.menu_item_id as string, qty: i.qty }));
    if (entries.length) {
      addManyToCart(entries);
      router.push("/order");
    }
  };

  if (!orders.length) {
    return (
      <div className="rounded-3xl glass p-12 text-center">
        <Soup className="mx-auto h-10 w-10 text-amber" />
        <p className="mt-4 font-display text-xl font-bold text-ivory">
          No orders yet
        </p>
        <p className="mt-1 font-body text-sm text-ivory/55">
          Your past orders will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          onClick={() => refresh(true)}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-full glass-light px-4 py-2 font-body text-xs font-semibold text-ivory/80 transition-colors hover:text-ivory disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {orders.map((o) => {
        const stepIdx = STEPS.indexOf(o.status);
        return (
          <div key={o.id} className="rounded-3xl glass p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-display text-xl font-bold text-ivory">
                    {o.code}
                  </h3>
                  <span
                    className={`rounded-full px-3 py-1 font-body text-xs font-semibold uppercase ${
                      STATUS_STYLE[o.status] ?? "bg-white/8 text-ivory/50"
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 font-body text-xs text-ivory/45">
                  <Clock className="h-3 w-3" />
                  {new Date(o.created_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" · "}
                  {o.fulfilment === "dine_in" ? "Dine-in" : "Takeaway"}
                  {" · "}
                  {o.payment_status === "paid" ? "Paid" : "Pay at pickup"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-bold text-gold-grad">
                  {inr(o.total_paise / 100)}
                </p>
              </div>
            </div>

            {/* status track */}
            {o.status !== "cancelled" && (
              <div className="mt-4 flex items-center gap-1.5">
                {STEPS.map((s, i) => (
                  <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= stepIdx ? "bg-gradient-to-r from-amber to-leaf" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="mt-4 rounded-xl bg-white/[0.03] p-4">
              {o.order_items.map((i, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1 font-body text-sm text-ivory/75"
                >
                  <span>
                    {i.qty} × {i.name}
                  </span>
                  <span>{inr((i.price_paise * i.qty) / 100)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => reorder(o)}
                className="flex items-center gap-2 rounded-xl clay-gold px-5 py-2.5 font-body text-sm font-bold text-espresso-900 transition-transform hover:-translate-y-0.5"
              >
                <RotateCcw className="h-4 w-4" /> Reorder
              </button>
              {(o.status === "new" || o.status === "preparing") && (
                <button
                  onClick={() => cancel(o)}
                  disabled={cancelling === o.id}
                  className="flex items-center gap-2 rounded-xl glass-light px-5 py-2.5 font-body text-sm font-semibold text-terracotta transition-colors hover:bg-white/10 disabled:opacity-50"
                >
                  {cancelling === o.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Cancel order
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
