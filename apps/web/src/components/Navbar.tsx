"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingBag, Menu as MenuIcon, X, User, LogIn } from "lucide-react";
import { useStore, cartTotals } from "@/lib/store";
import { cn } from "@/lib/utils";
import { supabaseBrowser } from "@/lib/supabase";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/order", label: "Order" },
];

export default function Navbar() {
  const pathname = usePathname();
  const menu = useStore((s) => s.menu);
  const cart = useStore((s) => s.cart);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const sb = supabaseBrowser();
    if (!sb) return;
    sb.auth.getUser().then(({ data }) => setAuthed(!!data.user));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) =>
      setAuthed(!!session?.user)
    );
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const count = mounted ? cartTotals(menu, cart).count : 0;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav
        className={cn(
          "pointer-events-auto flex w-full max-w-5xl items-center justify-between rounded-2xl px-5 py-3 transition-all duration-300",
          scrolled ? "glass shadow-glow" : "glass-light"
        )}
      >
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl clay-gold font-display text-lg font-black text-espresso-900">
            S
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-ivory">
            Sri Ambika
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-4 py-2 font-body text-sm font-medium transition-colors duration-200",
                pathname === l.href
                  ? "bg-white/10 text-amber-glow"
                  : "text-ivory/70 hover:text-ivory"
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={authed ? "/account" : "/login"}
            className="hidden items-center gap-2 rounded-xl bg-white/8 px-3 py-2 font-body text-sm font-semibold text-ivory transition-colors hover:bg-white/15 sm:flex"
          >
            {authed ? <User className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            {authed ? "Account" : "Login"}
          </Link>
          <Link
            href="/order"
            className="relative flex items-center gap-2 rounded-xl bg-white/8 px-3 py-2 font-body text-sm font-semibold text-ivory transition-colors hover:bg-white/15"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-terracotta px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/8 text-ivory md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="pointer-events-auto absolute top-20 w-[92%] max-w-5xl rounded-2xl glass p-3 md:hidden">
          {[...LINKS, { href: authed ? "/account" : "/login", label: authed ? "Account" : "Login" }].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-4 py-3 font-body text-sm text-ivory/80 hover:bg-white/10"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
