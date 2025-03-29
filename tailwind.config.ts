import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom theme colors
        holyBlue: {
          50: "#e6f8ff",
          100: "#dbebf2",
          200: "#bdd2dd",
          300: "#9bb9c8",
          400: "#7fa4b6",
          500: "#6c96ab",
          600: "#6090a7",
          700: "#4e7c93",
          800: "#416f85",
          900: "#2d6077",
        },
        holyTan: {
          50: "#fff5e6",
          100: "#f5e9d8",
          200: "#e5d2b5",
          300: "#d6b98d",
          400: "#c9a46c",
          500: "#c19656",
          600: "#be8f4a",
          700: "#a77c3b",
          800: "#956e31",
          900: "#825e24",
        },
        holyGold: {
          50: "#fcfbe5",
          100: "#f7f5d4",
          200: "#eee9ab",
          300: "#e4dd7f",
          400: "#dcd35a",
          500: "#d7cd42",
          600: "#d4ca34",
          700: "#bbb225",
          800: "#a69e1c",
          900: "#8f880a",
        },
        holyDark: {
          DEFAULT: "#0F2033",
          50: "#0F2033",
          100: "#0D1C2F",
          200: "#0B192C",
          300: "#091629",
          400: "#071326",
          500: "#050F23",
          600: "#040B20",
          700: "#03081D",
          800: "#02061A",
          900: "#010417",
        },
        holyLight: {
          DEFAULT: "#B7B795",
          50: "#B7B795",
          100: "#A5A586",
          200: "#929277",
          300: "#808068",
          400: "#6E6E59",
          500: "#5C5C4A",
          600: "#49493C",
          700: "#37372D",
          800: "#25251E",
          900: "#12120F",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        heading: ["var(--font-heading)"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

