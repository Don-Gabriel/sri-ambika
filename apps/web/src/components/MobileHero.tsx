"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

/**
 * Lightweight hero for touch devices — a single static frame instead of the
 * 300-frame scroll-scrub, so phones don't download ~40MB.
 */
export default function MobileHero() {
  return (
    <section className="relative h-[100svh] min-h-[560px] overflow-hidden bg-espresso-900">
      <Image
        src="/frames/ezgif-frame-210.webp"
        alt="Sri Ambika restaurant at golden hour"
        fill
        priority
        sizes="100vw"
        className="object-cover duotone-warm"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-espresso-900/70 via-transparent to-espresso-900" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,transparent_40%,rgba(14,9,8,0.85)_100%)]" />
      <div className="grain pointer-events-none absolute inset-0" />

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 font-body text-[10px] uppercase tracking-[0.4em] text-amber-glow"
        >
          Pulianthope · Chennai
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="font-display text-6xl font-black leading-[0.95] text-ivory"
        >
          Sri <span className="text-gold-grad">Ambika</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="mx-auto mt-4 max-w-sm font-body text-base text-ivory/70"
        >
          Chennai&apos;s tiffin temple — crisp dosa, fluffy uttapam and degree
          filter coffee, since the morning rush.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-8 flex w-full max-w-xs flex-col gap-3"
        >
          <a
            href="/menu"
            className="clay-gold rounded-2xl px-8 py-4 font-body font-bold text-espresso-900"
          >
            Explore the Menu
          </a>
          <a
            href="/order"
            className="glass-light rounded-2xl px-8 py-4 font-body font-semibold text-ivory"
          >
            Order Now
          </a>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-ivory/50">
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </div>
    </section>
  );
}
