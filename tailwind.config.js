/** @type {import('tailwindcss').Config} */
module.exports = {
  // Mirrors /constants/brand.ts — keep the two in sync.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        ivory: '#FAF7F2',
        surface: '#FFFFFF',
        surfaceAlt: '#F4EFE8',
        // Brand
        rose: '#7C2D3E',
        roseDark: '#5A1F2C',
        roseSoft: '#F2D9DE',
        gold: '#C9A961',
        goldSoft: '#F5EBD2',
        // Text
        ink: '#1F1B1A',
        inkMuted: '#5C5551',
        inkSubtle: '#9A9089',
        // Functional
        success: '#3F6E4A',
        warning: '#B8741A',
        danger: '#9B2C2C',
        info: '#3A5878',
        // Borders
        border: '#E8E0D7',
        borderStrong: '#D4C8BA',
      },
      fontFamily: {
        // Display — Fraunces. Each weight is a separately loaded font file;
        // React Native does not synthesise weights, so map each one explicitly.
        display: ['Fraunces_700Bold'],
        'display-medium': ['Fraunces_600SemiBold'],
        // Body / UI — Inter.
        body: ['Inter_400Regular'],
        'body-medium': ['Inter_500Medium'],
        'body-semibold': ['Inter_600SemiBold'],
      },
      fontSize: {
        // [size, lineHeight] — from CLAUDE.md §3.2 typography scale.
        xs: ['12px', '16px'],
        sm: ['14px', '20px'],
        base: ['16px', '24px'],
        lg: ['18px', '26px'],
        xl: ['22px', '30px'],
        '2xl': ['26px', '34px'],
        '3xl': ['32px', '40px'],
      },
    },
  },
  plugins: [],
};
