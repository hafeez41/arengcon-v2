import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        paper: "rgb(var(--paper-rgb) / <alpha-value>)",
        line: "rgb(var(--line-rgb) / <alpha-value>)",
        muted: "#6b6b6b",
      },
      fontFamily: {
        sans: ["var(--font-bank)", "system-ui", "sans-serif"],
        bank: ["var(--font-bank)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        ultratight: "-0.04em",
        wider2: "0.18em",
      },
    },
  },
  plugins: [],
} satisfies Config;
