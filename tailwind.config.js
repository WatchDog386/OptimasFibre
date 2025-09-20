/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // ✅ enable dark mode via .dark class
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#7e22ce",
        secondary: "#3b82f6",
        gray: {
          800: "#1f2937",
          900: "#111827",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      borderOpacity: {
        10: "0.1",
        20: "0.2",
        30: "0.3",
      },
      backgroundImage: {
        "main-gradient":
          "linear-gradient(145deg, #000000 0%, #2d2d2d 50%, #ffffff 100%)",
        "radial-white-black":
          "radial-gradient(circle at center, #ffffff 0%, #000000 100%)",
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
