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
        /* Anthropic Design System — Warm Parchment palette */
        "slate-dark": "#141413",
        "ivory-medium": "#f0eee6",
        "ivory-light": "#faf9f5",
        "cloud-medium": "#b0aea5",
        "cloud-dark": "#87867f",
        "stone": "#cccbc8",
        "slate-medium": "#3d3d3a",
        "oat-warm": "#e3dacc",
        "manilla": "#f5e3c7",
        "clay": "#d97757",
        "clay-deep": "#c6613f",
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
        serif: ["var(--font-anthropic-serif)", "ui-serif", "Georgia", "Cambria", "Times New Roman", "Times", "serif"],
        sans: ["var(--font-anthropic-sans)", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-anthropic-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderRadius: {
        "card": "24px",
        "tile": "12px",
        "input": "8px",
        "btn": "8px",
        "tag": "0px",
      },
      spacing: {
        "section": "80px",
        "section-lg": "120px",
      },
      letterSpacing: {
        "caption": "-0.24px",
        "body-sm": "-0.08px",
        "subheading": "-0.05px",
        "heading": "-0.12px",
      },
      fontSize: {
        "caption": ["12px", { lineHeight: "1.4", letterSpacing: "-0.24px" }],
        "body-sm": ["16px", { lineHeight: "1", letterSpacing: "-0.08px" }],
        "body": ["20px", { lineHeight: "1.4" }],
        "subheading": ["24px", { lineHeight: "1.3", letterSpacing: "-0.05px" }],
        "heading": ["61px", { lineHeight: "1.1", letterSpacing: "-0.12px" }],
        "display": ["68px", { lineHeight: "1.1" }],
      },
      boxShadow: {
        "none": "none",
      },
    },
  },
  plugins: [],
};

export default config;
