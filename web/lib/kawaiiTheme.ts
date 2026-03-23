/**
 * Cute Kawaii Theme for Appreciate App
 * 
 * Design Philosophy:
 * - Soft, rounded corners everywhere
 * - Pastel color palette
 * - Playful shadows and gradients
 * - Cute mascot characters
 * - Bubble-shaped elements
 */

export const kawaiiTheme = {
  // 🎨 Color Palette - Soft Pastels
  colors: {
    // Primary - Soft Pink/Rose
    primary: {
      50: '#FFF5F7',
      100: '#FFE8ED',
      200: '#FFD1DB',
      300: '#FFB3C6',
      400: '#FF8FAB',
      500: '#FF6B8A',  // Main pink
      600: '#E84D6F',
      700: '#C9365A',
      800: '#A72A4A',
      900: '#8B2240',
    },
    
    // Secondary - Lavender
    secondary: {
      50: '#FAF5FF',
      100: '#F3E8FF',
      200: '#E9D5FF',
      300: '#D8B4FE',
      400: '#C084FC',
      500: '#A855F7',  // Main purple
      600: '#9333EA',
      700: '#7C3AED',
      800: '#6B21A8',
      900: '#581C87',
    },
    
    // Accent - Mint Green
    accent: {
      50: '#F0FDF9',
      100: '#CCFBEF',
      200: '#99F6E4',
      300: '#5EEAD4',
      400: '#2DD4BF',
      500: '#14B8A6',  // Main teal
      600: '#0D9488',
      700: '#0F766E',
      800: '#115E59',
      900: '#134E4A',
    },
    
    // Warm - Peach/Coral
    warm: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#F97316',  // Main orange
      600: '#EA580C',
      700: '#C2410C',
      800: '#9A3412',
      900: '#7C2D12',
    },
    
    // Background - Soft Cream
    background: {
      primary: '#FFFBF5',    // Warm white
      secondary: '#FFF8F0',  // Cream
      tertiary: '#FFF5F7',   // Soft pink tint
      card: '#FFFFFF',       // Pure white for cards
    },
    
    // Text
    text: {
      primary: '#3D3D3D',
      secondary: '#6B6B6B',
      tertiary: '#9B9B9B',
      inverse: '#FFFFFF',
    },
  },
  
  // 📐 Spacing & Sizing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },
  
  // 🔵 Border Radius - Extra Rounded
  borderRadius: {
    sm: '12px',
    md: '20px',
    lg: '28px',
    xl: '36px',
    '2xl': '48px',
    full: '9999px',
  },
  
  // 🌈 Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #FF6B8A 0%, #FF8FAB 100%)',
    secondary: 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)',
    accent: 'linear-gradient(135deg, #14B8A6 0%, #2DD4BF 100%)',
    warm: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
    rainbow: 'linear-gradient(135deg, #FF6B8A 0%, #A855F7 25%, #14B8A6 50%, #F97316 75%, #FF6B8A 100%)',
    background: 'linear-gradient(180deg, #FFFBF5 0%, #FFF5F7 100%)',
    card: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8F0 100%)',
  },
  
  // 🎭 Shadows - Soft & Playful
  shadows: {
    sm: '0 2px 8px rgba(255, 107, 138, 0.15)',
    md: '0 4px 16px rgba(255, 107, 138, 0.2)',
    lg: '0 8px 32px rgba(255, 107, 138, 0.25)',
    xl: '0 16px 48px rgba(255, 107, 138, 0.3)',
    glow: '0 0 20px rgba(255, 107, 138, 0.4)',
    inner: 'inset 0 2px 8px rgba(255, 107, 138, 0.1)',
  },
  
  // ✨ Animations
  animations: {
    bounce: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' },
    },
    wiggle: {
      '0%, 100%': { transform: 'rotate(0deg)' },
      '25%': { transform: 'rotate(-3deg)' },
      '75%': { transform: 'rotate(3deg)' },
    },
    pulse: {
      '0%, 100%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.05)' },
    },
    sparkle: {
      '0%, 100%': { opacity: 1, transform: 'scale(1)' },
      '50%': { opacity: 0.8, transform: 'scale(1.2)' },
    },
    float: {
      '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
      '50%': { transform: 'translateY(-20px) rotate(5deg)' },
    },
  },
  
  // 🎪 Components
  components: {
    button: {
      base: {
        borderRadius: '24px',
        padding: '12px 24px',
        fontWeight: 600,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 16px rgba(255, 107, 138, 0.2)',
      },
      hover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 32px rgba(255, 107, 138, 0.3)',
      },
      active: {
        transform: 'translateY(0)',
        boxShadow: '0 2px 8px rgba(255, 107, 138, 0.15)',
      },
    },
    card: {
      base: {
        borderRadius: '28px',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8F0 100%)',
        boxShadow: '0 4px 16px rgba(255, 107, 138, 0.15)',
        border: '2px solid rgba(255, 107, 138, 0.1)',
      },
      hover: {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 32px rgba(255, 107, 138, 0.25)',
        border: '2px solid rgba(255, 107, 138, 0.2)',
      },
    },
    input: {
      base: {
        borderRadius: '20px',
        padding: '16px 20px',
        background: '#FFFFFF',
        border: '2px solid rgba(255, 107, 138, 0.15)',
        transition: 'all 0.3s ease',
      },
      focus: {
        border: '2px solid #FF6B8A',
        boxShadow: '0 0 0 4px rgba(255, 107, 138, 0.1)',
      },
    },
  },
};

// 🎨 Category Colors - Cute & Playful
export const kawaiiCategoryColors = {
  FAMILY: {
    bg: '#FFE8ED',
    text: '#C9365A',
    icon: '👨‍👩‍👧‍👦',
    gradient: 'linear-gradient(135deg, #FFB3C6 0%, #FF8FAB 100%)',
  },
  WORK: {
    bg: '#E9D5FF',
    text: '#7C3AED',
    icon: '💼',
    gradient: 'linear-gradient(135deg, #D8B4FE 0%, #C084FC 100%)',
  },
  SMALL_JOYS: {
    bg: '#FEF3C7',
    text: '#D97706',
    icon: '✨',
    gradient: 'linear-gradient(135deg, #FDE68A 0%, #FCD34D 100%)',
  },
  NATURE: {
    bg: '#CCFBEF',
    text: '#0F766E',
    icon: '🌿',
    gradient: 'linear-gradient(135deg, #99F6E4 0%, #5EEAD4 100%)',
  },
  HEALTH: {
    bg: '#DBEAFE',
    text: '#1D4ED8',
    icon: '💪',
    gradient: 'linear-gradient(135deg, #BFDBFE 0%, #93C5FD 100%)',
  },
  OTHER: {
    bg: '#F3E8FF',
    text: '#9333EA',
    icon: '💫',
    gradient: 'linear-gradient(135deg, #E9D5FF 0%, #D8B4FE 100%)',
  },
};

// 🌟 Decorative Elements
export const kawaiiDecorations = {
  sparkles: ['✨', '⭐', '🌟', '💫', '✦'],
  hearts: ['💖', '💕', '💗', '💓', '💝', '❤️', '🧡', '💛', '💚', '💙', '💜'],
  flowers: ['🌸', '🌺', '🌻', '🌼', '🌷', '💐', '🏵️', '🎀'],
  cute: ['🥰', '😊', '🥺', '😊', '🤗', '😄', '🦋', '🌈', '☁️', '🎀'],
  celebrations: ['🎉', '🎊', '🎈', '🎁', '🏆', '👑', '💖'],
};

// 🎭 Mascot Expressions
export const kawaiiMascot = {
  happy: '(◕‿◕)',
  excited: '(≧▽≦)',
  love: '(♥‿♥)',
  proud: '(￣▽￣)ノ',
  thinking: '(・_・)',
  celebrate: '٩(◕‿◕)۶',
  hug: '(づ｡◕‿‿◕｡)づ',
  sparkle: '(✧ω✧)',
};

export default kawaiiTheme;
