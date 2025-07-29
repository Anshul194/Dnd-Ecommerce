// src/lib/redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/axiosConfig/axiosInstance";

// Async thunk to add an item to the cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ product, variant, quantity, price }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/cart", {
        product,
        variant,
        quantity,
        price,
      });
      return response.data.data; // Adjust based on API structure
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Add to cart failed"
      );
    }
  }
);

export const getCartItems = createAsyncThunk(
  "cart/getCartItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/cart");
      console.log("Fetched Cart Items:", {
        cartId: response.data._id,
        cartItems: response.data.items || [], // Ensure data is an array
      });
      return {
        cartId: response.data._id,
        cartItems: response.data.items || [], // Ensure data is an array
        total: response.data.total || 0,
      }; // Adjust based on API structure
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch cart items"
      );
    }
  }
);

export const removeItemFromCart = createAsyncThunk(
  "cart/removeItemFromCart",
  async (data, { rejectWithValue }) => {
    try {
      console.log("Removing Item Data:", data);
      const response = await axiosInstance.delete(`/cart`, data);
      return response.data; // Adjust based on API structure
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Remove from cart failed"
      );
    }
  }
);

// Slice
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartId: null,
    cartItems: [],
    total: 0,
    loading: false,
    error: null,
    isCartOpen: false, // sidebar state
  },
  reducers: {
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    openCart: (state) => {
      state.isCartOpen = true;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems.push(action.payload); // Add item to cart state
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCartItems.fulfilled, (state, action) => {
        console.log("PayLoad:", action.payload);
        state.loading = false;
        state.cartItems = action.payload.cartItems; // Set cart items from API
        state.cartId = action.payload.cartId; // Set cart ID from API
        state.total = action.payload.total; // Set total from API
      })
      .addCase(getCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { toggleCart, openCart, closeCart } = cartSlice.actions;
export default cartSlice.reducer;
