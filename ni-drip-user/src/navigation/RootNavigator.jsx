/**
 * @file RootNavigator.jsx
 * @description
 * Top-level app wrapper that composes:
 *  - Redux store + persistence (redux-persist)
 *  - React Navigation root container
 *  - Main app navigator (AppNavigator)
 *
 * This is typically the root component rendered in index.js / App.js
 *
 * @component
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

/**
 * Root-level component that sets up:
 * - Redux Provider
 * - Redux Persist Gate (handles rehydration)
 * - NavigationContainer (required for react-navigation)
 * - Main application navigator
 */
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
