/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#111111",
        card: "#181818",
        text: "#FFFFFF",
        textSecondary: "#888888",
        primary: "#C8F000",
        border: "#333333",
        error: "#EF4444",
        success: "#4CAF50",
      },
    },
  },
  plugins: [],
};
