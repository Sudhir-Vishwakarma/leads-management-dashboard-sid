/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary-light': '#C9A1F6',
        'primary': '#8C26EF',
        'secondary-light': '#9AE6FA',
        'secondary': '#5779F7',
      },
    },
  },
  plugins: [],
};
