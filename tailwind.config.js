/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ecf0ff',
          200: '#d9e0ff',
          300: '#b9c5ff',
          400: '#8a9bff',
          500: '#5c72ff',
          600: '#3c50e6',
          700: '#2e3ab3',
          800: '#232c85',
          900: '#1d256a'
        }
      }
    },
  },
  plugins: [],
};
