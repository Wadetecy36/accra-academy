/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      colors: {
        royal: '#002147', // Official Deep Navy
        gold: '#FDBE11',  // Official Rich Gold
        soft: '#F0F4F8'
      },
      fontFamily: {
        display: ['Merriweather', 'serif'],
        body: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}
