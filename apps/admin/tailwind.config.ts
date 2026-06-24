import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        espresso: { DEFAULT: "#1A1110", 900: "#0E0908", 800: "#1A1110", 700: "#2A1C19", 600: "#3D2A25" },
        amber: { DEFAULT: "#E8A33D", glow: "#F6C667", deep: "#C77F22" },
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
        aurora:
          "radial-gradient(60% 60% at 20% 20%, rgba(232,163,61,0.30) 0%, transparent 60%), radial-gradient(50% 50% at 85% 30%, rgba(192,57,43,0.24) 0%, transparent 60%), radial-gradient(60% 60% at 60% 90%, rgba(58,125,68,0.22) 0%, transparent 60%)",
      },
      boxShadow: {
        glow: "0 0 50px rgba(232,163,61,0.40)",
      },
    },
  },
  plugins: [],
};

export default config;
