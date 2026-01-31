/**
 * @file rating.slice.js
 * @module Redux/Slices/Rating
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const { BACKEND_API_URL } = CONFIG;

/**
 * Add or update rating for a product
 */
export const addRating = createAsyncThunk(
  'ratings/add',
  async ({ productId, stars }, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      const response = await axios.post(
        `${BACKEND_API_URL}/rating/add-rating`,
        { productId, stars },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // SUCCESS → return backend payload directly
      return response.data;
    } catch (error) {
      // ERROR → always return backend message
      if (error.response?.data) {
        return rejectWithValue(error.response.data);
      }

      return rejectWithValue({
        success: false,
        message: 'Network error. Please try again.',
      });
    }
  },
);

const initialState = {
  loading: false,
  error: null,
  message: null,
  success: false,

  averageRating: 0,
  totalRatings: 0,
};

const ratingSlice = createSlice({
  name: 'ratings',
  initialState,
  reducers: {
    resetRatingState: state => {
      state.loading = false;
      state.error = null;
      state.message = null;
      state.success = false;
    },
  },
  extraReducers: builder => {
    builder
      // ADD RATING
      .addCase(addRating.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })

      .addCase(addRating.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        // backend message
        state.message = action.payload?.message;

        if (action.payload?.stats) {
          state.averageRating = action.payload.stats.averageRating;
          state.totalRatings = action.payload.stats.totalRatings;
        }
      })

      .addCase(addRating.rejected, (state, action) => {
        state.loading = false;
        state.success = false;

        // backend error payload
        state.error = action.payload;
        state.message = action.payload?.message || 'Failed to submit rating';
      });
  },
});

export const { resetRatingState } = ratingSlice.actions;

export default ratingSlice.reducer;
