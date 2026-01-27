/**
 * @file Themes.js
 * @module Styles/Themes
 * @description
 * Centralized design system theme configuration for the entire React Native application.
 *
 * Exports a single `theme` object containing:
 * - Color palette (brand colors, semantic states, neutrals)
 * - Typography configuration (Inter font family weights + responsive font sizes/line heights)
 * - Spacing & gap utilities (8px-based scale)
 * - Border radius presets
 * - Elevation/shadow styles (iOS shadow + Android elevation levels)
 *
 * All components should reference values from this theme for consistent look & feel.
 * Uses functional spacing/gap helpers for maintainable, scalable layout values.
 */

export const theme = {
  colors: {
    primary: '#ff3aa6',
    secondary: '#59c167',
    success: '#35f338',
    error: '#f00221',
    white: '#ffffff',
    dark: '#000000',
    gray: '#ced4df',
  },

  typography: {
    black: 'Inter_18pt-Black',
    bold: 'Inter_18pt-Bold',
    light: 'Inter_18pt-Light',
    medium: 'Inter_18pt-Medium',
    regular: 'Inter_18pt-Regular',
    semiBold: 'Inter_18pt-SemiBold',

    fontSize: {
      xs: 16,
      sm: 18,
      md: 22,
      lg: 26,
      xl: 28,
      xxl: 40,
    },
    lineHeight: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
      xxl: 40,
    },
  },

  spacing: factor => factor * 8,

  gap: factor => factor * 8,

  borderRadius: {
    small: 4,
    medium: 8,
    large: 16,
    circle: 50,
  },

  elevation: {
    depth1: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    depth2: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 6,
    },
    depth3: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 12,
    },
  },
};
