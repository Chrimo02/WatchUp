export default {
  darkMode: ["class"],
  content: ["./client/**/*.{js,jsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        limelight: ["Limelight", "cursive"],
        poppins: ["Poppins", "sans-serif"],
        sans:    ["Inter",    "sans-serif"],
      },
      colors: {
        primary: "#b91c1c", 
        background: "#141414"
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};