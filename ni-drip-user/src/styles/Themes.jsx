/**
 * @typedef {Object} ColorPalette
 * @property {string} primary - Main brand color (Pink)
 * @property {string} secondary - Secondary brand color (Green)
 * @property {string} success - Success state color
 * @property {string} error - Error state color
 * @property {string} white - Absolute white
 * @property {string} dark - Absolute black
 * @property {string} gray - Neutral gray
 * * @typedef {Object} Typography
 * @property {Object} inter - Font family weights
 * @property {string} inter.black
 * @property {string} inter.bold
 * @property {string} inter.light
 * @property {string} inter.medium
 * @property {string} inter.regular
 * @property {string} inter.semiBold
 * @property {Record<string, number>} fontSize - Font sizes in pixels
 * @property {Record<string, number>} lineHeight - Line heights in pixels
 * * @typedef {Object} ShadowStyle
 * @property {string} shadowColor
 * @property {Object} shadowOffset
 * @property {number} shadowOffset.width
 * @property {number} shadowOffset.height
 * @property {number} shadowOpacity
 * @property {number} shadowRadius
 * @property {number} elevation
 * * @typedef {Object} Theme
 * @property {ColorPalette} colors
 * @property {Typography} typography
 * @property {(factor: number) => number} spacing
 * @property {(factor: number) => number} gap
 * @property {Record<string, number>} borderRadius
 * @property {Record<string, ShadowStyle>} elevation
 */

/** @type {Theme} */
export const theme = {
  colors: {
    primary: '#ff3aa6',
    secondary: '#59c167',
    success: '#35f338',
    error: '#f00221',
    white: '#ffffff',
    dark: '#000000',
    gray: '#dde0e5',
  },

  typography: {
    inter: {
      black: 'Inter_18pt-Black',
      bold: 'Inter_18pt-Bold',
      light: 'Inter_18pt-Light',
      medium: 'Inter_18pt-Medium',
      regular: 'Inter_18pt-Regular',
      semiBold: 'Inter_18pt-SemiBold',
    },

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
