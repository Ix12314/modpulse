/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        lg: "2rem",
      },
    },
    extend: {
      colors: {
        // Apple-style neutral palette
        canvas: {
          light: "#fbfbfd",
          dark: "#000000",
        },
        surface: {
          light: "#ffffff",
          dark: "#1c1c1e",
        },
        subtle: {
          light: "#f5f5f7",
          dark: "#1c1c1e",
        },
        elevated: {
          light: "#ffffff",
          dark: "#2c2c2e",
        },
        ink: {
          light: "#1d1d1f",
          dark: "#f5f5f7",
        },
        muted: {
          light: "#6e6e73",
          dark: "#a1a1a6",
        },
        faint: {
          light: "#86868b",
          dark: "#6e6e73",
        },
        line: {
          light: "#d2d2d7",
          dark: "#38383a",
        },
        accent: {
          light: "#0071e3",
          dark: "#0a84ff",
        },
        success: {
          light: "#34c759",
          dark: "#30d158",
        },
        warning: {
          light: "#ff9500",
          dark: "#ff9f0a",
        },
        danger: {
          light: "#ff3b30",
          dark: "#ff453a",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: ['"SF Mono"', "ui-monospace", "Menlo", "Monaco", "monospace"],
      },
      borderRadius: {
        apple: "18px",
        "apple-lg": "22px",
        pill: "980px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08), 0 12px 28px rgba(0,0,0,0.12)",
        nav: "0 1px 0 rgba(0,0,0,0.06)",
        glow: "0 8px 30px rgba(0,113,227,0.25)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.5s ease both",
        "scale-in": "scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        float: "float 6s ease-in-out infinite",
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
