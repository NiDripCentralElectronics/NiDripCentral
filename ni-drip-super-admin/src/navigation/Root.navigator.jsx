/**
 * @file Root.navigator.jsx
 * @module Navigation/Root
 * @description
 * The entry-point provider architecture for the application.
 * * **Responsibility:**
 * This component acts as the "Shell" of the application, injecting all necessary
 * global contexts. It ensures that state management, persistence, and routing
 * are initialized before the UI components are rendered.
 * * **Provider Stack:**
 * 1. **Redux Provider:** Injects the global store.
 * 2. **PersistGate:** Delays rendering until the persisted state is rehydrated.
 * 3. **Router (Routes):** Manages top-level URL matching for the sub-navigator.
 */

import { Routes, Route } from "react-router-dom";
import AppNavigator from "./App.navigator.jsx";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../redux/store/store.store";

/**
 * Wraps the app with Redux Provider, PersistGate,
 * and React Router's route configuration.
 *
 * @returns {JSX.Element} The root navigation and provider setup.
 */
const RootNavigator = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Routes>
          <Route path="/*" element={<AppNavigator />} />
        </Routes>
      </PersistGate>
    </Provider>
  );
};

export default RootNavigator;
