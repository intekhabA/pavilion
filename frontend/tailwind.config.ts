import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#FAF7EE",
          100: "#F4ECD4",
          200: "#E9D9A8",
          300: "#DDC57D",
          400: "#D2B252",
          500: "#C5A028",
          600: "#A3821C",
          700: "#806414",
          800: "#5D470E",
          900: "#3B2C08",
        },
        navy: {
          800: "#131E3A",
          900: "#0B132B",
          950: "#050A18",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
