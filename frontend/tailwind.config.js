/** @type {import('tailwindcss').Config} */
export default {
  // Tell Tailwind to scan all these files for CSS classes
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}