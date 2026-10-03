/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background:  '#0d0905',
        foreground:  '#fdf8f3',
        card:        '#1a1108',
        primary:     '#f97316',
        secondary:   '#fbbf24',
        muted:       '#2a1d0f',
        border:      '#2a1d0f',
        accent:      '#fbbf24',
      },
      borderRadius: {
        DEFAULT: '0.75rem',
      }
    },
  },
  plugins: [],
}