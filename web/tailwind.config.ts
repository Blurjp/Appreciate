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
          gold: '#F5A623',
          'sunset-orange': '#F7786B',
          coral: '#FF6F61',
          'blush-pink': '#FFB5B5',
          lavender: '#C3AED6',
          'sage-green': '#A8D8B9',
          'sky-blue': '#87CEEB',
          cream: '#FFF8F0',
          'warm-white': '#FEFCF9',
          charcoal: '#2C2C2E',
          'medium-gray': '#8E8E93',
          'light-gray': '#F2F2F7',
        },
        category: {
          family: '#FF6F61',
          work: '#4A90D9',
          'small-joys': '#F5A623',
          nature: '#7BC67E',
          health: '#E87CA0',
          other: '#C3AED6',
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
        'headline': ['17px', { lineHeight: '22px', fontWeight: '600' }],
        'body': ['17px', { lineHeight: '22px', fontWeight: '400' }],
        'callout': ['16px', { lineHeight: '21px', fontWeight: '400' }],
        'subheadline': ['15px', { lineHeight: '20px', fontWeight: '400' }],
        'footnote': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      borderRadius: {
        'ios-sm': '8px',
        'ios-md': '12px',
        'ios-lg': '16px',
        'ios-xl': '24px',
      },
      spacing: {
        'ios-xs': '4px',
        'ios-sm': '8px',
        'ios-md': '16px',
        'ios-lg': '24px',
        'ios-xl': '32px',
        'ios-xxl': '48px',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #F5A623, #F7786B)',
        'gradient-warm': 'linear-gradient(180deg, #FFF8F0, #FFEEDD)',
        'gradient-card': 'linear-gradient(180deg, #FFFFFF, #FFF8F0)',
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
