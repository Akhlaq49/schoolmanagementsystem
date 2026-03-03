/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // School / Academy theme
        academy: {
          50: '#f7f9fc',
          100: '#eef2f7',
          200: '#d9e2ec',
          300: '#b5c9da',
          400: '#8aa8c4',
          500: '#6a8cad',
          600: '#527396',
          700: '#435d7a',
          800: '#3a4f65',
          900: '#1e3a5f',  // Primary navy
          950: '#0f2744',
        },
        gold: {
          50: '#fdfbf5',
          100: '#faf6e8',
          200: '#f5ecc8',
          300: '#eddda3',
          400: '#e2c86e',
          500: '#d4a84b',  // Primary gold accent
          600: '#c49a3a',
          700: '#a37b2e',
          800: '#83622a',
          900: '#6b5127',
        }
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['"Libre Baskerville"', 'Georgia', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'academy': '0 4px 20px rgba(30, 58, 95, 0.12)',
        'academy-lg': '0 10px 40px rgba(30, 58, 95, 0.15)',
        'gold': '0 4px 14px rgba(212, 168, 75, 0.2)',
      },
      backgroundImage: {
        'academy-gradient': 'linear-gradient(135deg, #1e3a5f 0%, #2c5282 50%, #2b6cb0 100%)',
        'gold-gradient': 'linear-gradient(135deg, #d4a84b 0%, #c9a227 100%)',
      }
    },
  },
  plugins: [],
};
