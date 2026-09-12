/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: { boxShadow: { soft: '0 8px 30px rgba(39, 73, 145, 0.08)' } } },
  plugins: []
};
