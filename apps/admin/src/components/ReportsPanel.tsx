"use client";

import { useMemo, useState } from "react";
import { FileDown, IndianRupee, CheckCircle2, XCircle, ReceiptText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatPaise } from "@sriambika/db";
import type { OrderWithItems } from "./types";

type Preset = "today" | "month" | "custom";

function rangeFor(preset: Preset, from: string, to: string): [number, number] {
  const now = new Date();
  if (preset === "today") {
    const s = new Date(now); s.setHours(0, 0, 0, 0);
    return [s.getTime(), now.getTime()];
  }
  if (preset === "month") {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    return [s.getTime(), now.getTime()];
  }
  const s = from ? new Date(from + "T00:00:00").getTime() : 0;
  const e = to ? new Date(to + "T23:59:59").getTime() : now.getTime();
  return [s, e];
}

const rs = (paise: number) => "Rs " + Math.round(paise / 100).toLocaleString("en-IN");

export default function ReportsPanel({
  orders,
  ownerName,
}: {
  orders: OrderWithItems[];
  ownerName: string;
}) {
  const [preset, setPreset] = useState<Preset>("today");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [start, end] = rangeFor(preset, from, to);

  const report = useMemo(() => {
    const inRange = orders.filter((o) => {
      const t = new Date(o.created_at).getTime();
      return t >= start && t <= end;
    });
    const completed = inRange.filter((o) => o.status === "completed");
    const cancelled = inRange.filter((o) => o.status === "cancelled");
    const revenue = completed.reduce((a, o) => a + o.total_paise, 0);

    const items = new Map<string, { qty: number; revenue: number }>();
    for (const o of completed) {
      for (const l of o.order_items) {
        const cur = items.get(l.name) ?? { qty: 0, revenue: 0 };
        cur.qty += l.qty;
        cur.revenue += l.price_paise * l.qty;
        items.set(l.name, cur);
      }
    }
    const breakdown = [...items.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      total: inRange.length,
      completed: completed.length,
      cancelled: cancelled.length,
      revenue,
      avg: completed.length ? Math.round(revenue / completed.length) : 0,
      breakdown,
    };
  }, [orders, start, end]);

  const rangeLabel =
    preset === "today" ? "Today" : preset === "month" ? "This month" : `${from || "…"} → ${to || "…"}`;

  const exportPDF = () => {
    const doc = new jsPDF();
    const W = doc.internal.pageSize.getWidth();

    // header band
    doc.setFillColor(26, 17, 16);
    doc.rect(0, 0, W, 30, "F");
    doc.setTextColor(232, 163, 61);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Sri Ambika", 14, 14);
    doc.setTextColor(251, 246, 236);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Sales Report", 14, 22);
    doc.setFontSize(9);
    doc.text(`Range: ${rangeLabel}`, W - 14, 14, { align: "right" });
    doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, W - 14, 20, { align: "right" });
    doc.text(`By: ${ownerName}`, W - 14, 26, { align: "right" });

    // summary table
    autoTable(doc, {
      startY: 38,
      head: [["Metric", "Value"]],
      body: [
        ["Total orders", String(report.total)],
        ["Completed", String(report.completed)],
        ["Cancelled", String(report.cancelled)],
        ["Revenue (completed)", rs(report.revenue)],
        ["Average order value", rs(report.avg)],
      ],
      theme: "grid",
      headStyles: { fillColor: [192, 57, 43], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 1: { halign: "right" } },
      margin: { left: 14, right: 14 },
    });

    // item breakdown
    const afterSummary = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.setTextColor(26, 17, 16);
    doc.setFont("helvetica", "bold");
    doc.text("Item breakdown", 14, afterSummary + 10);

    autoTable(doc, {
      startY: afterSummary + 14,
      head: [["Item", "Qty sold", "Revenue"]],
      body: report.breakdown.length
        ? report.breakdown.map((b) => [b.name, String(b.qty), rs(b.revenue)])
        : [["No completed orders in range", "", ""]],
      theme: "striped",
      headStyles: { fillColor: [26, 17, 16], textColor: [232, 163, 61], fontStyle: "bold" },
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
      margin: { left: 14, right: 14 },
    });

    const fname = `sri-ambika-report-${preset}-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fname);
  };

  const cards = [
    { icon: ReceiptText, label: "Total orders", value: String(report.total) },
    { icon: CheckCircle2, label: "Completed", value: String(report.completed) },
    { icon: XCircle, label: "Cancelled", value: String(report.cancelled) },
    { icon: IndianRupee, label: "Revenue", value: formatPaise(report.revenue) },
  ];

  return (
    <div>
      {/* range controls */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {([["today", "Today"], ["month", "This month"], ["custom", "Custom"]] as [Preset, string][]).map(
          ([p, label]) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`rounded-xl px-4 py-2.5 font-body text-sm font-semibold transition-all ${
                preset === p ? "clay-gold text-espresso-900" : "neu text-ivory/60"
              }`}
            >
              {label}
            </button>
          )
        )}
        {preset === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-xl neu-inset px-3 py-2.5 font-body text-sm text-ivory focus:outline-none"
            />
            <span className="text-ivory/40">→</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-xl neu-inset px-3 py-2.5 font-body text-sm text-ivory focus:outline-none"
            />
          </div>
        )}
        <button
          onClick={exportPDF}
          className="ml-auto flex items-center gap-2 rounded-xl clay px-4 py-2.5 font-body text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          <FileDown className="h-4 w-4" /> Export PDF
        </button>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl neu p-5">
            <c.icon className="h-5 w-5 text-amber" />
            <p className="mt-2 font-display text-2xl font-bold text-ivory">{c.value}</p>
            <p className="font-body text-[11px] uppercase tracking-wider text-ivory/45">
              {c.label}
            </p>
          </div>
        ))}
      </div>

      {/* item breakdown */}
      <div className="mt-6 rounded-2xl glass p-6">
        <h3 className="font-display text-xl font-bold text-ivory">Item breakdown</h3>
        <p className="font-body text-xs text-ivory/45">
          From completed orders · {rangeLabel}
          {report.avg > 0 ? ` · avg ${formatPaise(report.avg)}/order` : ""}
        </p>
        <div className="mt-4 overflow-hidden rounded-xl neu-inset">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5 font-body text-[11px] uppercase tracking-wider text-ivory/40">
            <span>Item</span>
            <span className="flex gap-8">
              <span className="w-14 text-right">Qty</span>
              <span className="w-20 text-right">Revenue</span>
            </span>
          </div>
          {report.breakdown.length ? (
            report.breakdown.map((b) => (
              <div
                key={b.name}
                className="flex items-center justify-between px-4 py-2.5 font-body text-sm text-ivory/80"
              >
                <span>{b.name}</span>
                <span className="flex gap-8">
                  <span className="w-14 text-right">{b.qty}</span>
                  <span className="w-20 text-right text-amber-glow">{formatPaise(b.revenue)}</span>
                </span>
              </div>
            ))
          ) : (
            <p className="px-4 py-6 text-center font-body text-sm text-ivory/40">
              No completed orders in this range yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
