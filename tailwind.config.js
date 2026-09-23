/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e9fe',
          200: '#bae0fd',
          300: '#7cc5fb',
          400: '#36a6f6',
          500: '#0c87e8',
          600: '#006bc7',
          700: '#0255a3',
          800: '#064886',
          900: '#0b3c6f',
          950: '#07264a',
        },
        accent: {
          emerald: '#10b981',
          rose: '#f43f5e',
          amber: '#f59e0b',
          violet: '#8b5cf6',
          indigo: '#6366f1',
          cyan: '#06b6d4',
        },
        safety: {
          safe: '#10b981',
          moderate: '#f59e0b',
          caution: '#ef4444',
        },
        dark: {
          bg: '#071A2B',
          card: '#0A2540',
          border: 'rgba(14, 116, 144, 0.2)',
          glass: 'rgba(7, 26, 43, 0.75)',
        },
        travel: {
          navy: '#071A2B',
          navyDark: '#030F1A',
          ocean: '#0E7490',
          sky: '#38BDF8',
          teal: '#14B8A6',
          sunset: '#F59E0B',
          gold: '#FBBF24',
          sand: '#F5EBDD',
          muted: '#94A3B8',
          surface: 'rgba(14, 116, 144, 0.08)',
          card: 'rgba(7, 26, 43, 0.75)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03))',
        'dark-glass': 'linear-gradient(135deg, rgba(7, 26, 43, 0.85), rgba(3, 15, 26, 0.7))',
        'hero-gradient': 'radial-gradient(ellipse at top, #0E7490 0%, #071A2B 65%, #030F1A 100%)',
        'glow-gradient': 'linear-gradient(90deg, #38BDF8 0%, #14B8A6 50%, #F59E0B 100%)',
        'travel-gradient': 'linear-gradient(135deg, #071A2B 0%, #0E7490 50%, #14B8A6 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glow': '0 0 25px -5px rgba(20, 184, 166, 0.35)',
        'glow-teal': '0 0 25px -5px rgba(20, 184, 166, 0.4)',
        'glow-sunset': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.4)',
        'card-hover': '0 20px 30px -10px rgba(3, 15, 26, 0.8), 0 8px 10px -6px rgba(14, 116, 144, 0.25)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { opacity: '0.6', filter: 'blur(20px)' },
          '100%': { opacity: '1', filter: 'blur(35px)' },
        }
      }
    },
  },
  plugins: [],
}
