/**
 * @file order.slice.js
 * @module Redux/Slices/Order
 * @description
 * Redux Toolkit slice managing the global state for customer orders.
 * * Core Features:
 * - Full Retrieval: Fetches the complete orders dataset for SuperAdmins.
 * - Secure Requests: Attaches Bearer tokens from localStorage.
 * - Dynamic Updates: Handles both Order Status and Payment Status updates.
 * * @requires @reduxjs/toolkit
 * @requires axios
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config.config";

const { BACKEND_API_URL } = CONFIG;

const getToken = () => localStorage.getItem("authToken");

/**
 * @function getAllOrders
 * @async
 * @description Fetches the complete list of orders from the database.
 */
export const getAllOrders = createAsyncThunk(
  "order/getAllOrders",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token)
      return rejectWithValue({
        message: "Admin is not authenticated.",
        success: false,
      });

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/order/get-all-orders`, // Ensure this matches your route
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { allOrders, message, success } = response.data;

      if (!success) throw new Error(message);

      return {
        success: true,
        message: message,
        allOrders: allOrders || response.data,
      };
    } catch (error) {
      const backendError = error.response?.data;
      return rejectWithValue({
        message: backendError?.message || error.message,
        success: false,
        status: error.response?.status || 0,
      });
    }
  },
);

/**
 * @function updateOrderStatus
 * @async
 * @description Updates the order status and/or payment status.
 * @param {{ orderId: string, status?: string, paymentStatus?: string }} payload
 */
export const updateOrderStatus = createAsyncThunk(
  "order/updateOrderStatus",
  async ({ orderId, status, paymentStatus }, { rejectWithValue }) => {
    const token = getToken();

    if (!token)
      return rejectWithValue({
        message: "Admin is not authenticated.",
        success: false,
      });

    try {
      const response = await axios.put(
        `${BACKEND_API_URL}/order/action/update-order-status/${orderId}`,
        { status, paymentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const { message, success, updatedOrderStatus } = response.data;

      if (!success) throw new Error(message);

      return {
        success: true,
        message,
        orderId,
        updatedOrderStatus, // This is the fully populated order from your backend
      };
    } catch (error) {
      const backendError = error.response?.data;
      return rejectWithValue({
        message: backendError?.message || error.message,
        success: false,
        status: error.response?.status || 0,
      });
    }
  },
);

/**
 * @function deleteOrder
 * @async
 * @description Permanently deletes an order and updates the local state.
 * @param {string} orderId
 */
export const deleteOrder = createAsyncThunk(
  "order/deleteOrder",
  async (orderId, { rejectWithValue }) => {
    const token = getToken();

    if (!token)
      return rejectWithValue({
        message: "Admin is not authenticated.",
        success: false,
      });

    try {
      const response = await axios.delete(
        `${BACKEND_API_URL}/order/delete-order/${orderId}`, // Match this to your backend route
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { message, success } = response.data;

      if (!success) throw new Error(message);

      return {
        success: true,
        message,
        orderId, // We return this to filter the state
      };
    } catch (error) {
      const backendError = error.response?.data;
      return rejectWithValue({
        message: backendError?.message || error.message,
        success: false,
        status: error.response?.status || 0,
      });
    }
  },
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    allOrders: [],
    loading: false,
    error: null,
    message: null,
    success: null,
  },
  reducers: {
    clearOrderMessages: (state) => {
      state.message = null;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* Get All Orders Cases */
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.allOrders = action.payload.allOrders;
        state.success = true;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch orders";
        state.success = false;
      })

      /* Update Order Status Cases */
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { orderId, updatedOrderStatus } = action.payload;

        // Find the index of the updated order and swap it out with the new data
        const index = state.allOrders.findIndex((o) => o._id === orderId);
        if (index !== -1) {
          state.allOrders[index] = updatedOrderStatus;
        }

        state.message = action.payload.message;
        state.success = true;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to update order status";
        state.success = false;
      })

      /* Delete Order Cases */
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        const deletedOrderId = action.payload.orderId;

        // Remove the order from the local list immediately
        state.allOrders = state.allOrders.filter(
          (order) => order._id !== deletedOrderId,
        );

        state.message = action.payload.message;
        state.success = true;
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete order";
        state.success = false;
      });
  },
});

export const { clearOrderMessages } = orderSlice.actions;

export default orderSlice.reducer;
