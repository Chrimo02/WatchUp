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
      },
      colors: {
        primary: "#b91c1c", 
        background: "#141415"
      },
    },
  },
  plugins: [],
};