/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#111827', // Gray 900
          foreground: '#F9FAFB', // Gray 50
        },
        secondary: {
          DEFAULT: '#F3F4F6', // Gray 100
          foreground: '#1F2937', // Gray 800
        },
        muted: {
          DEFAULT: '#F3F4F6', // Gray 100
          foreground: '#6B7280', // Gray 500
        },
        accent: {
          DEFAULT: '#F3F4F6', // Gray 100
          foreground: '#111827', // Gray 900
        },
        destructive: {
          DEFAULT: '#EF4444', // Red 500
          foreground: '#F9FAFB', // Gray 50
        },
        border: '#E5E7EB', // Gray 200
        input: '#E5E7EB', // Gray 200
        ring: '#111827', // Gray 900
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
}
