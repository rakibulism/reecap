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
    extend: {},
  },
  plugins: [],
}

