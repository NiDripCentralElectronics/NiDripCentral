/**
 * @file Button.jsx
 * @module Components/Button
 * @description
 * Highly customizable, theme-consistent button component with support for:
 * - Solid color or linear gradient backgrounds
 * - Loading state with centered ActivityIndicator
 * - Disabled state with visual feedback
 * - Optional Feather icon (left or right position)
 * - Custom width, text/icon colors, elevation/shadows
 * - Gradient direction and advanced LinearGradient props
 *
 * Automatically falls back to solid background when:
 * - Button is disabled
 * - Explicit backgroundColor is provided
 * - No valid gradientColors array is given
 *
 * Uses app-wide theme for colors, spacing, typography, gaps and elevation levels
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { globalStyles } from '../../../styles/GlobalStyles';
import { theme } from '../../../styles/Themes';

const Button = ({
  onPress,
  title,
  loading = false,
  style,
  textStyle,
  width,
  disabled = false,
  backgroundColor,
  gradientColors,
  textColor,
  iconName,
  iconSize = 20,
  iconColor,
  iconStyle,
  iconPosition = 'left',
  elevation,
  gradientProps = {},
}) => {
  const hasGradient =
    !disabled &&
    !backgroundColor &&
    Array.isArray(gradientColors) &&
    gradientColors.length >= 2;

  const finalBgColor = disabled
    ? theme.colors.gray
    : backgroundColor || theme.colors.primary;

  const finalTextColor = disabled ? theme.colors.dark : textColor;
  const finalIconColor = iconColor || finalTextColor;

  const renderIcon = () =>
    iconName ? (
      <Feather
        name={iconName}
        size={iconSize}
        color={finalIconColor}
        style={[styles.iconBase, iconStyle]}
      />
    ) : null;

  const content = loading ? (
    <ActivityIndicator color={finalTextColor} size="small" />
  ) : (
    <>
      {iconPosition === 'left' && renderIcon()}
      <Text
        style={[globalStyles.buttonText, { color: finalTextColor }, textStyle]}
      >
        {title}
      </Text>
      {iconPosition === 'right' && renderIcon()}
    </>
  );

  const buttonStyle = [
    globalStyles.buttonPrimary,
    elevation ? theme.elevation[elevation] : null,
    {
      width: width || '100%',
      gap: theme.gap(1),
    },
    style,
  ];

  if (disabled || !hasGradient) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={disabled ? 1 : 0.8}
        style={[...buttonStyle, { backgroundColor: finalBgColor }]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <LinearGradient
      colors={gradientColors}
      style={buttonStyle}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      {...gradientProps}
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.8}
        style={StyleSheet.absoluteFillObject}
      >
        <View style={styles.centerContent}>{content}</View>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default Button;

const styles = StyleSheet.create({
  iconBase: {
    marginHorizontal: theme.spacing(0.5),
  },

  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
