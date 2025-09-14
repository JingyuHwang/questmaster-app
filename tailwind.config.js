/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ability: {
          intelligence: '#3b82f6',
          strength: '#ef4444', 
          health: '#22c55e',
          creativity: '#a855f7',
          social: '#eab308',
        },
        game: {
          gold: '#ffd700',
          exp: '#22c55e',
        }
      },
    },
  },
  plugins: [],
  darkMode: 'class'
}
