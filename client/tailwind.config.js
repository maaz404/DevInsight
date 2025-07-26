/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "Space Grotesk", "Manrope", "sans-serif"],
        body: ["Sora", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        secondary: {
          50: "#f8fafc",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
        },
        "pastel-yellow": "#FFFACD",
        "pastel-pink": "#FFECEC",
        "neo-green": "#4ADE80",
        "neo-pink": "#F472B6",
        "neo-blue": "#60A5FA",
      },
      boxShadow: {
        neo: "6px 6px 0 0 black",
        "neo-sm": "4px 4px 0 0 black",
        "neo-lg": "8px 8px 0 0 black",
      },
      rotate: {
        "-2": "-2deg",
        2: "2deg",
      },
    },
  },
  plugins: [],
};
