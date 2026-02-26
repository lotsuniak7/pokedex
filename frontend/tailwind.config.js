// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pokedex: {
          red: '#dc0a2d',
          dark: '#2a2a2a',
          screen: '#98cb98',
          blue: '#28aafd'
        }
      }
    },
  },
  plugins: [],
}