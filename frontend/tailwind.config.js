/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        border: "rgba(255,255,255,0.08)",
        background: "#080E1A",
        foreground: "#F1F5F9",
        muted: "rgba(255,255,255,0.05)",
        primary: "#14B8A6",
        "primary-dark": "#0D9488",
        accent: "#818CF8",
        "accent-amber": "#F59E0B",
        "accent-rose": "#F43F5E",
        "accent-emerald": "#10B981",
        "navy-1": "#080E1A",
        "navy-2": "#0F172A",
        "navy-3": "#1E293B",
      },
      boxShadow: {
        soft: "0 12px 30px rgba(0, 0, 0, 0.3)",
        glow: "0 0 24px rgba(20, 184, 166, 0.35)",
        "glow-amber": "0 0 24px rgba(245, 158, 11, 0.35)",
        "glow-indigo": "0 0 24px rgba(129, 140, 248, 0.35)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
    }
  },
  plugins: []
};
