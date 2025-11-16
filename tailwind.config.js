/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"], // Scans index.html for classes
  theme: {
    extend: {
      colors: {
        royal: '#002E6D',
        gold: '#FFCC00'
      },
      fontFamily: {
        display: ['Merriweather', 'serif'],
        body: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}
