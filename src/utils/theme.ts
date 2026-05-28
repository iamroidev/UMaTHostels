// UMAT Hostels Design System
// Professional color palette and design tokens

export const Colors = {
  // Primary Brand Colors
  primary: '#1B365D', // Deep Navy Blue - Professional, trustworthy
  secondary: '#F4A261', // Gold/Amber - Mining heritage, warmth
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F8F9FA',
    100: '#F1F3F4',
    200: '#E8EAED',
    300: '#DADCE0',
    400: '#BDC1C6',
    500: '#9AA0A6',
    600: '#80868B',
    700: '#5F6368',
    800: '#3C4043',
    900: '#202124',
  },
  
  // Semantic Colors
  success: '#34A853',
  warning: '#FBBC04',
  error: '#EA4335',
  info: '#4285F4',
  
  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    accent: '#FFF8F0', // Light gold tint
  },
  
  // Text Colors
  text: {
    primary: '#1B365D',
    secondary: '#5F6368',
    tertiary: '#9AA0A6',
    inverse: '#FFFFFF',
  },
  
  // Status Colors
  status: {
    available: '#34A853',
    limited: '#FBBC04',
    unavailable: '#EA4335',
    premium: '#F4A261',
  },
} as const;

export const Typography = {
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Font Weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.20,
    shadowRadius: 2.5,
    elevation: 3,
  },
  lg: {
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4.0,
    elevation: 5,
  },
} as const;

// Component Variants
export const ButtonVariants = {
  primary: {
    backgroundColor: Colors.primary,
    color: Colors.white,
  },
  secondary: {
    backgroundColor: Colors.secondary,
    color: Colors.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
    color: Colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: Colors.primary,
  },
} as const;

export const CardVariants = {
  elevated: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadow.md,
  },
  flat: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  accent: {
    backgroundColor: Colors.background.accent,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
} as const;