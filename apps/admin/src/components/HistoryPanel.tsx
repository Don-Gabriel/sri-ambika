"use client";

import { useMemo, useState } from "react";
import { History as HistoryIcon, Search } from "lucide-react";
import OrderCard, { customerName, customerPhone } from "./OrderCard";
import { HISTORY_STATUSES, type OrderWithItems } from "./types";

export default function HistoryPanel({ orders }: { orders: OrderWithItems[] }) {
  const [status, setStatus] = useState<"all" | "completed" | "cancelled">("all");
  const [range, setRange] = useState<"all" | "today" | "7" | "30">("all");
  const [q, setQ] = useState("");

  const history = useMemo(() => {
    const term = q.trim().toLowerCase();
    const now = Date.now();
    const within: Record<string, number> = { today: 1, "7": 7, "30": 30, all: Infinity };
    const days = within[range];
    return orders
      .filter((o) => HISTORY_STATUSES.includes(o.status))
      .filter((o) => (status === "all" ? true : o.status === status))
      .filter((o) => {
        if (days === Infinity) return true;
        if (range === "today") return new Date(o.created_at).toDateString() === new Date(now).toDateString();
        return now - new Date(o.created_at).getTime() <= days * 86400000;
      })
      .filter((o) => {
        if (!term) return true;
        return `${o.code} ${customerName(o)} ${customerPhone(o) ?? ""}`.toLowerCase().includes(term);
      });
  }, [orders, status, range, q]);

  return (
    <div>
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
          value={status}
          onChange={(v) => setStatus(v as typeof status)}
          options={[["all", "All"], ["completed", "Completed"], ["cancelled", "Cancelled"]]}
        />
        <Pills
          value={range}
          onChange={(v) => setRange(v as typeof range)}
          options={[["today", "Today"], ["7", "7 days"], ["30", "30 days"], ["all", "All time"]]}
        />
      </div>

      {history.length === 0 ? (
        <div className="rounded-3xl neu p-12 text-center">
          <HistoryIcon className="mx-auto h-10 w-10 text-amber" />
          <p className="mt-4 font-display text-xl font-bold text-ivory">Nothing here yet</p>
          <p className="mt-1 font-body text-sm text-ivory/50">
            Completed and cancelled orders are archived here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((o) => (
            <OrderCard key={o.id} order={o} />
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
