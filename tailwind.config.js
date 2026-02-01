/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // ✅ enable dark mode via .dark class
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
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
        sans: [
          "Poppins",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen-Sans",
          "Ubuntu",
          "Cantarell",
          "Helvetica Neue",
          "sans-serif",
        ],
        heading: ["inherit", "sans-serif"],
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
