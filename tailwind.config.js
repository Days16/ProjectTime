/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        colors: {
          dark: "#0f0f0f",
          primary: "#1f1f1f",
          accent: "#ff0080",
          gradientStart: "#00f0ff",
          gradientEnd: "#ff00f0",
        },
      },
    },
    plugins: [],
  }
  