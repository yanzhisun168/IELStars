import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1d4ed8',
        },
      },
      boxShadow: {
        soft: '0 12px 32px rgba(23, 32, 51, 0.08)',
      },
    },
  },
  plugins: [],
}

export default config
