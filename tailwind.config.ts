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
        primary: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#8accff',
          400: '#4eb1ff',
          500: '#2196ff',
          600: '#0077ff',
          700: '#0062df',
          800: '#0050b5',
          900: '#00448f',
        },
        secondary: {
          50: '#f0f7ff',
          100: '#e6f3ff',
          200: '#bae3ff',
          300: '#7ccfff',
          400: '#36bfff',
          500: '#0099e6',
          600: '#0077b3',
          700: '#005c8f',
          800: '#004166',
          900: '#003252',
        },
        medical: {
          50: '#f0fafa',
          100: '#d0f1f1',
          200: '#a0e4e4',
          300: '#70d7d7',
          400: '#40caca',
          500: '#26b6b6',
          600: '#1d9d9d',
          700: '#147878',
          800: '#0b5353',
          900: '#022e2e',
        }
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
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