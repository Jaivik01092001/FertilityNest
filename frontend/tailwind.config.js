/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors - Soft lavender/purple palette
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Secondary colors - Soft pink palette
        secondary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
        // Accent colors - Mint green palette
        accent: {
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
          950: '#052e16',
        },
        // Neutral colors
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        display: ['Coiny', 'cursive'],
      },
      fontSize: {
        'xs': '0.75rem',     // 12px
        'sm': '0.875rem',    // 14px
        'base': '1rem',      // 16px
        'lg': '1.125rem',    // 18px
        'xl': '1.25rem',     // 20px
        '2xl': '1.5rem',     // 24px
        '3xl': '1.875rem',   // 30px
        '4xl': '2.25rem',    // 36px
        '5xl': '3rem',       // 48px
      },
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',     // 4px
        'md': '0.5rem',      // 8px
        'lg': '0.75rem',     // 12px
        'xl': '1rem',        // 16px
        '2xl': '1.5rem',     // 24px
        'full': '9999px',
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'button': '0 2px 5px rgba(0, 0, 0, 0.1)',
        'input': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'dropdown': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'modal': '0 10px 25px rgba(0, 0, 0, 0.15)',
      },
      spacing: {
        '0': '0',
        '1': '0.25rem',      // 4px
        '2': '0.5rem',       // 8px
        '3': '0.75rem',      // 12px
        '4': '1rem',         // 16px
        '5': '1.25rem',      // 20px
        '6': '1.5rem',       // 24px
        '8': '2rem',         // 32px
        '10': '2.5rem',      // 40px
        '12': '3rem',        // 48px
        '16': '4rem',        // 64px
        '20': '5rem',        // 80px
        '24': '6rem',        // 96px
        '32': '8rem',        // 128px
        '40': '10rem',       // 160px
        '48': '12rem',       // 192px
        '56': '14rem',       // 224px
        '64': '16rem',       // 256px
      },
      maxWidth: {
        'xs': '20rem',       // 320px
        'sm': '24rem',       // 384px
        'md': '28rem',       // 448px
        'lg': '32rem',       // 512px
        'xl': '36rem',       // 576px
        '2xl': '42rem',      // 672px
        '3xl': '48rem',      // 768px
        '4xl': '56rem',      // 896px
        '5xl': '64rem',      // 1024px
        '6xl': '72rem',      // 1152px
        '7xl': '80rem',      // 1280px
        'full': '100%',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
}
