/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'minex-dark': '#0a0a0a',
        'minex-gray': '#1a1a1a',
        'minex-gray-light': '#2a2a2a',
        'minex-orange': '#ff6b35',
        'minex-orange-dark': '#e55a2b',
        'minex-green': '#4ade80',
        'minex-yellow': '#fbbf24',
      },
    },
  },
  plugins: [],
};

