import Link from "next/link";
import { RESTAURANT } from "@/lib/data";
import { MapPin, Clock, Leaf, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-espresso-900">
      <div className="absolute inset-0 bg-aurora opacity-30" />
      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl clay-gold font-display text-xl font-black text-espresso-900">
                S
              </span>
              <span className="font-display text-2xl font-bold text-ivory">
                {RESTAURANT.name}
              </span>
            </div>
            <p className="mt-4 max-w-sm font-body text-sm leading-relaxed text-ivory/60">
              {RESTAURANT.tagline}. A pure-veg tiffin house plating Chennai
              mornings, one dosa at a time.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full glass-light px-4 py-2 font-body text-xs text-leaf">
              <Leaf className="h-4 w-4" /> 100% Pure Vegetarian
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-bold text-amber-glow">Visit</h4>
            <ul className="mt-4 space-y-3 font-body text-sm text-ivory/65">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                <span>{RESTAURANT.address}</span>
              </li>
              <li className="flex gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                <span>{RESTAURANT.hours}</span>
              </li>
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                <span>Walk-in · Does not accept reservations</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-bold text-amber-glow">Explore</h4>
            <ul className="mt-4 space-y-2 font-body text-sm">
              {[
                ["/", "Home"],
                ["/menu", "Menu"],
                ["/order", "Order Online"],
                ["/account", "My Account"],
              ].map(([h, l]) => (
                <li key={h}>
                  <Link
                    href={h}
                    className="text-ivory/65 transition-colors hover:text-amber-glow"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 font-body text-xs text-ivory/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Sri Ambika · Pulianthope, Chennai.</p>
          <p>Crafted with cinematic scroll, glass &amp; grain.</p>
        </div>
      </div>
    </footer>
  );
}
