/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
        },
        bg: {
          base: "#FAFAF9",
          surface: "#FFFFFF",
          muted: "#F5F5F4",
        },
        border: {
          subtle: "#E7E5E4",
          strong: "#D6D3D1",
        },
        text: {
          primary: "#1C1917",
          secondary: "#57534E",
          tertiary: "#A8A29E",
          disabled: "#D6D3D1",
        },
        danger: { 50: "#FEF2F2", 500: "#DC2626" },
        warning: { 50: "#FFFBEB", 500: "#D97706" },
        info: { 50: "#F0F9FF", 500: "#0EA5E9" },
      },
      fontFamily: {
        sans: ['"Geist"', '"Inter"', "system-ui", "-apple-system", "sans-serif"],
        mono: ['"Geist Mono"', '"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.04)",
        md: "0 4px 12px rgba(0,0,0,0.06)",
        focus: "0 0 0 3px #D1FAE5",
      },
    },
  },
  plugins: [],
};
