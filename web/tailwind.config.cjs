/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca"
        }
      },
      boxShadow: {
        soft: "0 10px 25px -10px rgba(0,0,0,0.1)"
      }
    }
  },
  plugins: [
    require("@tailwindcss/forms"),       // ✅ for better input fields
    require("@tailwindcss/typography")  // ✅ for clean Markdown text (lists, spacing, etc.)
  ]
};
