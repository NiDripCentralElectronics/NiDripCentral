/**
 * @file userSlice.js
 * @module Redux/Slices/User
 * @description
 * Redux Toolkit slice for managing user profile operations.
 *
 * Handles:
 * - Fetching current user profile by ID (authenticated)
 * - Updating user profile (multipart/form-data support for avatar, etc.)
 * - Deleting user account with server-side removal + local cleanup
 *
 * Features:
 * - Token-based authentication via AsyncStorage
 * - Proper loading/error state management
 * - Multipart/form-data support for profile picture uploads
 * - Safe local cleanup on delete (removes token & user data)
 * - Integration point with auth slice via clearUser action
 *
 * Exports:
 * - Thunks: getUser, updateUser, deleteAccount
 * - Action: clearUser (manual user state reset)
 * - Reducer: default export for store configuration
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const { BASE_URL } = CONFIG;

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

      await AsyncStorage.multiRemove(['authToken', 'userData']);

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
