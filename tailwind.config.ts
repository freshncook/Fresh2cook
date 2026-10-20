import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1f8f3",
          100: "#dcefe0",
          200: "#bfe0c6",
          300: "#91c99e",
          400: "#5cab70",
          500: "#2f8f46",
          600: "#247539",
          700: "#1f5c30",
          800: "#1c4929",
          900: "#183c24"
        }
      },
      boxShadow: {
        soft: "0 12px 40px rgba(18, 45, 28, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;




