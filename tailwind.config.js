/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: {
            DEFAULT: "#534AB7",
            light: "#EEEDFE",
          },
          coral: {
            DEFAULT: "#D85A30",
            light: "#FAECE7",
          },
          amber: {
            DEFAULT: "#BA7517",
            light: "#FAEEDA",
          },
          green: {
            DEFAULT: "#639922",
            light: "#EAF3DE",
          },
          gray: {
            DEFAULT: "#888780",
            light: "#F1EFE8",
          },
        },
      },
      keyframes: {
        "pulse-gentle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "pulse-gentle": "pulse-gentle 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
