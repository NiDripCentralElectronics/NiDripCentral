/**
 * @file authSlice.js
 * @module Redux/Slices/Auth
 * @description
 * Redux Toolkit slice managing the complete authentication flow.
 *
 * Handles:
 * - User registration (multipart/form-data support for profile pictures etc.)
 * - User login with JWT token storage in AsyncStorage
 * - Secure logout (server-side invalidation + local token clearance)
 * - Initial auth state check on app start (token validation + user fetch)
 *
 * Features:
 * - Proper loading, success, error, and message states
 * - Async thunks with rejectWithValue for clean error handling
 * - Automatic token persistence & removal
 * - Fail-safe local logout even if server request fails
 * - Optional server-side token verification on checkAuth
 *
 * Exports:
 * - Thunks: registerUser, loginUser, logoutUser, checkAuth, forgotPassword, resetPassword
 * - Action: clearAuthState (manual reset)
 * - Reducer: default export for store configuration
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const { BACKEND_API_URL } = CONFIG;

/**
 * Register a new user (supports file upload e.g. profile picture)
 * @param {Object} formData - FormData object containing registration fields
 */
export const registerUser = createAsyncThunk(
  'user/register',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BACKEND_API_URL}/user/signup-user`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      const { message, success, user } = response.data;

      if (typeof success !== 'boolean') {
        throw new Error('Invalid registration response');
      }

      // Return user if backend provides it; always return message
      return { message, success, user: user ?? null };
    } catch (error) {
      const backend = error.response?.data;

      return rejectWithValue({
        message: backend?.message || error.message || 'Registration failed',
        success: backend?.success ?? false,
        status: error.response?.status || 0,
      });
    }
  },
);

/**
 * Login user and store JWT token
 * @param {Object} loginData - { email, password }
 */
export const loginUser = createAsyncThunk(
  'user/login',
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BACKEND_API_URL}/user/signin-user`,
        loginData,
      );

      const { token, user, message, success } = response.data;

      if (!success || !token || !user) {
        throw new Error('Invalid login response');
      }

      await AsyncStorage.setItem('authToken', token);

      return { user, token, message, success: true };
    } catch (error) {
      const backend = error.response?.data;

      return rejectWithValue({
        message: backend?.message || error.message || 'Login failed',
        success: backend?.success ?? false,
        status: error.response?.status || 0,
      });
    }
  },
);

/**
 * Forgot Password
 * @param {Object} data - { email, role }
 */
export const forgotPassword = createAsyncThunk(
  'user/forgot-password',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BACKEND_API_URL}/auth/forgot-password`,
        {
          email,
          role: 'USER',
        },
      );

      const { message, success } = response.data;

      if (!success) throw new Error(message || 'Forgot password failed');

      return { message, success: true };
    } catch (error) {
      const backend = error.response?.data;

      return rejectWithValue({
        message: backend?.message || error.message || 'Forgot password failed',
        success: backend?.success ?? false,
        status: error.response?.status || 0,
      });
    }
  },
);

/**
 * Reset Password
 * @param {Object} data - { newPassword, token }
 */
export const resetPassword = createAsyncThunk(
  'user/reset-password',
  async ({ newPassword, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BACKEND_API_URL}/auth/reset-password/${token}`,
        {
          newPassword,
          role: 'USER',
        },
      );

      const { message, success } = response.data;

      if (!success) throw new Error(message || 'Reset failed');

      return { message, success: true };
    } catch (error) {
      const backend = error.response?.data;

      return rejectWithValue({
        message: backend?.message || error.message || 'Reset failed',
        success: backend?.success ?? false,
        status: error.response?.status || 0,
      });
    }
  },
);

/**
 * Logout user - calls server logout endpoint and clears local token
 */
export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      const response = await axios.post(
        `${BACKEND_API_URL}/user/logout-user`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      await AsyncStorage.removeItem('authToken');

      // Return backend data (likely includes message)
      return response.data;
    } catch (error) {
      // ensure local logout even if server fails
      await AsyncStorage.removeItem('authToken');

      const backend = error.response?.data;
      return rejectWithValue(
        backend?.message || error.message || 'Logout failed',
      );
    }
  },
);

/**
 * Check Auth
 */
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        return { isAuthenticated: false, message: 'No token found' };
      }

      const response = await axios.get(`${BACKEND_API_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return {
        isAuthenticated: true,
        user: response.data.user,
        token,
        message: response.data.message ?? 'Authenticated',
      };
    } catch (error) {
      await AsyncStorage.removeItem('authToken');
      const backend = error.response?.data;
      return rejectWithValue({
        isAuthenticated: false,
        message: backend?.message || error.message || 'Auth check failed',
      });
    }
  },
);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  message: null,
};

const getMessageFromPayload = actionPayload => {
  if (!actionPayload) return null;
  if (typeof actionPayload === 'string') return actionPayload;
  if (actionPayload.message) return actionPayload.message;
  return null;
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthState: state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: builder => {
    builder
      // registerUser
      .addCase(registerUser.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        // backend may or may not send a user object on registration
        if (action.payload?.user) {
          state.user = action.payload.user;
        }
        state.message = action.payload?.message ?? null;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error?.message;
        state.message =
          getMessageFromPayload(action.payload) ??
          action.error?.message ??
          null;
      })

      // loginUser
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = !!action.payload.token;
        state.message = action.payload?.message ?? null;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error?.message;
        state.message =
          getMessageFromPayload(action.payload) ??
          action.error?.message ??
          null;
      })

      // forgotPassword
      .addCase(forgotPassword.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload?.message ?? 'Password reset email sent';
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error?.message;
        state.message =
          getMessageFromPayload(action.payload) ??
          action.error?.message ??
          null;
      })

      // resetPassword
      .addCase(resetPassword.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload?.message ?? 'Password reset successful';
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error?.message;
        state.message =
          getMessageFromPayload(action.payload) ??
          action.error?.message ??
          null;
      })

      // logoutUser
      .addCase(logoutUser.pending, state => {
        state.loading = true;
        state.message = null;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.message = action.payload?.message ?? 'Logged out successfully';
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error?.message;
        state.message =
          getMessageFromPayload(action.payload) ??
          action.error?.message ??
          null;
        // still ensure local state is cleared
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })

      // checkAuth
      .addCase(checkAuth.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.message = action.payload?.message ?? null;
        if (action.payload.isAuthenticated) {
          state.user = action.payload.user;
          state.token = action.payload.token;
        } else {
          state.user = null;
          state.token = null;
        }
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload ?? action.error?.message;
        state.message =
          getMessageFromPayload(action.payload) ??
          action.error?.message ??
          null;
      });
  },
});

export const { clearAuthState } = authSlice.actions;
export default authSlice.reducer;
