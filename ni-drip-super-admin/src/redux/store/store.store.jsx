/**
 * @file Store.config.js
 * @module Core/Redux/Store
 * @description 
 * Centralized Application Store configuration. 
 * * **Key Components:**
 * - **Redux Toolkit:** Handles state management with a simplified API.
 * - **Redux Persist:** Enables state persistence across browser sessions.
 * - **Persistence Strategy:** Selective whitelisting to balance performance and user experience.
 * * @requires redux-persist
 * @requires @reduxjs/toolkit
 */

import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { combineReducers } from "redux";
import authReducer from "../slices/auth.slice";
import superAdminReducer from "../slices/super-admin.slice";
import productReducer from "../slices/product.slice";
import reviewReducer from "../slices/review.slice";
import supportReducer from "../slices/support.slice";
import userReducer from "../slices/user.slice";
import orderReducer from "../slices/order.slice";

/**
 * A wrapper around localStorage to provide async-like
 * behavior for Redux Persist compatibility.
 */
const localStorageWrapper = {
  getItem: (key) => {
    return new Promise((resolve) => {
      resolve(localStorage.getItem(key));
    });
  },
  setItem: (key, value) => {
    return new Promise((resolve) => {
      localStorage.setItem(key, value);
      resolve();
    });
  },
  removeItem: (key) => {
    return new Promise((resolve) => {
      localStorage.removeItem(key);
      resolve();
    });
  },
};

/**
 * Persistence configuration for Redux Persist.
 * Only the `auth` slice is whitelisted for persistence.
 */
const persistConfig = {
  key: "root",
  storage: localStorageWrapper,
  whitelist: ["auth"],
};

/**
 * Root reducer combining all feature slices.
 */
const rootReducer = combineReducers({
  auth: authReducer,
  superAdmin: superAdminReducer,
  products: productReducer,
  reviews: reviewReducer,
  support: supportReducer,
  users: userReducer,
  orders: orderReducer,
});

/**
 * Wraps the root reducer with persistence capabilities.
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Redux store instance with persistence and middleware setup.
 */
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/REHYDRATE"],
      },
    }),
});

/**
 * Redux Persist persistor instance, used to persist and rehydrate the store.
 */
const persistor = persistStore(store);

export { store, persistor };
