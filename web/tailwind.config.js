/** @type {import('tailwindcss').Config} */
export default {
  /** @type {import('tailwindcss').Config} */ content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        space: ['"Space Grotesk"', "sans-serif"],
      },
      colors: {
        primary: "#5F38F5", 
        "light-gray": "#F9F9F9",
      },
    },
  },
  plugins: [],
};
