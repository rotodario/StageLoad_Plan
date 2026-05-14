/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cad: {
          bg: "#15171a",
          panel: "#1d2025",
          panel2: "#23272e",
          border: "#343a44",
          text: "#e7e9ed",
          muted: "#9aa3af",
          accent: "#7aa2f7",
          warn: "#f0b75b",
          danger: "#ff5f57"
        }
      }
    },
  },
  plugins: [],
};
