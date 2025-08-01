import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta médica principal
        medical: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Colores de estado médico
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Colores de fondo y texto - más claros
        background: {
          DEFAULT: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
        },
        foreground: {
          DEFAULT: '#1e293b',
          secondary: '#475569',
          muted: '#64748b',
        },
        // Colores de borde
        border: {
          DEFAULT: '#e2e8f0',
          secondary: '#cbd5e1',
          accent: '#94a3b8',
        },
        // Colores de input
        input: {
          DEFAULT: '#ffffff',
          border: '#e2e8f0',
          focus: '#0ea5e9',
        },
        // Colores de ring (focus)
        ring: {
          DEFAULT: '#0ea5e9',
          secondary: '#3b82f6',
        },
        // Colores de accent
        accent: {
          DEFAULT: '#f1f5f9',
          foreground: '#0f172a',
        },
        // Colores de muted
        muted: {
          DEFAULT: '#f8fafc',
          foreground: '#64748b',
        },
        // Colores de card
        card: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a',
        },
        // Colores de popover
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a',
        },
        // Colores de destructive
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        // Colores de primary (usando medical)
        primary: {
          DEFAULT: '#0ea5e9',
          foreground: '#ffffff',
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Colores de secondary
        secondary: {
          DEFAULT: '#64748b',
          foreground: '#ffffff',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
      // Sombras personalizadas - más suaves
      boxShadow: {
        'medical': '0 4px 6px -1px rgba(14, 165, 233, 0.08), 0 2px 4px -1px rgba(14, 165, 233, 0.04)',
        'medical-lg': '0 10px 15px -3px rgba(14, 165, 233, 0.08), 0 4px 6px -2px rgba(14, 165, 233, 0.04)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.08)',
      },
      // Gradientes médicos - más suaves
      backgroundImage: {
        'medical-gradient': 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
        'medical-gradient-light': 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        'medical-gradient-soft': 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)',
        'success-gradient': 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
        'warning-gradient': 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        'danger-gradient': 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
        'info-gradient': 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
};

export default config; 