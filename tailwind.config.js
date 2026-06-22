/** @type {import('tailwindcss').Config} */
export default {
  // The app's theme is driven by the [data-theme] attribute (set in App.tsx),
  // not the OS. Tie Tailwind's `dark:` variant to it so dark: utilities follow
  // the in-app light/dark toggle instead of prefers-color-scheme.
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Brand color is #FF3D03. Every brand accent in the UI was authored with
      // Tailwind's blue/indigo utilities, so we remap both palettes to a single
      // orange-red scale built around the brand. This recolors all brand
      // accents (fills, gradients, badges, rings, including `/opacity` variants)
      // without touching each call site.
      colors: {
        brand: {
          50: '#FFF1ED', 100: '#FFE0D6', 200: '#FFC1AD', 300: '#FF9B78',
          400: '#FF6A3D', 500: '#FF3D03', 600: '#E63100', 700: '#BF2A02',
          800: '#991F02', 900: '#7A1A02',
        },
        blue: {
          50: '#FFF1ED', 100: '#FFE0D6', 200: '#FFC1AD', 300: '#FF9B78',
          400: '#FF6A3D', 500: '#FF3D03', 600: '#E63100', 700: '#BF2A02',
          800: '#991F02', 900: '#7A1A02',
        },
        indigo: {
          50: '#FFF1ED', 100: '#FFE0D6', 200: '#FFC1AD', 300: '#FF9B78',
          400: '#FF6A3D', 500: '#FF3D03', 600: '#E63100', 700: '#BF2A02',
          800: '#991F02', 900: '#7A1A02',
        },
      },
    },
  },
  plugins: [],
}

