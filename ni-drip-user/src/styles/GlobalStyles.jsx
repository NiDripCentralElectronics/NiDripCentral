/**
 * @file GlobalStyles.js
 * @module Styles/GlobalStyles
 * @description
 * Centralized global style definitions and responsive scaling utilities for consistent UI across the app.
 *
 * Provides:
 * - Responsive scaling functions (scale, verticalScale, moderateScale) based on iPhone 11/13/14/15 guideline size (375×812)
 * - Reusable base styles for common UI elements:
 *   - Containers & layout
 *   - Typography variants (primary, secondary, white, black, error, success)
 *   - Buttons (primary & secondary)
 *   - Input fields & labels
 *   - Cards & card content
 *   - Dividers
 *
 * All styles reference the central `theme` object for colors, typography, spacing, radii, and elevation.
 * Uses moderate scaling to balance responsiveness while preserving design intent on different screen sizes.
 */

import { theme } from './Themes';
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('screen');

const GUIDELINE_BASE_WIDTH = 375;
const GUIDELINE_BASE_HEIGHT = 812;

const scale = size => (width / GUIDELINE_BASE_WIDTH) * size;
const verticalScale = size => (height / GUIDELINE_BASE_HEIGHT) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  textPrimary: {
    color: theme.colors.primary,
    fontFamily: theme.typography.regular,
    fontSize: moderateScale(theme.typography.fontSize.sm),
  },

  textSecondary: {
    color: theme.colors.secondary,
    fontFamily: theme.typography.regular,
    fontSize: moderateScale(theme.typography.fontSize.sm),
  },

  textWhite: {
    color: theme.colors.white,
    fontFamily: theme.typography.medium,
    fontSize: moderateScale(theme.typography.fontSize.sm),
  },

  textBlack: {
    color: theme.colors.dark,
    fontFamily: theme.typography.semiBold,
    fontSize: moderateScale(theme.typography.fontSize.sm),
  },

  textError: {
    color: theme.colors.error,
    fontFamily: theme.typography.medium,
    fontSize: moderateScale(theme.typography.fontSize.sm),
    paddingLeft: width * 0.014,
  },

  textSuccess: {
    color: theme.colors.success,
    fontFamily: theme.typography.medium,
    fontSize: moderateScale(theme.typography.fontSize.sm),
    paddingLeft: width * 0.014,
  },

  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    paddingVertical: verticalScale(theme.spacing(1.8)),
    paddingHorizontal: scale(theme.spacing(4)),
    borderRadius: moderateScale(theme.borderRadius.large),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: width * 0.4,
  },

  buttonSecondary: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: verticalScale(theme.spacing(2)),
    paddingHorizontal: scale(theme.spacing(4)),
    borderRadius: moderateScale(theme.borderRadius.large),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: width * 0.4,
    minHeight: height * 0.06,
  },

  buttonText: {
    color: theme.colors.white,
    fontFamily: theme.typography.semiBold,
    fontSize: moderateScale(theme.typography.fontSize.md),
  },

  inputContainer: {
    marginVertical: verticalScale(theme.spacing(1.5)),
    width: '100%',
  },

  input: {
    backgroundColor: theme.colors.white,
    borderWidth: moderateScale(1),
    borderColor: theme.colors.gray,
    borderRadius: moderateScale(theme.borderRadius.medium),
    paddingVertical: verticalScale(theme.spacing(1.6)),
    paddingHorizontal: scale(theme.spacing(2)),
    fontSize: moderateScale(theme.typography.fontSize.md),
    fontFamily: theme.typography.regular,
    color: theme.colors.dark,
    minHeight: height * 0.06,
  },

  inputLabel: {
    fontFamily: theme.typography.medium,
    fontSize: moderateScale(theme.typography.fontSize.sm),
    marginBottom: verticalScale(theme.spacing(0.5)),
    paddingLeft: width * 0.01,
    color: theme.colors.dark,
  },

  card: {
    backgroundColor: theme.colors.white,
    borderRadius: moderateScale(theme.borderRadius.medium),
    padding: moderateScale(theme.spacing(2)),
    ...theme.elevation.depth2,
    width: '90%',
    alignSelf: 'center',
  },

  cardTitle: {
    fontFamily: theme.typography.bold,
    fontSize: moderateScale(theme.typography.fontSize.lg),
    color: theme.colors.dark,
    marginBottom: verticalScale(theme.spacing(1)),
  },

  cardContent: {
    fontFamily: theme.typography.regular,
    fontSize: moderateScale(theme.typography.fontSize.md),
    color: theme.colors.dark,
    lineHeight: moderateScale(theme.typography.lineHeight.md),
  },

  divider: {
    height: StyleSheet.hairlineWidth || 1,
    backgroundColor: theme.colors.gray,
    marginVertical: verticalScale(theme.spacing(2)),
  },
});
