/**
 * @file userSlice.js
 * @description
 * Redux Toolkit slice + thunks for user profile management:
 * - Fetch current user by ID
 * - Update user profile (supports multipart/form-data for image upload etc.)
 * - Delete user account (with local cleanup)
 *
 * Handles authentication via stored JWT token in AsyncStorage.
 * Integrates with auth slice via dispatched actions (clearUser).
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const { BASE_URL } = CONFIG;

// ── Helper: Get auth token with rejection ───────────────────────
const getToken = async rejectWithValue => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      throw new Error('User is not authenticated');
    }
    return token;
  } catch (error) {
    return rejectWithValue(
      error.message || 'Failed to retrieve authentication token',
    );
  }
};

// ── Async Thunks ────────────────────────────────────────────────

/**
 * Fetch user profile by ID
 * @param {string} userId - The ID of the user to fetch
 */
export const getUser = createAsyncThunk(
  'user/getUser',
  async (userId, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.get(
        `${BASE_URL}/user/get-user-by-id/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || 'Failed to fetch user',
        },
      );
    }
  },
);

/**
 * Update user profile (supports file uploads like profile picture)
 * @param {{ userId: string, formData: FormData }} payload
 */
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.patch(
        `${BASE_URL}/user/update-user/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      return response.data.updatedUser;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: error.message || 'Failed to update profile',
        },
      );
    }
  },
);

/**
 * Delete user account and clean up local storage
 * @param {string} userId - ID of the user to delete
 */
export const deleteAccount = createAsyncThunk(
  'user/deleteAccount',
  async (userId, { rejectWithValue, dispatch }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.delete(
        `${BASE_URL}/user/delete-user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Account deletion failed');
      }

      // Clean up local storage
      await AsyncStorage.multiRemove(['authToken', 'userData']);

      // Clear user state (assuming this is dispatched from auth or user slice)
      dispatch(clearUser());

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete account',
      );
    }
  },
);

// ── Slice ───────────────────────────────────────────────────────

const initialState = {
  user: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: state => {
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // ── Get User ──
      .addCase(getUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Update User ──
      .addCase(updateUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── Delete Account ──
      .addCase(deleteAccount.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, state => {
        state.loading = false;
        state.user = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
