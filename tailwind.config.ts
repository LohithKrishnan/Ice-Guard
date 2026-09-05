import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Legacy polar aliases kept so map/context code still compiles ──
        polar: {
          950: "#0D0D0D",
          900: "#111111",
          850: "#141414",
          800: "#1A1A1A",
          750: "#222222",
          700: "#2A2A2A",
          600: "#333333",
        },
        // ── New premium palette ──
        ink: {
          950: "#0D0D0D",
          900: "#111111",
          850: "#141414",
          800: "#1A1A1A",
          750: "#222222",
          700: "#2A2A2A",
          600: "#333333",
          500: "#404040",
        },
        sand: {
          50:  "#FAFAF8",
          100: "#F2F0EB",
          200: "#E8E4DC",
          300: "#D5CFBF",
          400: "#B5AE9E",
          500: "#8C8578",
        },
        bronze: {
          50:  "#FAF6F0",
          100: "#EFE4D0",
          200: "#DEC9A0",
          300: "#C9AC78",
          400: "#B8A58A",
          500: "#A08060",
          600: "#7A6048",
          700: "#5A4432",
        },
        // ── Semantic status colors (muted, not neon) ──
        hazard: {
          low:      "#4A7C59", // muted green
          moderate: "#9C7B2A", // muted amber
          high:     "#9B4A2A", // muted orange
          critical: "#8B2A2A", // muted red
        },
        // ── Keep ice/cyber so chart code compiles ──
        ice: {
          50: "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#0284C7",
        },
        cyber: {
          cyan:    "#00F0FF",
          teal:    "#00E5A3",
          amber:   "#FFB020",
          crimson: "#FF3366",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      letterSpacing: {
        widest2: "0.2em",
      },
      boxShadow: {
        // Legacy (keep so existing map code compiles)
        "cyan-glow":   "0 0 20px -3px rgba(6, 182, 212, 0.35)",
        "blue-glow":   "0 0 25px -4px rgba(56, 189, 248, 0.25)",
        "panel-glow":  "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 4px 24px -4px rgba(0,0,0,0.7)",
        // New premium shadows
        "panel":       "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 4px 24px -4px rgba(0,0,0,0.7)",
        "bronze-glow": "0 0 16px -4px rgba(184,165,138,0.3)",
        "card":        "0 2px 12px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
export default config;
