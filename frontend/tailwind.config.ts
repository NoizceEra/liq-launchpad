import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0510',
        foreground: '#fdf8ff',
        accent: '#f472b6',
        card: '#150a21',
        cardBorder: '#3b2759',
        muted: '#a78bfa',
      },
      boxShadow: {
        glow: '0 0 40px rgba(244, 114, 182, 0.3)',
      },
      backgroundImage: {
        'candy-gradient': 'linear-gradient(135deg, #f472b6 0%, #c084fc 100%)',
      }
    },
  },
  plugins: [],
};

export default config;
