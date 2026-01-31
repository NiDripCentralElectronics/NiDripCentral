/**
 * @file userSlice.js
 * @module Redux/Slices/User
 * @description
 * Redux Toolkit slice for managing user profile operations.
 *
 * Handles:
 * - Fetching current user profile by ID (authenticated)
 * - Updating user profile (multipart/form-data support for avatar, etc.)
 * - Send Email Verification
 * - Verify Email
 * - Update User Location
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

const { BACKEND_API_URL } = CONFIG;

const getToken = async rejectWithValue => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) throw new Error('User is not authenticated');
    return token;
  } catch (error) {
    return rejectWithValue({
      message: error.message || 'Failed to retrieve authentication token',
    });
  }
};

export const getUser = createAsyncThunk(
  'user/getUser',
  async (userId, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.get(
        `${BACKEND_API_URL}/user/get-user-by-id/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return {
        user: response.data.user,
        message: response.data.message,
      };
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message: backend?.message || error.message || 'Failed to fetch user',
        status: error.response?.status || 0,
      });
    }
  },
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.patch(
        `${BACKEND_API_URL}/user/update-user/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      const { updatedUser, message, success } = response.data;

      if (!success || !updatedUser) throw new Error(message);

      return { user: updatedUser, message, success };
    } catch (error) {
      const backend = error.response?.data;

      return rejectWithValue({
        message: backend?.message || error.message || 'Failed to update user',
        status: error.response?.status || 0,
        success: backend?.success ?? false,
      });
    }
  },
);

export const requestEmailVerification = createAsyncThunk(
  'user/requestEmailVerification',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.post(
        `${BACKEND_API_URL}/user/send-verification-email`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { message, success } = response.data;

      if (!success) throw new Error(message);

      return { message, success };
    } catch (error) {
      const backend = error.response?.data;

      return rejectWithValue({
        message:
          backend?.message ||
          error.message ||
          'Failed to send verification code',
        status: error.response?.status || 0,
        success: backend?.success ?? false,
      });
    }
  },
);

export const verifyEmail = createAsyncThunk(
  'user/verifyEmail',
  async (otp, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);

      const response = await axios.post(
        `${BACKEND_API_URL}/user/verify-email`,
        { otp },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { message, success, user } = response.data;

      if (!success) throw new Error(message);

      return { message, success, user };
    } catch (error) {
      const backend = error.response?.data;

      return rejectWithValue({
        message: backend?.message || error.message || 'Verification failed',
        status: error.response?.status || 0,
        success: backend?.success ?? false,
      });
    }
  },
);

export const deleteAccount = createAsyncThunk(
  'user/deleteAccount',
  async ({ userId, reason }, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      const response = await axios.delete(
        `${BACKEND_API_URL}/user/delete-user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { reason },
        },
      );

      await AsyncStorage.removeItem('authToken');

      return response.data;
    } catch (error) {
      const backend = error.response?.data;

      return rejectWithValue({
        message:
          backend?.message || error.message || 'Failed to delete account',
        status: error.response?.status || 0,
      });
    }
  },
);

export const updateLocation = createAsyncThunk(
  'user/updateLocation',
  async ({ userId, latitude, longitude }, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      const response = await axios.patch(
        `${BACKEND_API_URL}/user/update-user-location/${userId}`,
        { latitude, longitude },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return response.data;
    } catch (error) {
      const backend = error.response?.data;

      return rejectWithValue({
        message:
          backend?.message ||
          error.message ||
          'Failed to sync location with server',
        status: error.response?.status || 0,
      });
    }
  },
);

const initialState = {
  user: null,
  loading: false,
  error: null,
  message: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: state => {
      state.user = null;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getUser.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.message = action.payload.message;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      .addCase(updateUser.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload.user };
        state.message = action.payload.message;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      .addCase(requestEmailVerification.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(requestEmailVerification.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(requestEmailVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      .addCase(verifyEmail.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        if (state.user) {
          state.user.isEmailVerified = true;
          if (action.payload.user) {
            state.user = { ...state.user, ...action.payload.user };
          }
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      .addCase(deleteAccount.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.user = null;
        state.message = action.payload?.message;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      })

      .addCase(updateLocation.pending, state => {
        state.error = null;
        state.message = null;
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.user = {
            ...state.user,
            ...action.payload.updatedLocation,
          };
        }
        state.message = action.payload?.message;
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
