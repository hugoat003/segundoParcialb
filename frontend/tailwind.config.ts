import type { Config } from "tailwindcss";

/**
 * Paleta "Jade & Ámbar"
 *  - brand:  jade, color principal (acciones, navegación activa, enlaces)
 *  - accent: ámbar/mandarina, acentos y degradados (rol admin, precios, destacados)
 *  - ink:    neutros con matiz verde-pizarra (fondos, texto, bordes)
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ebfef6",
          100: "#cffce8",
          200: "#a3f6d6",
          300: "#67ebbf",
          400: "#2bd6a3",
          500: "#0bbd8b",
          600: "#029972",
          700: "#037a5e",
          800: "#07614c",
          900: "#085040",
          950: "#032d25",
        },
        accent: {
          50: "#fff8ec",
          100: "#ffefd3",
          200: "#ffdba5",
          300: "#ffc06d",
          400: "#ff9a32",
          500: "#ff7d0a",
          600: "#f06200",
          700: "#c74902",
          800: "#9e390b",
          900: "#7f310c",
          950: "#451604",
        },
        ink: {
          50: "#f5f8f7",
          100: "#e9efed",
          200: "#d5dfdb",
          300: "#b2c3bd",
          400: "#89a198",
          500: "#6a857b",
          600: "#546b63",
          700: "#455751",
          800: "#2a3834",
          900: "#18221f",
          950: "#0c1412",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, rgb(255 255 255 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.04) 1px, transparent 1px)",
      },
      keyframes: {
        "slide-progress": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "slide-progress": "slide-progress linear forwards",
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
