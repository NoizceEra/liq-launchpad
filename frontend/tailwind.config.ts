import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#020617',
        foreground: '#e5e7eb',
        accent: '#38bdf8',
        card: '#020617',
        cardBorder: '#1f2937',
        muted: '#6b7280',
      },
      boxShadow: {
        glow: '0 0 40px rgba(56, 189, 248, 0.2)',
      },
    },
  },
  plugins: [],
};

export default config;
