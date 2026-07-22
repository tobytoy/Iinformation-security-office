/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0d14',
          card: '#121824',
          border: '#1f293d',
          accent: '#00f0ff',
          neonGreen: '#00ff88',
          neonRed: '#ff0055',
          neonPurple: '#a855f7',
          muted: '#64748b'
        }
      }
    },
  },
  plugins: [],
}
