/**
 * @file AppNavigator.jsx
 * @description
 * Main navigation structure using React Navigation's native stack navigator.
 * Features:
 * - Hidden headers by default
 * - Dynamic StatusBar color control (passed down via prop)
 * - Splash screen as initial route
 *
 * This file will typically grow to include all main app screens and auth flows.
 *
 * @component
 */
import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../styles/Themes';

import Splash from '../screens/splash-screen/Splash';

const Stack = createNativeStackNavigator();

/**
 * Root application navigator with dynamic status bar color support.
 * The status bar color can be changed from any screen by calling the
 * setStatusBarColor function passed via props.
 */
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
          animation: 'fade_from_bottom', // smooth modern feel
          gestureEnabled: true,
        }}
      >
        {/* ── Entry / Auth Flow ── */}
        <Stack.Screen name="Splash">
          {props => <Splash {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>
      </Stack.Navigator>
    </>
  );
};

export default AppNavigator;
