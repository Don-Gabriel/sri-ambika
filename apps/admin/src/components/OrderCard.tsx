"use client";

import { ReactNode } from "react";
import { Clock } from "lucide-react";
import { formatPaise } from "@sriambika/db";
import type { OrderWithItems } from "./types";

const STATUS_COLOR: Record<string, string> = {
  new: "text-amber-glow",
  preparing: "text-amber",
  ready: "text-leaf",
  completed: "text-ivory/40",
  cancelled: "text-terracotta",
};

export function customerName(o: OrderWithItems) {
  return o.guest_name ?? o.profiles?.full_name ?? "Customer";
}
export function customerPhone(o: OrderWithItems) {
  return o.guest_phone ?? o.profiles?.phone ?? null;
}

export default function OrderCard({
  order: o,
  children,
}: {
  order: OrderWithItems;
  children?: ReactNode;
}) {
  const phone = customerPhone(o);
  return (
    <div className="rounded-2xl glass p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-xl font-bold text-ivory">{o.code}</h3>
            <span
              className={`rounded-full bg-white/8 px-3 py-1 font-body text-xs font-semibold uppercase ${STATUS_COLOR[o.status]}`}
            >
              {o.status}
            </span>
            <span className="rounded-full glass-light px-3 py-1 font-body text-xs font-semibold uppercase text-ivory/70">
              {o.fulfilment === "dine_in" ? "Dine-in" : "Takeaway"}
            </span>
          </div>
          <p className="mt-1.5 font-body text-sm text-ivory/60">
            {customerName(o)}
            {phone ? ` · ${phone}` : ""}
          </p>
          <p className="mt-0.5 flex items-center gap-1 font-body text-[11px] text-ivory/40">
            <Clock className="h-3 w-3" />
            {new Date(o.created_at).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-bold text-gold-grad">
            {formatPaise(o.total_paise)}
          </p>
          <p className="font-body text-[11px] text-ivory/40">
            incl. {formatPaise(o.tax_paise)} GST · {o.payment_method}
            {o.payment_status === "paid" ? " · paid" : ""}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl neu-inset p-4">
        {o.order_items.map((l) => (
          <div
            key={l.id}
            className="flex items-center justify-between py-1 font-body text-sm text-ivory/75"
          >
            <span>
              {l.qty} × {l.name}
            </span>
            <span>{formatPaise(l.price_paise * l.qty)}</span>
          </div>
        ))}
      </div>

      {children}
    </div>
  );
}
