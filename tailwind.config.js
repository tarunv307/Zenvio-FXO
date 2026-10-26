/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Zenvio FXO — Midnight Blue Premium SaaS Color System
        brand: {
          50:  '#EFF6FF', // Light blue surfaces
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB', // Primary blue
          600: '#1D4ED8', // Primary hover
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#172554',
          950: '#0F172A', // Main heading / Midnight dark
        },
        surface: {
          page: '#F8FAFC',
          card: '#FFFFFF',
          soft: '#F8FAFC',
          muted: '#F1F5F9',
          'light-blue': '#EFF6FF',
          border: '#E2E8F0',
          'border-hover': '#CBD5E1',
        },
        text: {
          heading: '#0F172A',
          body: '#475569',
          secondary: '#64748B',
          muted: '#94A3B8',
          faint: '#CBD5E1',
        },
        status: {
          success: '#16A34A',
          warning: '#D97706',
          error: '#DC2626',
        },
        gray: {
          50:  '#F8FAFC', // Page background
          100: '#F1F5F9', // Light surface
          200: '#E2E8F0', // Border
          300: '#CBD5E1', // Subtle border
          400: '#94A3B8', // Muted text
          500: '#64748B', // Secondary text
          600: '#475569', // Body text
          700: '#334155', // Dark body text
          800: '#1E293B', // Dark slate
          900: '#0F172A', // Main heading
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'lg': '10px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
        'modal': '0 20px 60px -12px rgba(15, 23, 42, 0.15), 0 8px 24px -6px rgba(15, 23, 42, 0.08)',
        'brand': '0 4px 14px 0 rgba(37, 99, 235, 0.22)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
