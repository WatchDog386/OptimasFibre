/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // ✅ enable dark mode via .dark class
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Admin dashboard tokens (Optimas SME design). Values come from CSS variables
        // set on .ui-sme in index.css, so they switch automatically in dark mode.
        surface: { DEFAULT: "rgb(var(--ui-surface) / <alpha-value>)", 2: "rgb(var(--ui-surface-2) / <alpha-value>)", 3: "rgb(var(--ui-surface-3) / <alpha-value>)" },
        field: "rgb(var(--ui-field) / <alpha-value>)",
        edge: { DEFAULT: "rgb(var(--ui-edge) / <alpha-value>)", 2: "rgb(var(--ui-edge-2) / <alpha-value>)" },
        fg: {
          DEFAULT: "rgb(var(--ui-fg) / <alpha-value>)", 2: "rgb(var(--ui-fg-2) / <alpha-value>)", 3: "rgb(var(--ui-fg-3) / <alpha-value>)",
          4: "rgb(var(--ui-fg-4) / <alpha-value>)", 5: "rgb(var(--ui-fg-5) / <alpha-value>)"
        },
        brand: {
          DEFAULT: "rgb(var(--ui-brand) / <alpha-value>)", strong: "rgb(var(--ui-brand-strong) / <alpha-value>)",
          soft: "rgb(var(--ui-brand-soft) / <alpha-value>)", text: "rgb(var(--ui-brand-text) / <alpha-value>)", border: "rgb(var(--ui-brand-border) / <alpha-value>)"
        },
        nav: {
          bg: "rgb(var(--ui-nav-bg) / <alpha-value>)", text: "rgb(var(--ui-nav-text) / <alpha-value>)", muted: "rgb(var(--ui-nav-muted) / <alpha-value>)",
          active: "rgb(var(--ui-nav-active) / <alpha-value>)", hover: "rgb(var(--ui-nav-hover) / <alpha-value>)"
        },
        primary: "#303a4d", // Vuma Dark Blue
        secondary: "#676c77", // Vuma Grey
        accent: "#00d084", // Vuma Greenish accent (from HTML styles)
        gray: {
          50: "#f9fafb",
          100: "#f1f2f8", // Vuma Light Grey
          200: "#e1e4eb", // Vuma Border Grey
          800: "#303a4d", // Re-mapped to primary for existing dark usage
          900: "#111827",
        },
      },
      fontFamily: {
        figtree: ["Figtree Variable", "Figtree", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        sans: ["Nunito Sans", "sans-serif"],
        nunito: ["Nunito", "sans-serif"],
        heading: ["Nunito Sans", "sans-serif"],
        accent: ["Roboto Slab", "serif"],
        accentSerif: ["Roboto Serif", "serif"],
        body: ["Inter", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      backgroundImage: {
        "vuma-gradient": "linear-gradient(135deg,rgba(6,147,227,1) 0%,rgb(155,81,224) 100%)", // Vivid Cyan Blue to Vivid Purple
        "vuma-cta-gradient": "linear-gradient(-45deg, #007bff, #ff0000, #ff7300, #00c3ff)",
      },
      keyframes: {
        pulseRadial: {
          "0%, 100%": { backgroundSize: "100% 100%" },
          "50%": { backgroundSize: "105% 105%" },
        },
        borderGlow: {
          "0%, 100%": {
            borderColor: "#0ff",
            boxShadow: "0 0 10px #0ff",
          },
          "50%": {
            borderColor: "#f0f",
            boxShadow: "0 0 15px #f0f",
          },
        },
        glowBg: {
          "0%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
          "100%": {
            backgroundPosition: "0% 50%",
          },
        },
      },
      animation: {
        "pulse-radial": "pulseRadial 10s ease-in-out infinite",
        "border-glow": "borderGlow 3s ease-in-out infinite",
        "glow-bg": "glowBg 12s ease infinite",
        "ping-slow": "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [],
};
