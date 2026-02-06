/**
 * @fileoverview Order slice - handles order placement and Stripe payment
 * @module redux/slices/order.slice
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import CONFIG from '../config/Config';

const { BACKEND_API_URL } = CONFIG;

const getToken = async rejectWithValue => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) throw new Error('User is not authenticated.');
    return token;
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to fetch token.');
  }
};

/**
 * Place an order and get Stripe client secret
 * @param {Object} orderData - { shippingAddress, shippingCost }
 * @returns {Object} { order, clientSecret }
 */
export const placeOrder = createAsyncThunk(
  'order/placeOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.post(
        `${BACKEND_API_URL}/order/place-order`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        order: response.data.order,
        clientSecret: response.data.clientSecret,
        summary: response.data.summary,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

/**
 * Get all orders for the current user
 */
export const getUserOrders = createAsyncThunk(
  'order/getUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.get(
        `${BACKEND_API_URL}/order/get-my-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data.orders;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

/**
 * Cancel an order
 */
export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async ({ orderId, reasonForCancel }, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.put(
        `${BACKEND_API_URL}/order/action/cancel-order/${orderId}`,
        { reasonForCancel },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return { orderId, status: response.data.orderStatus };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    currentOrder: null,
    clientSecret: null,
    loading: false,
    error: null,
    paymentSuccess: false,
  },
  reducers: {
    clearCurrentOrder: state => {
      state.currentOrder = null;
      state.clientSecret = null;
      state.paymentSuccess = false;
    },
    setPaymentSuccess: (state, action) => {
      state.paymentSuccess = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Place Order
      .addCase(placeOrder.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
        state.clientSecret = action.payload.clientSecret;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get User Orders
      .addCase(getUserOrders.pending, state => {
        state.loading = true;
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cancel Order
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(
          o => o._id === action.payload.orderId,
        );
        if (index !== -1) {
          state.orders[index].status = 'CANCELLED';
        }
      });
  },
});

export const { clearCurrentOrder, setPaymentSuccess, clearError } =
  orderSlice.actions;
export default orderSlice.reducer;
