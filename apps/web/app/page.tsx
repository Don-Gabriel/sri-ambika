import Link from "next/link";
import Image from "next/image";
import {
  Leaf,
  Clock,
  Star,
  Users,
  MapPin,
  Coffee,
  Soup,
  ArrowRight,
  Flame,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Reveal from "@/components/Reveal";
import FeaturedDishes from "@/components/FeaturedDishes";
import RemotionShowcase from "@/components/RemotionShowcase";
import { RESTAURANT } from "@/lib/data";

const STATS = [
  { icon: Star, label: "Google Rating", value: "3.8★" },
  { icon: Users, label: "Reviews", value: "62+" },
  { icon: Clock, label: "Open till", value: "10 PM" },
  { icon: Leaf, label: "Pure Veg", value: "100%" },
];

export default function HomePage() {
  return (
    <main className="relative bg-espresso-900">
      <Navbar />

      {/* ░░ Hero — scroll-scrub on desktop, lightweight static on mobile ░░ */}
      <Hero />

      {/* ░░ Stat band — glassmorphism ░░ */}
      <section className="relative z-10 -mt-24 px-6">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="glass grid grid-cols-2 gap-px overflow-hidden rounded-3xl shadow-glow md:grid-cols-4">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center gap-2 bg-white/[0.02] px-6 py-8 text-center"
                >
                  <s.icon className="h-6 w-6 text-amber" />
                  <span className="font-display text-3xl font-bold text-ivory">
                    {s.value}
                  </span>
                  <span className="font-body text-xs uppercase tracking-wider text-ivory/50">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ░░ Story — bento grid ░░ */}
      <section className="relative px-6 py-28">
        <div className="absolute inset-0 bg-aurora opacity-20" />
        <div className="relative mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="font-body text-xs uppercase tracking-[0.4em] text-amber">
              Our story
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold text-ivory md:text-6xl">
              A childhood taste, <span className="text-gold-grad">plated daily.</span>
            </h2>
            <p className="mt-5 font-body text-ivory/60">
              {RESTAURANT.cuisine}. The kind of breakfast Pulianthope regulars
              have queued for across generations.
            </p>
          </Reveal>

          {/* Bento */}
          <div className="mt-14 grid auto-rows-[180px] grid-cols-2 gap-5 md:grid-cols-4">
            <Reveal className="col-span-2 row-span-2">
              <div className="grain relative h-full overflow-hidden rounded-3xl glass">
                <Image
                  src="/img/menu.webp"
                  alt="Crisp ghee-roast dosa with chutney"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover duotone-warm"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso-900 via-espresso-900/20 to-transparent" />
                <div className="absolute bottom-0 p-7">
                  <span className="inline-flex items-center gap-1.5 rounded-full glass-light px-3 py-1 font-body text-[11px] uppercase tracking-wider text-amber-glow">
                    <Flame className="h-3 w-3" /> Griddle-fresh
                  </span>
                  <h3 className="mt-3 font-display text-3xl font-bold text-ivory">
                    Fermented overnight, <br /> ribboned at dawn.
                  </h3>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.05} className="col-span-2">
              <div className="flex h-full flex-col justify-center rounded-3xl bg-gradient-to-br from-amber-deep/30 to-terracotta/20 p-7 glass-light">
                <Soup className="h-8 w-8 text-amber-glow" />
                <h3 className="mt-3 font-display text-2xl font-bold text-ivory">
                  Tiffin done right
                </h3>
                <p className="mt-1 font-body text-sm text-ivory/60">
                  Idli, uttapam, poori-channa — soft, steaming, soul-warming.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="flex h-full flex-col justify-center rounded-3xl glass p-6 text-center">
                <Coffee className="mx-auto h-7 w-7 text-amber" />
                <p className="mt-2 font-display text-lg font-bold text-ivory">
                  Degree Filter Coffee
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="flex h-full flex-col items-center justify-center rounded-3xl clay-gold p-6 text-center text-espresso-900">
                <span className="font-display text-4xl font-black">₹1–200</span>
                <p className="font-body text-xs font-semibold uppercase tracking-wider">
                  Honest pricing
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ░░ Featured menu preview ░░ */}
      <section className="relative px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-body text-xs uppercase tracking-[0.4em] text-amber">
                Fan favourites
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold text-ivory md:text-5xl">
                Straight off the <span className="text-gold-grad">griddle</span>
              </h2>
            </div>
            <Link
              href="/menu"
              className="group flex items-center gap-2 rounded-xl glass-light px-5 py-3 font-body text-sm font-semibold text-ivory transition-colors hover:bg-white/15"
            >
              Full menu
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>

          <div className="mt-12">
            <FeaturedDishes />
          </div>
        </div>
      </section>

      {/* ░░ Remotion brand reel ░░ */}
      <section className="relative px-6 py-24">
        <div className="absolute inset-0 bg-aurora opacity-25" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="font-body text-xs uppercase tracking-[0.4em] text-amber">
              Motion · powered by Remotion
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold text-ivory md:text-5xl">
              A 10-second love letter to <span className="text-gold-grad">tiffin.</span>
            </h2>
            <p className="mt-5 max-w-md font-body text-ivory/60">
              This reel is a real React video composition — animated frame by
              frame with springs and interpolation, then played right here in
              your browser. No video file, just code.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {["Remotion", "Framer Motion", "Canvas Scrub", "Glass UI"].map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-full glass-light px-4 py-2 font-body text-xs font-semibold text-amber-glow"
                  >
                    {t}
                  </span>
                )
              )}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <RemotionShowcase />
          </Reveal>
        </div>
      </section>

      {/* ░░ Reviews marquee ░░ */}
      <section className="relative py-20">
        <Reveal className="mb-10 px-6 text-center">
          <p className="font-body text-xs uppercase tracking-[0.4em] text-amber">
            Loved in Pulianthope
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-ivory md:text-5xl">
            Real words, <span className="text-gold-grad">real regulars</span>
          </h2>
        </Reveal>
        <Marquee />
      </section>

      {/* ░░ Location CTA ░░ */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="grain relative overflow-hidden rounded-[2.5rem] glass p-10 md:p-16">
              <div className="absolute inset-0 bg-aurora opacity-40" />
              <div className="relative grid gap-10 lg:grid-cols-2">
                <div>
                  <h2 className="font-display text-4xl font-bold text-ivory md:text-6xl">
                    Find your <span className="text-gold-grad">morning fix.</span>
                  </h2>
                  <div className="mt-8 space-y-4 font-body text-ivory/70">
                    <p className="flex items-start gap-3">
                      <MapPin className="mt-1 h-5 w-5 shrink-0 text-amber" />
                      {RESTAURANT.address}
                    </p>
                    <p className="flex items-center gap-3">
                      <Clock className="h-5 w-5 shrink-0 text-amber" />
                      {RESTAURANT.hours}
                    </p>
                  </div>
                  <div className="mt-9 flex flex-wrap gap-4">
                    <Link
                      href="/order"
                      className="clay rounded-2xl px-8 py-4 font-body font-bold text-white transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      Order Online
                    </Link>
                    <a
                      href="https://maps.google.com/?q=Sri+Ambika+Pulianthope+Chennai"
                      target="_blank"
                      rel="noreferrer"
                      className="glass-light rounded-2xl px-8 py-4 font-body font-semibold text-ivory transition-colors hover:bg-white/15"
                    >
                      Get Directions
                    </a>
                  </div>
                </div>
                <div className="relative min-h-[260px] overflow-hidden rounded-3xl border border-white/10">
                  <iframe
                    title="Sri Ambika location"
                    className="absolute inset-0 h-full w-full grayscale-[0.3]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps?q=Pulianthope%20High%20Road%20Chennai%20600012&output=embed"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
