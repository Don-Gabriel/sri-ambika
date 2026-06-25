import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MenuClient from "@/components/MenuClient";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Menu — Dosa, Tiffin & Filter Coffee",
  description:
    "Browse the Sri Ambika menu: masala dosa, onion uttapam, poori channa, the Special Box and degree filter coffee. Pure-veg South Indian tiffin in Pulianthope, Chennai — order online for pickup.",
  alternates: { canonical: "/menu" },
  openGraph: {
    title: "Menu — Dosa, Tiffin & Filter Coffee · Sri Ambika",
    description:
      "Masala dosa, onion uttapam, poori channa and degree filter coffee. Pure-veg South Indian tiffin in Pulianthope, Chennai.",
    url: "/menu",
  },
};

export default function MenuPage() {
  return (
    <main className="bg-espresso-900">
      <Navbar />

      {/* Hero — parallax menu image (otherpics/menu.png) */}
      <section className="relative h-[68vh] min-h-[460px] overflow-hidden">
        <Image
          src="/img/menu.webp"
          alt="Crisp dosa with chutney and sambar"
          fill
          priority
          sizes="100vw"
          className="object-cover duotone-warm"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-espresso-900/70 via-espresso-900/30 to-espresso-900" />
        <div className="grain absolute inset-0" />
        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full glass-light px-4 py-1.5 font-body text-xs uppercase tracking-[0.3em] text-leaf">
              <Leaf className="h-3.5 w-3.5" /> Pure Veg Kitchen
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 font-display text-6xl font-black text-ivory md:text-8xl">
              The <span className="text-gold-grad">Menu</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-4 max-w-xl font-body text-ivory/70">
              Tap a dish to add it to your box. Sold-out items dim out in
              real-time as our kitchen flips availability.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <Link
              href="/order"
              className="group mt-7 inline-flex items-center gap-2 rounded-2xl clay px-7 py-3.5 font-body font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              Go to your box
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="relative px-6 py-16">
        <div className="absolute inset-0 bg-aurora opacity-15" />
        <div className="relative mx-auto max-w-6xl">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-ivory md:text-4xl">
              South Indian tiffin, <span className="text-gold-grad">made fresh</span>
            </h2>
            <p className="mt-4 font-body text-ivory/60">
              Every plate at Sri Ambika starts with stone-ground batter
              fermented overnight and griddled to order. From the crisp masala
              dosa and fluffy onion uttapam to puffed poori channa and our
              loaded Special Box, the menu is built around the pure-veg
              breakfast Pulianthope has queued for across generations — finished,
              of course, with a tumbler of degree filter coffee. Prices stay
              honest, between ₹1 and ₹200, and everything is available for
              pickup.
            </p>
          </Reveal>
          <MenuClient />
        </div>
      </section>

      <Footer />
    </main>
  );
}
