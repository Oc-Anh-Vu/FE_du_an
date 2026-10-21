/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#fff8f1',
        foreground: '#261b17',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#261b17',
        },
        primary: {
          DEFAULT: '#f05a32',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#ffe0d3',
          foreground: '#c63d1c',
        },
        muted: {
          DEFAULT: '#f8f6f5',
          foreground: '#756761',
        },
        border: '#eadfd8',
        ring: '#f05a32',
        accent: {
          DEFAULT: '#fbbf24',
          foreground: '#261b17',
        },
      },
      borderRadius: {
        DEFAULT: '0.75rem',
      },
    },
  },
  plugins: [],
}