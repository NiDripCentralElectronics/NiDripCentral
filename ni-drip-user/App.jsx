/**
 * @file App.js
 * @module App
 * @description
 * Root entry point of the React Native application.
 *
 * Serves as the top-level component responsible for:
 * - Mounting the primary navigation structure via {@link RootNavigator}
 * - Initializing the global toast notification system (react-native-toast-message)
 *   with custom styling aligned to the application's design system
 *
 * Features custom success & error toasts with:
 * - Branded colors from the theme
 * - Responsive sizing based on screen width
 * - Consistent typography, spacing, border radius and shadow styling
 * - Custom leading icons using MaterialCommunityIcons
 */

import React from 'react';
import { Dimensions } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import Toast, { ErrorToast, SuccessToast } from 'react-native-toast-message';
import { theme } from './src/styles/Themes';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('screen');

const App = () => {
  const toastConfig = {
    success: props => (
      <SuccessToast
        {...props}
        style={{
          borderLeftColor: theme.colors.success,
          backgroundColor: theme.colors.white,
          borderRadius: theme.borderRadius.medium,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowOffset: { SCREEN_WIDTH: 0, height: 4 },
          shadowRadius: 6,
          paddingHorizontal: SCREEN_WIDTH * 0.012,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        contentContainerStyle={{
          paddingHorizontal: SCREEN_WIDTH * 0.012,
          flex: 1,
        }}
        text1Style={{
          fontSize: SCREEN_WIDTH * 0.04,
          fontFamily: theme.typography.inter.bold,
          color: theme.colors.success,
        }}
        text2Style={{
          fontSize: SCREEN_WIDTH * 0.037,
          fontFamily: theme.typography.inter.regular,
          color: theme.colors.secondary,
        }}
        renderLeadingIcon={() => (
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color={theme.colors.success}
            style={{ marginRight: SCREEN_WIDTH * 0.04 }}
          />
        )}
      />
    ),

    error: props => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: theme.colors.error,
          backgroundColor: theme.colors.white,
          borderRadius: theme.borderRadius.medium,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowOffset: { SCREEN_WIDTH: 0, height: 4 },
          shadowRadius: 6,
          paddingHorizontal: SCREEN_WIDTH * 0.012,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        contentContainerStyle={{
          paddingHorizontal: SCREEN_WIDTH * 0.012,
          flex: 1,
        }}
        text1Style={{
          fontSize: SCREEN_WIDTH * 0.04,
          fontFamily: theme.typography.inter.bold,
          color: theme.colors.error,
        }}
        text2Style={{
          fontSize: SCREEN_WIDTH * 0.037,
          fontFamily: theme.typography.inter.regular,
          color: theme.colors.secondary,
        }}
        renderLeadingIcon={() => (
          <MaterialCommunityIcons
            name="alert-circle"
            size={24}
            color={theme.colors.error}
            style={{ marginRight: SCREEN_WIDTH * 0.04 }}
          />
        )}
      />
    ),
  };

  return (
    <>
      <RootNavigator />
      <Toast config={toastConfig} />
    </>
  );
};

export default App;
