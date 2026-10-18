/**
 * SohofiBrico design tokens.
 * Colours are exposed as RGB channels in CSS variables (see src/index.css)
 * so every token supports Tailwind opacity modifiers: bg-primary/10.
 */
const channel = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.25rem", lg: "2rem" },
      screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1360px" },
    },
    extend: {
      colors: {
        // Semantic tokens (use these in components)
        bg: channel("bg"),
        surface: { DEFAULT: channel("surface"), sunken: channel("surface-sunken") },
        line: { DEFAULT: channel("line"), strong: channel("line-strong") },
        ink: { DEFAULT: channel("ink"), muted: channel("ink-muted"), subtle: channel("ink-subtle") },
        primary: {
          DEFAULT: channel("primary"),
          hover: channel("primary-hover"),
          soft: channel("primary-soft"),
          fg: channel("primary-fg"),
        },
        accent: {
          DEFAULT: channel("accent"),
          hover: channel("accent-hover"),
          soft: channel("accent-soft"),
          fg: channel("accent-fg"),
        },
        success: { DEFAULT: channel("success"), soft: channel("success-soft") },
        warning: { DEFAULT: channel("warning"), soft: channel("warning-soft") },
        danger: { DEFAULT: channel("danger"), soft: channel("danger-soft") },
        promo: { DEFAULT: channel("promo"), fg: channel("promo-fg") },
        ring: channel("ring"),

        // Raw brand scales (from the DB category colours)
        teal: {
          50: "#effaf8",
          100: "#d6f2ed",
          200: "#aee4db",
          300: "#7bcfc3",
          400: "#45b2a5",
          500: "#24968a",
          600: "#167a71",
          700: "#0f766e",
          800: "#0d5a54",
          900: "#0b4641",
          950: "#042a27",
        },
        signal: {
          orange: "#ea580c",
          amber: "#f59e0b",
          red: "#dc2626",
          yellow: "#eab308",
        },
        plaster: {
          50: "#fbf9f5",
          100: "#f6f2ea",
          200: "#ece5d8",
          300: "#ddd3c1",
          400: "#bfb29b",
          500: "#9a8d76",
        },
        cat: {
          droguerie: "#0f766e",
          sanitaire: "#3b82f6",
          peinture: "#ea580c",
          quincaillerie: "#f59e0b",
          outillage: "#dc2626",
          electricite: "#eab308",
          visserie: "#57534e",
          autres: "#0f766e",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
        arabic: ['"Cairo Variable"', '"Tajawal"', "sans-serif"],
      },
      fontSize: {
        "display-2xl": ["clamp(2.75rem, 1.6rem + 5vw, 5.5rem)", { lineHeight: "0.95", fontWeight: "700" }],
        "display-xl": ["clamp(2.25rem, 1.5rem + 3.2vw, 4rem)", { lineHeight: "1", fontWeight: "700" }],
        "display-lg": ["clamp(1.75rem, 1.3rem + 2vw, 2.75rem)", { lineHeight: "1.05", fontWeight: "700" }],
        "display-md": ["clamp(1.375rem, 1.15rem + 1vw, 1.875rem)", { lineHeight: "1.15", fontWeight: "650" }],
        "display-sm": ["1.25rem", { lineHeight: "1.25", fontWeight: "650" }],
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        xs: "3px",
        sm: "5px",
        DEFAULT: "8px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        "2xl": "28px",
      },
      boxShadow: {
        xs: "0 1px 0 rgb(var(--shadow) / 0.06)",
        sm: "0 1px 2px rgb(var(--shadow) / 0.08), 0 1px 1px rgb(var(--shadow) / 0.04)",
        DEFAULT: "0 2px 6px -1px rgb(var(--shadow) / 0.10), 0 1px 2px rgb(var(--shadow) / 0.06)",
        md: "0 6px 16px -4px rgb(var(--shadow) / 0.14), 0 2px 4px rgb(var(--shadow) / 0.06)",
        lg: "0 16px 32px -8px rgb(var(--shadow) / 0.18), 0 4px 8px rgb(var(--shadow) / 0.06)",
        xl: "0 28px 56px -12px rgb(var(--shadow) / 0.28)",
        // Signature "shelf label" shadow: crisp offset, like a printed tag on a rail
        tag: "3px 3px 0 0 rgb(var(--ink) / 0.9)",
        press: "inset 0 -2px 0 0 rgb(0 0 0 / 0.22)",
      },
      maxWidth: {
        prose: "68ch",
        shell: "1360px",
      },
      zIndex: {
        base: "0",
        raised: "10",
        sticky: "100",
        header: "200",
        dropdown: "300",
        overlay: "400",
        drawer: "500",
        modal: "600",
        toast: "700",
        tooltip: "800",
      },
      transitionTimingFunction: {
        snap: "cubic-bezier(0.2, 0.9, 0.3, 1)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.2, 0.9, 0.3, 1) both",
        "spin-slow": "spin-slow 1.2s linear infinite",
      },
    },
  },
  plugins: [],
};
