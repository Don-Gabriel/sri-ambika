import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function inr(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Path to a hero scroll-scrub frame (1..300). Upscaled 1920px WebP. */
export function framePath(i: number) {
  const n = String(i).padStart(3, "0");
  return `/frames/ezgif-frame-${n}.webp`;
}

export const TOTAL_FRAMES = 300;
