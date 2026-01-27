/**
 * @file AppNavigator.jsx
 * @module Navigation/AppNavigator
 * @description
 * Root navigation setup using React Navigation's Native Stack Navigator.
 *
 * Responsibilities:
 * - Defines the main app navigation structure
 * - Manages global StatusBar appearance (color + light-content style)
 * - Starts with cinematic Splash screen as entry point
 * - Provides dynamic status bar color control to child screens
 * - Applies consistent screen options: no headers, fade-from-bottom transitions
 *
 * Current structure:
 * - Splash screen (initial route)
 * - Designed to expand with authentication flow, main app screens, modals, etc.
 *
 * Features:
 * - Global StatusBar management with runtime color updates
 * - Smooth modern screen transitions
 * - Gesture navigation enabled
 * - Theme-integrated default status bar color
 */

import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../styles/Themes';

import Splash from '../screens/splash-screen/Splash';
import OnBoarding from '../screens/onboarding-screen/OnBoarding'

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [statusBarColor, setStatusBarColor] = useState(theme.colors.primary);

  return (
    <>
      <StatusBar
        backgroundColor={statusBarColor}
        barStyle="light-content"
        translucent={false}
      />

      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="Splash">
          {props => <Splash {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

         <Stack.Screen name="OnBoarding">
          {props => <OnBoarding {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

      </Stack.Navigator>
    </>
  );
};

export default AppNavigator;
