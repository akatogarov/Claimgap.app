import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f8f7f4",
        ink: {
          DEFAULT: "#111827",
          muted: "#4b5563",
          faint: "#9ca3af",
        },
        navy: {
          DEFAULT: "#1e3a5f",
          50: "#eef2f7",
          100: "#d9e2ed",
          200: "#b3c7db",
          300: "#8aa8c4",
          400: "#5c7fa3",
          500: "#3d5f82",
          600: "#2f4a66",
          700: "#263c54",
          800: "#1e3246",
          900: "#111827",
        },
        rust: {
          DEFAULT: "#c0392b",
          faint: "#fef2f2",
          border: "#fecaca",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        lift: "0 1px 2px rgba(26, 47, 69, 0.06), 0 8px 24px rgba(26, 47, 69, 0.08)",
        card: "0 1px 0 rgba(26, 47, 69, 0.04), 0 12px 40px rgba(26, 47, 69, 0.07)",
      },
    },
  },
  plugins: [],
};
export default config;
