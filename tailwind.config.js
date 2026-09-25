/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/client/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tj: {
          primary: "#D4AF37",
          "primary-light": "#F5D97E",
          "primary-dark": "#9A7B1E",
          bg: "#0B0E1A",
          "bg-card": "#141828",
          "bg-card-hover": "#1B2138",
          purple: "#7B5CFF",
          "purple-dark": "#4B36B8",
          cyan: "#4FD8E8",
          "text-primary": "#F3EFE3",
          "text-secondary": "#9CA0B5",
          "text-faint": "#5D6178",
          success: "#3ECF8E",
          danger: "#FF5C6C",
          warning: "#FFB84D",
        },
      },
      backgroundImage: {
        "tj-grad-gold": "linear-gradient(135deg, #F5D97E 0%, #D4AF37 50%, #9A7B1E 100%)",
        "tj-grad-btn": "linear-gradient(135deg, #8B6FE8 0%, #5A3FD4 100%)",
        "tj-grad-hero": "radial-gradient(ellipse at 50% 0%, #232B4D 0%, #0B0E1A 65%)",
        "tj-grad-vip": "linear-gradient(135deg, #8B6FE8 0%, #4B36B8 100%)",
      },
      fontFamily: {
        sans: ["PingFang SC", "Microsoft YaHei", "Noto Sans SC", "sans-serif"],
        display: ["Cinzel", "Noto Serif SC", "STKaiti", "KaiTi", "serif"],
        num: ["DIN Alternate", "Bahnschrift", "sans-serif"],
      },
      boxShadow: {
        "gold-glow": "0 0 15px rgba(212, 175, 55, 0.35)",
        "purple-glow": "0 0 15px rgba(123, 92, 255, 0.35)",
        "cyan-glow": "0 0 15px rgba(79, 216, 232, 0.35)",
      },
    },
  },
  plugins: [],
};
