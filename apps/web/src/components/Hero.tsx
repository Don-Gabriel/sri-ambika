"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import MobileHero from "./MobileHero";

// Heavy 300-frame scrub only loads on mouse-driven desktops (client-only).
const ScrollHero = dynamic(() => import("./ScrollHero"), { ssr: false });

export default function Hero() {
  const [desktop, setDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (pointer: fine)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // SSR + initial paint + touch devices → lightweight hero (no 40MB preload).
  if (!desktop) return <MobileHero />;
  return <ScrollHero />;
}
