/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './views/**/*.ejs', // Include all EJS files in the views directory
    './public/**/*.html', // Include all HTML files in the public directory if any
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
