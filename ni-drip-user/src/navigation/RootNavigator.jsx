/**
 * @file RootNavigator.jsx
 * @module Navigation/RootNavigator
 * @description
 * Top-level application wrapper that composes the core infrastructure:
 *
 * - Redux Provider (makes store available to all components)
 * - Redux Persist Gate (handles state rehydration from AsyncStorage)
 * - NavigationContainer (required root for React Navigation)
 * - Main app navigation structure (AppNavigator)
 *
 * This component serves as the single entry point for the entire app UI.
 * It is typically rendered directly in index.js or App.js.
 *
 * Features:
 * - Seamless persistence of authentication state across app restarts
 * - Proper loading state handling during persist rehydration
 * - Centralized navigation context for deep linking, screen transitions, etc.
 *
 * @example
 * // index.js or App.js
 * import RootNavigator from './navigation/RootNavigator';
 *
 * export default function App() {
 *   return <RootNavigator />;
 * }
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../redux/store/store';
import AppNavigator from './AppNavigator';

const RootNavigator = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

export default RootNavigator;
