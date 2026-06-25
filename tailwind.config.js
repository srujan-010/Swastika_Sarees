/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          crimson: '#8B1A1A',
          gold: '#C8832A',
          'gold-light': '#E8A84C',
          cream: '#FFF8F0',
          dark: '#1A0505',
          muted: '#6B3A3A',
          white: '#FFFFFF',
          border: '#E8D5C4',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        bounceSlow: 'bounce 2s infinite',
        marquee: 'marquee 25s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    },
  },
  plugins: [],
}
