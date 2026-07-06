import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          950: '#050A18',
          900: '#0A0F1E',
          800: '#0F1829',
        },
        cyan: {
          accent: '#00D4FF',
        },
        alert: {
          critical: '#FF3B3B',
          warning: '#FFB347',
          safe: '#00FF88',
        },
        train: {
          blue: '#1E3A5F',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
