/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  // theme: {
  //   extend: {},
  // },
  theme: {
    extend: {
      colors: {
        customBlue: "#1DA1F2", // Example of adding a custom color
      },
    },
  },
  plugins: [],
};
