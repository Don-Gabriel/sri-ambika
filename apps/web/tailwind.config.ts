import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sri Ambika brand tokens (design system: UI/UX Pro Max)
        espresso: {
          DEFAULT: "#1A1110",
          900: "#0E0908",
          800: "#1A1110",
          700: "#2A1C19",
          600: "#3D2A25",
        },
        amber: {
          DEFAULT: "#E8A33D",
          glow: "#F6C667",
          deep: "#C77F22",
        },
        leaf: "#3A7D44",
        terracotta: "#C0392B",
        ivory: "#FBF6EC",
        cream: "#F3E9D6",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-karla)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "aurora":
          "radial-gradient(60% 60% at 20% 20%, rgba(232,163,61,0.35) 0%, transparent 60%), radial-gradient(50% 50% at 85% 30%, rgba(192,57,43,0.28) 0%, transparent 60%), radial-gradient(60% 60% at 60% 90%, rgba(58,125,68,0.25) 0%, transparent 60%)",
        "grain":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        // Neumorphism (soft UI) tokens for the admin panel
        "neu": "8px 8px 18px rgba(0,0,0,0.45), -8px -8px 18px rgba(255,255,255,0.04)",
        "neu-inset": "inset 6px 6px 12px rgba(0,0,0,0.5), inset -6px -6px 12px rgba(255,255,255,0.05)",
        // Claymorphism CTA
        "clay": "0 14px 30px rgba(192,57,43,0.35), inset 0 -6px 12px rgba(0,0,0,0.25), inset 0 6px 10px rgba(255,255,255,0.25)",
        "glow": "0 0 50px rgba(232,163,61,0.45)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        marquee: "marquee 38s linear infinite",
        floaty: "floaty 6s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
