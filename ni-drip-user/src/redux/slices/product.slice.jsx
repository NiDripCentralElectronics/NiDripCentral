/**
 * @file productSlice.js
 * @module Redux/Slices/Product
 * @description
 * Redux Toolkit slice managing product data and catalog operations.
 *
 * Handles:
 * - Fetching all products from the backend via JWT-authorized requests
 * - State management for product listing (loading, success, and error states)
 * - AsyncStorage integration for token retrieval during API calls
 * - Global product state storage for cross-component access
 *
 * Features:
 * - Robust error handling with rejectWithValue for network and server errors
 * - Automated state updates for pending, fulfilled, and rejected transitions
 * - Configurable request timeouts for better mobile UX
 * - Manual state clearance for clean navigation
 *
 * Exports:
 * - Thunks: getAllProducts
 * - Action: clearProductState
 * - Reducer: default export for store configuration
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const { BACKEND_API_URL } = CONFIG;

export const getAllProducts = createAsyncThunk(
  'product/getAllProducts',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        return rejectWithValue({
          message: 'Authentication token missing.',
          success: false,
        });
      }

      const response = await axios.get(
        `${BACKEND_API_URL}/product/get-all-products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      const { allProducts, products, message, success } = response.data;

      if (success === false) {
        return rejectWithValue({
          message: message || 'Failed to fetch products',
          success: false,
        });
      }

      return {
        products: allProducts || products || [],
        message: message || 'Success',
        success: true,
      };
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message || error.message || 'Network Error',
        success: false,
        status: error.response?.status || 0,
      });
    }
  },
);

const initialState = {
  products: [],
  loading: false,
  error: null,
  message: null,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },

    clearProductState: state => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getAllProducts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.message = action.payload.message;
        state.error = null;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setProducts, clearProductState } = productSlice.actions;
export default productSlice.reducer;
