/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sap: {
          blue: "#0070F2",
          navy: "#1e3a5f",
          "navy-light": "#2d5282",
          "blue-light": "#e8f3ff",
          bg: "#f5f6f7",
          border: "#d9d9d9",
          text: "#32363a",
          muted: "#6b7280",
          success: "#107e3e",
          warning: "#e9730c",
          error: "#bb0000",
        },
      },
    },
  },
  plugins: [],
};
