/**
 * @file review.slice.js
 * @module Redux/Slices/Review
 * @description
 * Redux Toolkit slice managing product reviews, including adding,
 * updating, and deleting reviews with backend synchronization.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const { BACKEND_API_URL } = CONFIG;

/**
 * Add a new review to a product
 * @param {Object} data - Contains productId and reviewText
 */
export const addReview = createAsyncThunk(
  'reviews/add',
  async ({ productId, reviewText }, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.post(
        `${BACKEND_API_URL}/review/add-review`,
        { productId, reviewText },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to add review' },
      );
    }
  },
);

/**
 * Update an existing review
 * @param {Object} data - Contains reviewId and new reviewText
 */
export const updateReview = createAsyncThunk(
  'reviews/update',
  async ({ reviewId, reviewText }, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.put(
        `${BACKEND_API_URL}/review/update-review/${reviewId}`,
        { reviewText },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to update review' },
      );
    }
  },
);

/**
 * Delete a review
 * @param {string} reviewId
 */
export const deleteReview = createAsyncThunk(
  'reviews/delete',
  async (reviewId, { rejectWithValue }) => {
    // Prevent sending "undefined" to the server
    if (!reviewId || reviewId.includes('local')) {
      return rejectWithValue({
        message: "Cannot delete a review that hasn't been synced yet.",
      });
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.delete(
        `${BACKEND_API_URL}/review/delete-review/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // Return reviewId so we can filter it out of the state
      return { reviewId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to delete review' },
      );
    }
  },
);

const initialState = {
  reviews: [],
  loading: false,
  error: null,
  message: null,
  success: false,
};

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    resetReviewState: state => {
      state.loading = false;
      state.error = null;
      state.message = null;
      state.success = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(addReview.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        if (action.payload.newReview) {
          state.reviews.unshift(action.payload.newReview);
        }
      })
      .addCase(addReview.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
        state.message = action.payload?.message || 'Error submitting review';
      })

      .addCase(updateReview.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        const index = state.reviews.findIndex(
          r => r._id === action.payload.updatedReview?._id,
        );
        if (index !== -1) {
          state.reviews[index] = action.payload.updatedReview;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
        state.message = action.payload?.message || 'Error updating review';
      })
      .addCase(deleteReview.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.reviews = state.reviews.filter(
          r => r._id !== action.payload.reviewId,
        );
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
        state.message = action.payload?.message || 'Error deleting review';
      });
  },
});

export const { resetReviewState } = reviewSlice.actions;
export default reviewSlice.reducer;
