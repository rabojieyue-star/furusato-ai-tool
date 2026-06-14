/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2D6A4F",
        secondary: "#95D5B2",
        accent: "#F4A261",
        surface: "#F8F9FA",
        ink: "#212529",
      },
      boxShadow: {
        card: "0 10px 30px rgba(33, 37, 41, 0.08)",
      },
    },
  },
  plugins: [],
};
