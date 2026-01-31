/**
 * @file supportSlice.js
 * @module Redux/Slices/Support
 * @description
 * Redux Toolkit slice managing the support ticketing system.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../config/Config';

const { BACKEND_API_URL } = CONFIG;

/**
 * Create a new support ticket
 * @param {Object} ticketData - { subject, description, priority }
 */
export const createTicket = createAsyncThunk(
  'support/create',
  async (ticketData, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.post(
        `${BACKEND_API_URL}/support/create-ticket`,
        ticketData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message: backend?.message || error.message || 'Failed to create ticket',
        success: false,
      });
    }
  },
);

/**
 * Get all tickets for the authenticated user
 * @param {string} userId - The ID of the logged in user
 */
export const getUserTickets = createAsyncThunk(
  'support/getUserTickets',
  async (userId, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get(
        `${BACKEND_API_URL}/support/get-my-tickets/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message: backend?.message || 'Failed to fetch tickets',
        success: false,
      });
    }
  },
);

/**
 * Get a single ticket by ID
 * @param {string} ticketId
 */
export const getTicketById = createAsyncThunk(
  'support/getById',
  async (ticketId, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get(
        `${BACKEND_API_URL}/support/get-ticket-by-id/${ticketId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message: backend?.message || 'Ticket not found',
        success: false,
      });
    }
  },
);

/**
 * Delete/Close a ticket
 * @param {string} ticketId
 */
export const deleteTicket = createAsyncThunk(
  'support/delete',
  async (ticketId, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.delete(
        `${BACKEND_API_URL}/support/delete-ticket/${ticketId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return { ticketId, message: response.data.message, success: true };
    } catch (error) {
      const backend = error.response?.data;
      return rejectWithValue({
        message: backend?.message || 'Delete failed',
        success: false,
      });
    }
  },
);

const initialState = {
  tickets: [],
  currentTicket: null,
  loading: false,
  error: null,
  message: null,
  success: false,
};

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {
    resetSupportState: state => {
      state.loading = false;
      state.error = null;
      state.message = null;
      state.success = false;
    },
    clearCurrentTicket: state => {
      state.currentTicket = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(createTicket.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
        state.success = false;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.tickets.unshift(action.payload.newTicket);
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
        state.success = false;
      })

      .addCase(getUserTickets.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
        state.success = false;
      })
      .addCase(getUserTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload.allTickets;
        state.message = action.payload.message;
        state.success = true;
      })
      .addCase(getUserTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
        state.success = false;
      })

      .addCase(getTicketById.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
        state.success = false;
      })
      .addCase(getTicketById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTicket = action.payload.ticket;
        state.message = action.payload.message;
        state.success = true;
      })
      .addCase(getTicketById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
        state.success = false;
      })

      .addCase(deleteTicket.pending, state => {
        state.loading = true;
        state.error = null;
        state.message = null;
        state.success = false;
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = state.tickets.filter(
          t => t._id !== action.payload.ticketId,
        );
        state.message = action.payload.message;
        state.success = true;
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload?.message;
        state.success = false;
      });
  },
});

export const { resetSupportState, clearCurrentTicket } = supportSlice.actions;
export default supportSlice.reducer;
