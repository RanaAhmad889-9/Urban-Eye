/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: { fontFamily: { sans: ['var(--font-body)'], display: ['var(--font-display)'] } } },
  plugins: [],
};
