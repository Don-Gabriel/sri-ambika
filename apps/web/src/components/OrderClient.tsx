"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { AnimatePresence, motion } from "framer-motion";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  CheckCircle2,
  Receipt,
  UserCircle2,
  ShieldCheck,
} from "lucide-react";
import { useStore, cartTotals } from "@/lib/store";
import { inr } from "@/lib/utils";
import { TAX_RATE } from "@/lib/data";
import { supabaseBrowser } from "@/lib/supabase";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function OrderClient() {
  const menu = useStore((s) => s.menu);
  const cart = useStore((s) => s.cart);
  const add = useStore((s) => s.addToCart);
  const dec = useStore((s) => s.decFromCart);
  const remove = useStore((s) => s.removeFromCart);
  const clear = useStore((s) => s.clearCart);

  const [authed, setAuthed] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<"Dine-in" | "Takeaway">("Takeaway");
  const [placed, setPlaced] = useState<null | { code: string }>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cloudflare Turnstile (the wrapper handles render/cleanup/reset)
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Pull the signed-in user's saved name + phone (auto-fill).
  useEffect(() => {
    const sb = supabaseBrowser();
    if (!sb) return;
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setAuthed(true);
      const { data: prof } = await sb
        .from("profiles")
        .select("full_name, phone")
        .eq("id", data.user.id)
        .single();
      const name =
        prof?.full_name ??
        (data.user.user_metadata?.full_name as string | undefined) ??
        "";
      setProfileName(name);
      if (prof?.phone) setPhone(prof.phone);
    });
  }, []);

  const { lines, subtotal, tax, total, count } = cartTotals(menu, cart);

  const phoneDigits = phone.replace(/\D/g, "");
  const phoneOk = phoneDigits.length === 0 || phoneDigits.length === 10;
  const turnstileOk = !SITE_KEY || !!token; // if not configured, don't block
  const canPlace = count > 0 && phoneOk && turnstileOk && !submitting;

  const submit = async () => {
    if (count === 0 || !phoneOk || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        items: lines.map((l) => ({ menu_item_id: l.id, qty: l.qty })),
        fulfilment: type === "Takeaway" ? "takeaway" : "dine_in",
        payment_method: "cash",
        turnstileToken: token ?? "",
      };
      if (authed && profileName.trim().length >= 2)
        payload.guest_name = profileName.trim();
      if (phoneDigits.length === 10) payload.guest_phone = phoneDigits;

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not place the order.");
      setPlaced({ code: json.code });
      clear();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not place the order.");
      // token is single-use — refresh it for a retry
      turnstileRef.current?.reset();
      setToken(null);
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Confirmation / receipt ----
  if (placed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-lg"
      >
        <div className="grain relative overflow-hidden rounded-3xl glass p-10 text-center">
          <div className="absolute inset-0 bg-aurora opacity-30" />
          <div className="relative">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full clay-gold">
              <CheckCircle2 className="h-10 w-10 text-espresso-900" />
            </div>
            <h2 className="mt-6 font-display text-4xl font-bold text-ivory">
              Order placed!
            </h2>
            <p className="mt-2 font-body text-ivory/60">
              Your token is{" "}
              <span className="font-bold text-amber-glow">{placed.code}</span>.
              The kitchen has it on the griddle.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/menu"
                className="clay rounded-2xl px-6 py-3.5 font-body font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                Order more
              </Link>
              <button
                onClick={() => {
                  setToken(null);
                  setPlaced(null);
                }}
                className="rounded-2xl glass-light px-6 py-3.5 font-body font-semibold text-ivory transition-colors hover:bg-white/15"
              >
                Back to box
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ---- Empty cart ----
  if (count === 0) {
    return (
      <div className="mx-auto max-w-md rounded-3xl glass p-12 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/5">
          <ShoppingBag className="h-9 w-9 text-amber" />
        </div>
        <h2 className="mt-6 font-display text-3xl font-bold text-ivory">
          Your box is empty
        </h2>
        <p className="mt-2 font-body text-ivory/60">
          Add a crisp dosa or a frothy filter coffee to get started.
        </p>
        <Link
          href="/menu"
          className="mt-7 inline-block rounded-2xl clay px-7 py-3.5 font-body font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      {/* Cart lines */}
      <div className="min-w-0 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-ivory">
            Your box · {count} {count === 1 ? "item" : "items"}
          </h2>
          <button
            onClick={clear}
            className="flex items-center gap-1.5 font-body text-sm text-ivory/50 transition-colors hover:text-terracotta"
          >
            <Trash2 className="h-4 w-4" /> Clear
          </button>
        </div>

        <AnimatePresence initial={false}>
          {lines.map((l) => {
            const item = menu.find((m) => m.id === l.id)!;
            const isData = item.image.startsWith("data:");
            return (
              <motion.div
                key={l.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 rounded-2xl glass p-3 sm:gap-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-14 w-14 shrink-0 rounded-xl object-cover duotone sm:h-20 sm:w-20"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-lg font-bold text-ivory">
                    {item.name}
                  </h3>
                  <p className="font-body text-sm text-amber-glow">
                    {inr(item.price)}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/8 p-1">
                  <button
                    onClick={() => dec(l.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-ivory hover:bg-white/20"
                    aria-label="Decrease"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-5 text-center font-body font-bold text-ivory">
                    {l.qty}
                  </span>
                  <button
                    onClick={() => add(l.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg clay-gold text-espresso-900 hover:scale-105"
                    aria-label="Increase"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="hidden w-20 text-right font-display text-lg font-bold text-ivory sm:block">
                  {inr(item.price * l.qty)}
                </div>
                <button
                  onClick={() => remove(l.id)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-ivory/40 hover:text-terracotta"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Summary + details — glass + neumorphism inputs */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl glass p-7">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-amber" />
            <h2 className="font-display text-2xl font-bold text-ivory">
              Bill summary
            </h2>
          </div>

          <div className="mt-5 space-y-3 font-body text-sm">
            <Row label="Subtotal" value={inr(subtotal)} />
            <Row label={`GST (${Math.round(TAX_RATE * 100)}%)`} value={inr(tax)} />
            <div className="my-3 h-px bg-white/10" />
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold text-ivory">
                Total
              </span>
              <span className="font-display text-2xl font-bold text-gold-grad">
                {inr(total)}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {/* Identity */}
            {authed ? (
              <div className="flex items-center gap-3 rounded-xl glass-light px-4 py-3">
                <UserCircle2 className="h-5 w-5 text-amber" />
                <div className="min-w-0">
                  <p className="font-body text-xs uppercase tracking-wider text-ivory/45">
                    Ordering as
                  </p>
                  <p className="truncate font-body font-semibold text-ivory">
                    {profileName || "Your account"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="rounded-xl glass-light px-4 py-3 font-body text-sm text-ivory/60">
                Ordering as guest.{" "}
                <Link href="/login" className="text-amber-glow hover:underline">
                  Sign in
                </Link>{" "}
                to save your details &amp; track orders.
              </p>
            )}

            <div>
              <label htmlFor="cust-phone" className="mb-1.5 block font-body text-xs uppercase tracking-wider text-ivory/50">
                Mobile number{" "}
                <span className="text-ivory/30">(optional, for updates)</span>
              </label>
              <input
                id="cust-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                placeholder="10-digit mobile"
                className="w-full rounded-xl neu-inset px-4 py-3 font-body text-ivory placeholder:text-ivory/30 focus:outline-none focus:ring-2 focus:ring-amber/50"
              />
              {!phoneOk && (
                <p className="mt-1.5 font-body text-xs text-terracotta">
                  Enter a 10-digit number, or leave it blank.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(["Takeaway", "Dine-in"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`rounded-xl px-4 py-3 font-body text-sm font-semibold transition-all ${
                    type === t
                      ? "clay-gold text-espresso-900"
                      : "neu text-ivory/70"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-terracotta/15 px-4 py-3 text-center font-body text-sm text-terracotta">
              {error}
            </p>
          )}

          {/* Cloudflare Turnstile — bot/spam protection */}
          {SITE_KEY && (
            <div className="mt-5 flex flex-col items-center gap-1.5">
              <Turnstile
                ref={turnstileRef}
                siteKey={SITE_KEY}
                onSuccess={(t) => setToken(t)}
                onExpire={() => setToken(null)}
                onError={() => setToken(null)}
                options={{ theme: "dark", size: "flexible" }}
              />
              {!token && (
                <p className="flex items-center gap-1.5 font-body text-xs text-ivory/40">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verifying you&apos;re
                  human…
                </p>
              )}
            </div>
          )}

          <button
            onClick={submit}
            disabled={!canPlace}
            className="mt-6 w-full rounded-2xl clay px-6 py-4 font-body text-base font-bold text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-0"
          >
            {submitting ? "Placing your order…" : `Place order · ${inr(total)}`}
          </button>
          <p className="mt-3 text-center font-body text-xs text-ivory/40">
            Pay cash at pickup. Online payment is coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-ivory/70">
      <span>{label}</span>
      <span className="font-semibold text-ivory">{value}</span>
    </div>
  );
}
