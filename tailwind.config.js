/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crm: {
          bg: '#080C0E',
          card: '#0D1216',
          surface: '#12181E',
          surfaceHover: '#172027',
          surfaceActive: '#1C2630',
          border: '#1E262E',
          borderHover: '#2A3540',
          borderLight: '#232D37',
          text: '#F1F5F9',
          textSecondary: '#94A3B8',
          textMuted: '#64748B',
          textDim: '#475569',
        },
        turquoise: {
          DEFAULT: '#14B8A6',
          muted: '#0D9488',
          hover: '#2DD4BF',
          subtle: 'rgba(20, 184, 166, 0.08)',
          subtleBorder: 'rgba(20, 184, 166, 0.25)',
          deep: '#042F2E',
        },
        status: {
          active: '#10B981',
          activeBg: 'rgba(16, 185, 129, 0.1)',
          invited: '#F59E0B',
          invitedBg: 'rgba(245, 158, 11, 0.1)',
          suspended: '#EF4444',
          suspendedBg: 'rgba(239, 68, 68, 0.1)',
          inactive: '#64748B',
          inactiveBg: 'rgba(100, 116, 139, 0.1)',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.35)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
        elevated: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
        modal: '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.7)',
      },
    },
  },
  plugins: [],
}
