"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { framePath, TOTAL_FRAMES } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

/**
 * Apple-style scroll-scrubbing canvas hero.
 * Technique stack: scroll-scrub canvas + kinetic typography + film grain + aurora.
 */
export default function ScrollHero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  // Preload every frame.
  useEffect(() => {
    let mounted = true;
    let count = 0;
    const imgs: HTMLImageElement[] = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = framePath(i);
      img.onload = () => {
        if (!mounted) return;
        count++;
        setLoaded(count);
        if (count >= TOTAL_FRAMES) setReady(true);
      };
      img.onerror = () => {
        if (!mounted) return;
        count++;
        setLoaded(count);
        if (count >= TOTAL_FRAMES) setReady(true);
      };
      imgs.push(img);
    }
    imagesRef.current = imgs;
    return () => {
      mounted = false;
    };
  }, []);

  const draw = (frameIndex: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const idx = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.round(frameIndex))
    );
    const img = imagesRef.current[idx];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    if (canvas.width !== cw * dpr || canvas.height !== ch * dpr) {
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // cover-fit
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = cw / ch;
    let dw = cw;
    let dh = ch;
    if (ir > cr) {
      dh = ch;
      dw = ch * ir;
    } else {
      dw = cw;
      dh = cw / ir;
    }
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  };

  const frame = useTransform(scrollYProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

  useMotionValueEvent(frame, "change", (v) => draw(v));

  // First paint + resize handling.
  useEffect(() => {
    if (!ready) return;
    draw(frame.get());
    const onResize = () => draw(frame.get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Overlay text transforms (kinetic reveal across the scroll).
  const introOpacity = useTransform(scrollYProgress, [0, 0.12, 0.2], [1, 1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.2], [0, -60]);
  const midOpacity = useTransform(
    scrollYProgress,
    [0.28, 0.4, 0.55, 0.66],
    [0, 1, 1, 0]
  );
  const endOpacity = useTransform(scrollYProgress, [0.78, 0.9], [0, 1]);
  const endScale = useTransform(scrollYProgress, [0.78, 1], [0.92, 1]);

  const pct = Math.round((loaded / TOTAL_FRAMES) * 100);

  return (
    <section ref={wrapRef} className="relative h-[460vh] bg-espresso-900">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Canvas scrub */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full duotone-warm"
        />
        {/* cinematic vignettes */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-espresso-900/70 via-transparent to-espresso-900" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,transparent_40%,rgba(14,9,8,0.85)_100%)]" />
        <div className="grain pointer-events-none absolute inset-0" />

        {/* Loader */}
        {!ready && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-espresso-900">
            <div className="font-display text-5xl text-gold-grad">Sri Ambika</div>
            <div className="mt-6 h-[3px] w-56 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-amber to-terracotta transition-all duration-200"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-3 font-body text-xs uppercase tracking-[0.3em] text-ivory/50">
              Plating the experience · {pct}%
            </div>
          </div>
        )}

        {/* Kinetic overlay text */}
        <div className="absolute inset-0 z-20 flex items-center justify-center px-6 text-center">
          <motion.div
            style={{ opacity: introOpacity, y: introY }}
            className="absolute"
          >
            <p className="mb-4 font-body text-xs uppercase tracking-[0.5em] text-amber-glow">
              Pulianthope · Chennai · Est. morning rush
            </p>
            <h1 className="font-display text-6xl font-black leading-[0.95] text-ivory sm:text-7xl md:text-[8rem]">
              Sri <span className="text-gold-grad">Ambika</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl font-body text-base text-ivory/70 md:text-lg">
              Watch a humble corner plot rise into Chennai&apos;s tiffin
              landmark — scroll to plate the story.
            </p>
          </motion.div>

          <motion.div style={{ opacity: midOpacity }} className="absolute max-w-3xl">
            <h2 className="font-display text-4xl font-bold leading-tight text-ivory md:text-6xl">
              From stone-ground batter to{" "}
              <span className="text-gold-grad">griddle gold.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-body text-ivory/70">
              Three decades of fermenting, folding and frothing — built one
              davara-tumbler of filter coffee at a time.
            </p>
          </motion.div>

          <motion.div
            style={{ opacity: endOpacity, scale: endScale }}
            className="absolute max-w-3xl"
          >
            <p className="mb-3 font-body text-xs uppercase tracking-[0.5em] text-amber-glow">
              Now serving
            </p>
            <h2 className="font-display text-5xl font-black leading-tight text-ivory md:text-7xl">
              A landmark on{" "}
              <span className="text-gold-grad">every plate.</span>
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="/menu"
                className="clay-gold rounded-2xl px-8 py-4 font-body font-bold text-espresso-900 transition-transform duration-200 hover:-translate-y-0.5"
              >
                Explore the Menu
              </a>
              <a
                href="/order"
                className="glass-light rounded-2xl px-8 py-4 font-body font-semibold text-ivory transition-colors duration-200 hover:bg-white/15"
              >
                Order Now
              </a>
            </div>
          </motion.div>
        </div>

        {/* scroll hint */}
        <motion.div
          style={{ opacity: introOpacity }}
          className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-ivory/60"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="font-body text-[10px] uppercase tracking-[0.3em]">
              Scroll
            </span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
