/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eaf2ff',
          100: '#d6e7ff',
          200: '#bfd7ff',
          300: '#8db9ff',
          400: '#4f91f5',
          500: '#0b63e5',
          600: '#0647b5',
          700: '#083b90',
          800: '#0b3275',
          900: '#17233c',
        },
        secondary: {
          500: '#12a642',
        },
        olx: {
          orange: '#ff8200',
          blue: '#0b63e5',
          green: '#12a642',
          gradient: 'linear-gradient(135deg, #0b63e5 0%, #ff8200 100%)',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
