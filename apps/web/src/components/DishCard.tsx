"use client";

import Image from "next/image";
import { Flame, Plus, Star, Minus } from "lucide-react";
import { MenuItem } from "@/lib/types";
import { useStore } from "@/lib/store";
import { inr } from "@/lib/utils";
import TiltCard from "./TiltCard";

export default function DishCard({ item }: { item: MenuItem }) {
  const cart = useStore((s) => s.cart);
  const add = useStore((s) => s.addToCart);
  const dec = useStore((s) => s.decFromCart);
  const qty = cart[item.id] ?? 0;
  const isData = item.image.startsWith("data:");

  return (
    <TiltCard className="group h-full rounded-3xl" max={6}>
      <div className="glass relative flex h-full flex-col overflow-hidden rounded-3xl">
        {/* image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {isData ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover duotone transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width:768px) 100vw, 33vw"
              className="object-cover duotone transition-transform duration-700 group-hover:scale-110"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/85 via-transparent to-transparent" />

          {/* badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {item.bestseller && (
              <span className="rounded-full clay-gold px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-espresso-900">
                Bestseller
              </span>
            )}
            {item.spicy && (
              <span className="flex items-center gap-1 rounded-full bg-terracotta/90 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                <Flame className="h-3 w-3" /> Spicy
              </span>
            )}
          </div>
          <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-sm border-2 border-leaf bg-espresso-900/70">
            <span className="h-2.5 w-2.5 rounded-full bg-leaf" />
          </span>

          {!item.available && (
            <div className="absolute inset-0 grid place-items-center bg-espresso-900/75 backdrop-blur-sm">
              <span className="rounded-full glass-light px-4 py-2 font-body text-sm font-semibold text-ivory">
                Sold out today
              </span>
            </div>
          )}
        </div>

        {/* body */}
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-xl font-bold text-ivory">
                {item.name}
              </h3>
              {item.tamilName && (
                <p className="font-body text-xs text-amber-glow/80">
                  {item.tamilName}
                </p>
              )}
            </div>
            {item.rating && (
              <span className="flex items-center gap-1 rounded-full bg-white/8 px-2 py-1 font-body text-xs text-amber-glow">
                <Star className="h-3 w-3 fill-amber text-amber" />
                {item.rating}
              </span>
            )}
          </div>

          <p className="mt-2 flex-1 font-body text-sm leading-relaxed text-ivory/60">
            {item.description}
          </p>

          <div className="mt-5 flex items-center justify-between">
            <span className="font-display text-2xl font-bold text-gold-grad">
              {inr(item.price)}
            </span>

            {qty === 0 ? (
              <button
                disabled={!item.available}
                onClick={() => add(item.id)}
                className="flex items-center gap-1.5 rounded-xl clay px-4 py-2.5 font-body text-sm font-bold text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:saturate-0"
              >
                <Plus className="h-4 w-4" /> Add
              </button>
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-white/8 p-1">
                <button
                  onClick={() => dec(item.id)}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-ivory transition-colors hover:bg-white/20"
                  aria-label="Decrease"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-5 text-center font-body font-bold text-ivory">
                  {qty}
                </span>
                <button
                  onClick={() => add(item.id)}
                  className="grid h-8 w-8 place-items-center rounded-lg clay-gold text-espresso-900 transition-transform hover:scale-105"
                  aria-label="Increase"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </TiltCard>
  );
}
