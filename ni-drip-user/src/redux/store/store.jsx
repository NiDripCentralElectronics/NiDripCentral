import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import authReducer from '../slices/auth.slice';
import userReducer from '../slices/user.slice';
import productReducer from '../slices/product.slice';
import supportReducer from '../slices/support.slice';
import favoriteReducer from '../slices/favorite.slice';
import reviewReducer from '../slices/review.slice';
import ratingReducer from '../slices/rating.slice';
import cartReducer from '../slices/cart.slice';
import orderReducer from '../slices/order.slice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  product: productReducer,
  support: supportReducer,
  favorites: favoriteReducer,
  reviews: reviewReducer,
  rating: ratingReducer,
  cart: cartReducer,
  order: orderReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

const persistor = persistStore(store);

export { store, persistor };
