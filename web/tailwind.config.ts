import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Figma Design - Light Theme with Green Accents
          'background': '#F5F5F5',
          'surface': '#FFFFFF',
          'card': '#FFFFFF',
          'accent': '#7ED957',
          'accent-light': '#4ADE80',
          'accent-dark': '#22C55E',
          'text-primary': '#333333',
          'text-secondary': '#666666',
          'text-muted': '#A0A0A0',
          'border': '#E0E0E0',
          'divider': '#E0E0E0',
        },
        category: {
          family: '#22c55e',
          work: '#3b82f6',
          'small-joys': '#eab308',
          nature: '#22c55e',
          health: '#ec4899',
          other: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Rounded"',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        'large-title': ['34px', { lineHeight: '41px', fontWeight: '700' }],
        'title': ['28px', { lineHeight: '34px', fontWeight: '700' }],
        'title-2': ['22px', { lineHeight: '28px', fontWeight: '600' }],
        'title-3': ['20px', { lineHeight: '25px', fontWeight: '600' }],
        'headline': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'callout': ['16px', { lineHeight: '21px', fontWeight: '400' }],
        'subheadline': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'footnote': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        'full': '50%',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.12)',
        'elevated': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'button': '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #7ED957, #4ADE80)',
        'gradient-accent': 'linear-gradient(180deg, #7ED957, #22C55E)',
      },
      keyframes: {
        'heart-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'confetti': {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'scale(1.2) rotate(180deg)', opacity: '0.8' },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: '1' },
        },
        'toast-in': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'heart-bounce': 'heart-bounce 0.3s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'confetti': 'confetti 0.5s ease-out',
        'toast-in': 'toast-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
}

export default config
