"use client";

import { ReactNode, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * 3D tilt + spotlight cursor-follow card.
 * Techniques: 3D tilt, spotlight (radial cursor glow).
 */
export default function TiltCard({
  children,
  className,
  glow = "rgba(232,163,61,0.25)",
  max = 8,
}: {
  children: ReactNode;
  className?: string;
  glow?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [spot, setSpot] = useState({ x: 50, y: 50, on: false });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * max * 2;
    const ry = (px - 0.5) * max * 2;
    setStyle({ transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)` });
    setSpot({ x: px * 100, y: py * 100, on: true });
  };

  const reset = () => {
    setStyle({ transform: "perspective(900px) rotateX(0) rotateY(0)" });
    setSpot((s) => ({ ...s, on: false }));
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={style}
      className={cn(
        "relative transition-transform duration-200 ease-out will-change-transform",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: spot.on ? 1 : 0,
          background: `radial-gradient(420px circle at ${spot.x}% ${spot.y}%, ${glow}, transparent 45%)`,
        }}
      />
      {children}
    </div>
  );
}
