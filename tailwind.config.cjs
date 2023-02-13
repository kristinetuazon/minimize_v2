/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      xxsm: '280px',
      xsm: '375px',
      sm: '400px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    colors: {
      blackish: "#2D2D2B",
      powder: "#F0E4D8",
      offWhite: "#F6F5F0",
      supple: "#C39E9E",
      fadedPink: "#F6F0F1"
    },
    fontFamily: {
      title: ['Holipop','serif'],
      heading: ['Bargemo', 'serif'],
      bodyLight: ['Petrona_Light', 'serif'],
      bodyRegular: ['Petrona_Regular', 'serif'],
      bodyThin: ['Petrona_Thin', 'serif'],
      bodyRegularItalic: ['Petrona_Italic', 'serif'],
      bodyThinItalic: ['Petrona_Thin_Italic', 'serif'],
    },
    extend: {},
  },
  plugins: [],
};
