"use client";

import { REVIEWS } from "@/lib/data";
import StarRating from "./StarRating";

/** Infinite CSS marquee of Google reviews (glass cards). */
export default function Marquee() {
  const row = [...REVIEWS, ...REVIEWS];
  return (
    <div className="relative overflow-hidden py-2">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-espresso-900 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-espresso-900 to-transparent" />
      <div className="flex w-max animate-marquee gap-5 hover:[animation-play-state:paused]">
        {row.map((r, i) => (
          <figure
            key={i}
            className="glass-light w-[330px] shrink-0 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full clay-gold font-display font-bold text-espresso-900">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <figcaption className="font-body text-sm font-semibold text-ivory">
                    {r.name}
                  </figcaption>
                  <p className="font-body text-[11px] text-ivory/50">{r.meta}</p>
                </div>
              </div>
              <StarRating value={r.stars} />
            </div>
            <blockquote className="mt-4 font-body text-sm leading-relaxed text-ivory/75">
              “{r.text}”
            </blockquote>
            <p className="mt-3 font-body text-[11px] uppercase tracking-wider text-ivory/40">
              {r.when}
            </p>
          </figure>
        ))}
      </div>
    </div>
  );
}
