import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        /* Strut Design System — Paper Canvas palette */
        paper: {
          DEFAULT: "#ead7b8",
          light: "#f2e8d5",
          dark: "#dfc9a5",
        },
        sand: {
          DEFAULT: "#e5dfd5",
          light: "#ede9e2",
          dark: "#d9d1c4",
        },
        ink: {
          DEFAULT: "#2e2d2b",
          light: "#3a3836",
          dark: "#1e1d1c",
        },
        charcoal: {
          DEFAULT: "#333333",
          light: "#444444",
          dark: "#222222",
        },
        stone: {
          DEFAULT: "#73706b",
          light: "#8a8782",
          dark: "#5c5955",
        },
        slate: {
          DEFAULT: "#676460",
          light: "#7d7a76",
          dark: "#504d4a",
        },
        "deep-stone": {
          DEFAULT: "#5c5955",
          light: "#73706b",
          dark: "#45433f",
        },
        amber: {
          DEFAULT: "#ffb546",
          light: "#ffc970",
          dark: "#e59b2b",
        },
        /* Semantic colors — kept for status/feedback */
        error: {
          DEFAULT: "#ef4444",
          light: "#fef2f2",
          dark: "#991b1b",
          border: "#fecaca",
        },
        success: {
          DEFAULT: "#10b981",
          light: "#ecfdf5",
          dark: "#065f46",
          border: "#a7f3d0",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fffbeb",
          dark: "#92400e",
          border: "#fde68a",
        },
        info: {
          DEFAULT: "#3b82f6",
          light: "#eff6ff",
          dark: "#1e40af",
          border: "#bfdbfe",
        },
        /* Legacy aliases for gradual migration */
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        display: ["'GT Pressura Standard'", "'Space Grotesk'", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["'Inter'", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        "card": "28px",
        "tile": "24px",
        "input": "12px",
        "btn": "8px",
        "tag": "9999px",
      },
      spacing: {
        "section": "80px",
        "section-lg": "120px",
      },
      letterSpacing: {
        "micro": "0.25em",
        "editorial": "0.071em",
        "subhead": "0.1em",
      },
      fontSize: {
        "micro-label": ["10px", { lineHeight: "1.6", letterSpacing: "0.25em" }],
        "caption": ["12px", { lineHeight: "1.43" }],
        "body-sm": ["14px", { lineHeight: "1.43", letterSpacing: "0.03em" }],
        "body": ["16px", { lineHeight: "1.5" }],
        "subheading": ["20px", { lineHeight: "1.4", letterSpacing: "0.1em" }],
        "heading-sm": ["32px", { lineHeight: "1.25" }],
        "heading": ["48px", { lineHeight: "1.17" }],
        "heading-lg": ["68px", { lineHeight: "1" }],
        "display": ["104px", { lineHeight: "0.92", letterSpacing: "0.071em" }],
        "display-xl": ["136px", { lineHeight: "0.92", letterSpacing: "0.071em" }],
      },
      boxShadow: {
        "none": "none",
        "subtle": "rgba(0, 0, 0, 0.5) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.5) 0px 1px 0px 0px",
      },
    },
  },
  plugins: [],
};

export default config;
