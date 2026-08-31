/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#020617', // Deep slate/black
          panel: 'rgba(15, 23, 42, 0.45)', // Floating glass
          border: 'rgba(34, 211, 238, 0.2)', // Cyan edge glow
          cyan: '#22d3ee', // Neon cyan
          blue: '#3b82f6', // Neon electric blue
          red: '#ef4444', // Alert red
          yellow: '#f59e0b', // Warn orange/yellow
          green: '#10b981', // Safe green
          glow: 'rgba(34, 211, 238, 0.45)'
        }
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(18, 24, 38, 0.95) 1px, transparent 1px), linear-gradient(90deg, rgba(18, 24, 38, 0.95) 1px, transparent 1px)',
      },
      animation: {
        'radar-sweep': 'radar 4s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'flow-glow': 'flowGlow 1.5s linear infinite',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.2, boxShadow: '0 0 15px rgba(34, 211, 238, 0.2)' },
          '50%': { opacity: 0.8, boxShadow: '0 0 25px rgba(34, 211, 238, 0.6)' },
        },
        flowGlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        }
      }
    },
  },
  plugins: [],
}
