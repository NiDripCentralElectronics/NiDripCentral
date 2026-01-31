/**
 * @file Loader.jsx
 * @module Components/Loader
 * @description
 * Simple, full-screen centered loading indicator component.
 * Uses React Native's ActivityIndicator with app theme primary color by default.
 *
 * Designed for:
 * - Full-page loading states / overlays
 * - Suspense fallback during component lazy-loading
 * - Inline or section-level loading indicators
 *
 * Features:
 * - Responsive size options (small/large)
 * - Custom color override
 * - Accessibility support (label & hint)
 * - Centered positioning with optional subtle backdrop overlay
 * - Compatible with global container styles
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { theme } from '../../../styles/Themes';
import { globalStyles } from '../../../styles/GlobalStyles';

export default function Loader({ size = 'large', color, style }) {
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
  },
});
