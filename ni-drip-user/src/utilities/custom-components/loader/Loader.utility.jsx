/**
 * Full-screen centered loading indicator using the app's primary color.
 * Designed as a full-page loader, overlay, or Suspense fallback.
 *
 * @component
 * @example
 * ```jsx
 * // As full-screen loader
 * {isLoading && <Loader />}
 *
 * // As Suspense fallback
 * <Suspense fallback={<Loader />}>
 *   <HeavyComponent />
 * </Suspense>
 *
 * // With custom size
 * <Loader size="small" color={theme.colors.secondary} />
 * ```
 *
 * @param {('small'|'large')} [size='large'] - Size of the spinner
 * @param {string} [color] - Override default primary color
 * @param {StyleProp<ViewStyle>} [style] - Additional styles for the container
 */
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { theme } from '../../../styles/Themes';
import { globalStyles } from '../../../styles/GlobalStyles';

export default function Loader({
  size = 'large',
  color,
  style,
}) {
  return (
    <View style={[globalStyles.container, styles.container, style]}>
      <ActivityIndicator
        size={size}
        color={color || theme.colors.primary}
        accessibilityLabel="Loading"
        accessibilityHint="Content is being loaded"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // optional subtle overlay
  },
});