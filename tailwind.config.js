/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx", 
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Custom dark theme colors
        'primary-bg': '#111111',
        'secondary-bg': '#2f2f2f',
        'primary-text': '#f6f6f6',
        'gold-accent': '#FFCB74',
        // Light theme colors (existing)
        'light-bg': '#ffffff',
        'light-secondary': '#f8f9fa',
        'light-text': '#1f2937',
        'light-accent': '#3b82f6',
      }
    },
  },
  plugins: [],
}