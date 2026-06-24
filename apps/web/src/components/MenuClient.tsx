"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { fetchMenu } from "@sriambika/db";
import { useStore } from "@/lib/store";
import { supabaseBrowser } from "@/lib/supabase";
import type { MenuItem } from "@/lib/types";
import DishCard from "./DishCard";

export default function MenuClient() {
  const menu = useStore((s) => s.menu);
  const setMenu = useStore((s) => s.setMenu);
  const [active, setActive] = useState<string>("All");
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    const sb = supabaseBrowser();
    if (!sb) return;
    setRefreshing(true);
    try {
      const items = await fetchMenu(sb);
      if (items.length) setMenu(items as unknown as MenuItem[]);
    } catch {
      /* keep current menu */
    }
    setRefreshing(false);
  };

  // Categories are derived from the live menu, so admin-created ones appear.
  const cats = useMemo(() => {
    const seen: string[] = [];
    for (const m of menu) {
      if (m.category && !seen.includes(m.category)) seen.push(m.category);
    }
    return ["All", ...seen];
  }, [menu]);

  const filtered =
    active === "All" ? menu : menu.filter((m) => m.category === active);

  return (
    <div>
      {/* Refresh */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-full glass-light px-4 py-2 font-body text-xs font-semibold text-ivory/80 transition-colors hover:text-ivory disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh menu
        </button>
      </div>

      {/* Filter pills */}
      <div className="sticky top-24 z-30 mb-12 flex flex-wrap justify-center gap-2">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`relative rounded-full px-5 py-2.5 font-body text-sm font-semibold transition-colors duration-200 ${
              active === c ? "text-espresso-900" : "text-ivory/70 hover:text-ivory"
            }`}
          >
            {active === c && (
              <motion.span
                layoutId="cat-pill"
                className="absolute inset-0 -z-10 rounded-full clay-gold"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            {active !== c && (
              <span className="absolute inset-0 -z-10 rounded-full glass-light" />
            )}
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <DishCard item={item} />
          </motion.div>
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <p className="py-20 text-center font-body text-ivory/50">
          Nothing in this category yet — check back soon.
        </p>
      )}
    </div>
  );
}
