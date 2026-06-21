/** @type {import('tailwindcss').Config} */
// Build the dashboard's static stylesheet:
//   cd agents && npx tailwindcss@3.4.18 -c tailwind.config.js -i css/tailwind.input.css -o css/tailwind.css --minify
// Re-run after adding new Tailwind utility classes in any .php or .js below.
module.exports = {
  content: [
    './*.php',
    './js/**/*.js',
  ],
  theme: { extend: {} },
  plugins: [],
};
