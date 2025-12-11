/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '720p': '1280px',
        '1080p': '1920px',
        '2xl': '1536px',
        '2k': '2560px',
        '4k': '3840px',
        '8k': '7680px',
      },
    },
  },
  plugins: [],
}

