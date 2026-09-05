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
        polar: {
          950: "#02050E",
          900: "#060D1F",
          850: "#0A142E",
          800: "#0F1E40",
          750: "#152955",
          700: "#1C366F",
          600: "#25488F",
        },
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
          cyan: "#00F0FF",
          teal: "#00E5A3",
          amber: "#FFB020",
          crimson: "#FF3366",
        }
      },
      fontFamily: {
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
      boxShadow: {
        "cyan-glow": "0 0 20px -3px rgba(6, 182, 212, 0.35)",
        "blue-glow": "0 0 25px -4px rgba(56, 189, 248, 0.25)",
        "panel-glow": "inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 4px 20px -2px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [],
};
export default config;
