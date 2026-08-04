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
          bg: '#090d16',
          card: '#111827',
          border: '#1f2937',
          glass: 'rgba(17, 24, 39, 0.75)',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03))',
        'dark-glass': 'linear-gradient(135deg, rgba(17, 24, 39, 0.8), rgba(15, 23, 42, 0.6))',
        'hero-gradient': 'radial-gradient(ellipse at top, #1e1b4b 0%, #090d16 80%)',
        'glow-gradient': 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow': '0 0 25px -5px rgba(99, 102, 241, 0.4)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.4)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
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
