/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js}",   // quét HTML trong public
    "./src/**/*.{js,jsx,ts,tsx}" // quét code trong src
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
}
