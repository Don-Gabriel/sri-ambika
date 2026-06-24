"use client";

import { useStore } from "@/lib/store";
import DishCard from "./DishCard";
import Reveal from "./Reveal";

export default function FeaturedDishes() {
  const menu = useStore((s) => s.menu);
  const featured = menu.slice(0, 3);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {featured.map((item, i) => (
        <Reveal key={item.id} delay={i * 0.08}>
          <DishCard item={item} />
        </Reveal>
      ))}
    </div>
  );
}
