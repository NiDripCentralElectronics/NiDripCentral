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

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.post(
        `${BACKEND_API_URL}/cart/add-to-cart`,
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.cartItem;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const decreaseCartItem = createAsyncThunk(
  'cart/decreaseCartItem',
  async ({ productId }, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.post(
        `${BACKEND_API_URL}/cart/remove-from-cart`,
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return { productId, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const removeProductFromCart = createAsyncThunk(
  'cart/removeProductFromCart',
  async ({ productId }, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.post(
        `${BACKEND_API_URL}/cart/remove-product-from-cart`,
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return { productId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getAllCartItems = createAsyncThunk(
  'cart/getAllCartItems',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken(rejectWithValue);
      const response = await axios.get(`${BACKEND_API_URL}/cart/get-cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.items;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartItems: [],
    loading: false,
    error: null,
    cartTotal: 0,
    itemsCount: 0,
  },
  reducers: {
    clearLocalCart: state => {
      state.cartItems = [];
      state.cartTotal = 0;
      state.itemsCount = 0;
    },
  },
  extraReducers: builder => {
    builder

      .addCase(getAllCartItems.pending, state => {
        state.loading = true;
      })
      .addCase(getAllCartItems.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
      })
      .addCase(getAllCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        const newItem = action.payload;
        const index = state.cartItems.findIndex(
          item => item.productId._id === newItem.productId._id,
        );
        if (index !== -1) {
          state.cartItems[index] = newItem;
        } else {
          state.cartItems.unshift(newItem);
        }
      })

      .addCase(decreaseCartItem.fulfilled, (state, action) => {
        const { productId } = action.payload;
        const index = state.cartItems.findIndex(
          item => item.productId._id === productId,
        );
        if (index !== -1) {
          if (state.cartItems[index].quantity > 1) {
            state.cartItems[index].quantity -= 1;
            state.cartItems[index].totalPrice -=
              state.cartItems[index].unitPrice;
          } else {
            state.cartItems.splice(index, 1);
          }
        }
      })

      .addCase(removeProductFromCart.fulfilled, (state, action) => {
        state.cartItems = state.cartItems.filter(
          item => item.productId._id !== action.payload.productId,
        );
      });
  },
});

export const { clearLocalCart } = cartSlice.actions;
export default cartSlice.reducer;
