/**
 * @component Button
 * @description A highly customizable and responsive button component using the application's design system.
 * Supports linear gradient backgrounds for primary/colored buttons.
 *
 * @param {Object} props
 * @param {() => void} props.onPress - Function to call on button press.
 * @param {string} props.title - The text to display inside the button.
 * @param {boolean} [props.loading=false] - If true, shows an ActivityIndicator.
 * @param {import('react-native').ViewStyle} [props.style] - Custom styles for the button container.
 * @param {import('react-native').TextStyle} [props.textStyle] - Custom styles for the button text.
 * @param {number|string} [props.width] - Set a specific width for the button ('100%', number, or undefined).
 * @param {boolean} [props.disabled=false] - If true, disables interaction and grays out the button.
 * @param {string} [props.backgroundColor] - Override solid background color (disables gradient when set).
 * @param {string[]} [props.gradientColors] - Array of 2–3 colors for linear gradient (e.g. [theme.colors.primary, '#d81b60']).
 * @param {string} [props.textColor=theme.colors.white] - Color of the text and icon.
 * @param {string} [props.iconName] - Name of the Feather icon to display.
 * @param {number} [props.iconSize=20] - Size of the icon.
 * @param {string} [props.iconColor] - Override color for the icon specifically.
 * @param {import('react-native').ViewStyle} [props.iconStyle] - Custom styles for the icon wrapper.
 * @param {'left' | 'right'} [props.iconPosition='left'] - Position of the icon relative to the text.
 * @param {keyof typeof theme.elevation} [props.elevation] - Apply a specific shadow depth from theme.
 * @param {Object} [props.gradientProps] - Extra props passed to LinearGradient (start, end, locations, angle, etc.)
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
        {/* Center content */}
        <View style={styles.centerContent}>{content}</View>
      </TouchableOpacity>
    </LinearGradient>
  );
};

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

export default Button;
