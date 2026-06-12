import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#100806',
          light: '#1F1410',
        },
        paper: {
          DEFAULT: '#FFFBF7',
          2: '#FBEFE6',
        },
        orange: {
          DEFAULT: '#FF4A1C',
          light: '#FF8A3D',
          dark: '#C42A07',
        },
        rouge: '#B3261E',
        amber2: '#F59E0B',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        floatBadge: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmerPass: {
          to: { backgroundPosition: '200% center' },
        },
      },
      animation: {
        'float-a': 'floatBadge 6s ease-in-out infinite',
        'float-b': 'floatBadge 7.5s ease-in-out 0.8s infinite',
        'float-c': 'floatBadge 5.5s ease-in-out 1.5s infinite',
        spin: 'spin 1s linear infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        shimmer: 'shimmerPass 3s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
