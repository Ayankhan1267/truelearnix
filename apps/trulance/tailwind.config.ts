import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        teal: { 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488' },
        cyan: { 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2' },
        dark: { DEFAULT: '#060d17', 900: '#060d17', 800: '#0a1628', 700: '#0f1f38', 600: '#172744' },
      },
      fontFamily: { sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'] },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(20px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      }
    }
  },
  plugins: []
}
export default config
