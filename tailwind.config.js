// tailwind.config.js
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        arizona: ['ABCArizonaMix', 'sans-serif'],
        gintoNord: ['CullenGinto-Nord', 'sans-serif'],
        gintoNormal: ['CullenGintoNormal', 'sans-serif'],
        bebas: ['Bebas Neue', 'sans-serif'],
      },
      colors: {
        fontGreen: '#3C950D',
      },
    },
  },
  plugins: [],
};
