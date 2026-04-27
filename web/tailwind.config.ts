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
          'background': '#FAF6EE',
          'surface': '#F5EFE3',
          'card': '#FFFFFF',
          'primary': '#C4704B',
          'accent': '#7D8C6E',
          'accent-light': '#EDE8DF',
          'accent-dark': '#8B3A2A',
          'text-primary': '#3A2E2A',
          'text-secondary': '#6B5E57',
          'text-muted': '#9A8880',
          'border': '#E2D8CE',
          'divider': '#EDE8DF',
        },
        category: {
          family: '#C4704B',
          work: '#8B3A2A',
          'small-joys': '#C4A35A',
          nature: '#7D8C6E',
          health: '#9B8AA0',
          other: '#A09080',
        },
        warm: {
          cream: {
            50: '#FDFAF5',
            100: '#FAF6EE',
            200: '#F5EFE3',
            300: '#EDE8DF',
            400: '#E2D8CE',
          },
          rose: {
            300: '#D4917A',
            400: '#C4704B',
            500: '#B85C38',
            600: '#8B3A2A',
          },
          sage: {
            300: '#A3B08F',
            400: '#7D8C6E',
            500: '#6A7A5C',
          },
          gold: {
            300: '#D4B87A',
            400: '#C4A35A',
            500: '#A88540',
          },
          ink: {
            300: '#9A8880',
            400: '#6B5E57',
            500: '#3A2E2A',
          },
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'large-title': ['34px', { lineHeight: '41px', fontWeight: '400' }],
        'title': ['28px', { lineHeight: '34px', fontWeight: '400' }],
        'title-2': ['22px', { lineHeight: '28px', fontWeight: '400' }],
        'title-3': ['20px', { lineHeight: '25px', fontWeight: '400' }],
        'headline': ['18px', { lineHeight: '24px', fontWeight: '500' }],
        'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'callout': ['16px', { lineHeight: '21px', fontWeight: '400' }],
        'subheadline': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'footnote': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
        'full': '9999px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      boxShadow: {
        'warm': '0 4px 20px rgba(58, 46, 42, 0.08)',
        'warm-lg': '0 8px 32px rgba(58, 46, 42, 0.12)',
        'warm-xl': '0 16px 48px rgba(58, 46, 42, 0.16)',
        'card': '0 4px 20px rgba(58, 46, 42, 0.08)',
        'card-hover': '0 8px 32px rgba(58, 46, 42, 0.12)',
        'elevated': '0 8px 32px rgba(58, 46, 42, 0.1)',
        'button': '0 4px 12px rgba(196, 112, 75, 0.25)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #C4704B 0%, #D4917A 100%)',
        'gradient-bg': 'linear-gradient(180deg, #FAF6EE 0%, #F5EFE3 100%)',
        'gradient-card': 'linear-gradient(135deg, #FFFFFF 0%, #FAF6EE 100%)',
      },
      keyframes: {
        'heart-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
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
        'toast-in': 'toast-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
}

export default config
