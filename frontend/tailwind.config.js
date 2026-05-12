/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    },
    extend: {
      colors: {
        'aipb': {
          bg: 'rgb(var(--aipb-bg) / <alpha-value>)',
          dark: 'rgb(var(--aipb-dark) / <alpha-value>)',
          accent: 'rgb(var(--aipb-accent) / <alpha-value>)',
          'accent-bright': 'rgb(var(--aipb-accent-bright) / <alpha-value>)',
          text: 'rgb(var(--aipb-text) / <alpha-value>)',
          'text-on-dark': 'rgb(var(--aipb-text-on-dark) / <alpha-value>)',
          light: 'rgb(var(--aipb-light) / <alpha-value>)',
        },
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      borderRadius: {
        'mobile': '16px',
        'button': '28px',
        '3xl': '24px',
      },
      boxShadow: {
        'mobile': '0 4px 16px rgb(6 182 212 / 0.35)',
        'mobile-lg': '0 8px 24px rgb(6 182 212 / 0.5)',
      },
    },
  },
  plugins: [],
}
