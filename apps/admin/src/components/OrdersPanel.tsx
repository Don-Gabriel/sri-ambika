"use client";

import { useMemo, useState } from "react";
import { ReceiptText, Search, Check } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import Toggle from "./Toggle";
import OrderCard, { customerName, customerPhone } from "./OrderCard";
import type { OrderWithItems } from "./types";

const STAGES = ["new", "preparing", "ready"] as const;

export default function OrdersPanel({
  orders,
  setOrders,
}: {
  orders: OrderWithItems[];
  setOrders: React.Dispatch<React.SetStateAction<OrderWithItems[]>>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [stage, setStage] = useState<"all" | (typeof STAGES)[number]>("all");
  const [type, setType] = useState<"all" | "takeaway" | "dine_in">("all");
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  const patch = (id: string, p: Partial<OrderWithItems>) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...p } : o)));

  const update = async (id: string, p: Partial<OrderWithItems>) => {
    const sb = supabaseBrowser();
    if (!sb) return;
    setBusy(id);
    setError(null);
    const prev = orders.find((o) => o.id === id);
    patch(id, p);
    // .select() lets us confirm the row actually changed — a 0-row result means
    // the write was silently rejected (e.g. session lost), not a real success.
    const { data, error } = await sb.from("orders").update(p).eq("id", id).select("id");
    setBusy(null);
    if (error || !data || data.length === 0) {
      if (prev) patch(id, prev);
      setError(
        error?.message ??
          "Couldn't save that change — your session may have expired. Please sign out and back in."
      );
    }
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (stage !== "all" && o.status !== stage) return false;
      if (type !== "all" && o.fulfilment !== type) return false;
      if (term) {
        const hay = `${o.code} ${customerName(o)} ${customerPhone(o) ?? ""}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [orders, stage, type, q]);

  return (
    <div>
      {/* filters */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl neu-inset px-3 py-2">
          <Search className="h-4 w-4 text-ivory/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search code / name / phone"
            className="w-44 bg-transparent font-body text-sm text-ivory placeholder:text-ivory/30 focus:outline-none sm:w-56"
          />
        </div>
        <Pills
          value={stage}
          onChange={(v) => setStage(v as typeof stage)}
          options={[["all", "All"], ["new", "New"], ["preparing", "Preparing"], ["ready", "Ready"]]}
        />
        <Pills
          value={type}
          onChange={(v) => setType(v as typeof type)}
          options={[["all", "All types"], ["takeaway", "Takeaway"], ["dine_in", "Dine-in"]]}
        />
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-terracotta/15 px-4 py-3 font-body text-sm text-terracotta">
          {error}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-3xl neu p-12 text-center">
          <ReceiptText className="mx-auto h-10 w-10 text-amber" />
          <p className="mt-4 font-display text-xl font-bold text-ivory">No active orders</p>
          <p className="mt-1 font-body text-sm text-ivory/50">
            New orders appear here live as customers place them.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => (
            <OrderCard key={o.id} order={o}>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {STAGES.map((s) => (
                  <button
                    key={s}
                    disabled={busy === o.id}
                    onClick={() => update(o.id, { status: s })}
                    className={`rounded-lg px-3 py-1.5 font-body text-xs font-semibold capitalize transition-all disabled:opacity-50 ${
                      o.status === s ? "clay-gold text-espresso-900" : "neu text-ivory/60"
                    }`}
                  >
                    {s}
                  </button>
                ))}
                <button
                  disabled={busy === o.id}
                  onClick={() => update(o.id, { status: "completed" })}
                  className="flex items-center gap-1 rounded-lg clay px-3 py-1.5 font-body text-xs font-bold text-white transition-all disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" /> Mark completed
                </button>

                <div className="ml-auto flex items-center gap-2">
                  <span
                    className={`font-body text-xs font-semibold ${
                      o.payment_status === "paid" ? "text-leaf" : "text-terracotta"
                    }`}
                  >
                    {o.payment_status === "paid" ? "Paid" : "Unpaid"}
                  </span>
                  <Toggle
                    on={o.payment_status === "paid"}
                    onChange={() =>
                      update(o.id, {
                        payment_status: o.payment_status === "paid" ? "pending" : "paid",
                      })
                    }
                    label="Paid"
                  />
                </div>
              </div>
            </OrderCard>
          ))}
        </div>
      )}
    </div>
  );
}

function Pills({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`rounded-lg px-3 py-2 font-body text-xs font-semibold transition-all ${
            value === v ? "clay-gold text-espresso-900" : "neu text-ivory/60"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
