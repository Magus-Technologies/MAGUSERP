/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#E4F1FF',
          100: '#BFDCFF',
          200: '#95C7FF',
          300: '#6BB1FF',
          400: '#519FFF',
          500: '#458EFF',
          600: '#487FFF',
          700: '#486CEA',
          800: '#4759D6',
          900: '#4536B6',
        },
        success: {
          50:  '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#2ABC79',
          700: '#15803D',
        },
        warning: {
          50:  '#FEFCE8',
          500: '#EAB308',
          600: '#FF9F29',
          700: '#f39016',
        },
        danger: {
          50:  '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        info: {
          50:  '#EFF6FF',
          500: '#3B82F6',
          600: '#2563EB',
        },
        neutral: {
          DEFAULT: '#121535',
          30:  '#F2F5FA',
          40:  '#E5E7EB',
          50:  '#ECF1F9',
          600: '#121535',
          700: '#060710',
          800: '#11132e',
        },
      },
    },
  },
  plugins: [],
};

