/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        grid: {
          dark: '#fffaf5',        // Main soft warm white background
          navy: '#ffffff',        // White surface
          card: '#ffffff',        // Card white
          cardHover: '#fff7ed',   // Light orange/peach hover
          border: '#fed7aa',      // Soft orange border
          borderLight: '#fdba74', // Warm orange border
          electric: '#f97316',    // Vibrant energy orange
          electricHover: '#ea580c', // Deep rich orange
          cyan: '#f97316',        // Mapped to bright orange
          accent: '#ea580c',
          textMuted: '#64748b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
