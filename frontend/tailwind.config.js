/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        shield: {
          bg: "#080c14",
          card: "#0d1424",
          surface: "#131d33",
          border: "#1f2d4a",
          cyan: "#00e5ff",
          cyanDark: "#0099b8",
          emerald: "#10b981",
          amber: "#f59e0b",
          crimson: "#ef4444",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 10px rgba(0, 229, 255, 0.2)" },
          "100%": { boxShadow: "0 0 25px rgba(0, 229, 255, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};
