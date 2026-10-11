import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0052D9",
          light: "#366EF4",
          subtle: "#D9E1FF",
        },
        success: "#00A870",
        danger: "#E34D59",
        warning: "#ED7B2F",
        surface: {
          DEFAULT: "#F3F3F3",
          card: "#FFFFFF",
          muted: "#F8F9FB",
        },
      },
      fontFamily: {
        sans: ["PingFang SC", "Microsoft YaHei", "Helvetica Neue", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(0,0,0,0.03), 0 1px 6px -1px rgba(0,0,0,0.02)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
