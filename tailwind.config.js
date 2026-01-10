/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        slate: {
          750: '#2d3748',
          850: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      }
    },
  },
  plugins: [],
}
