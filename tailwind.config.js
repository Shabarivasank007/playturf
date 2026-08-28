/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#ff4d4d',
          DEFAULT: '#e30613',
          dark: '#b3000b',
          accent: '#ffffff',
        },
        bgdark: {
          DEFAULT: '#ffffff',
          card: '#f8fafc',
          cardlight: '#f1f5f9',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        sports: ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
