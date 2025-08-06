// src/lib/redux/slices/orderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/axiosConfig/axiosInstance";

// 🔄 Async thunk to fetch orders
export const fetchOrders = createAsyncThunk(
    "order/fetchOrders",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/orders/place");
            console.log("Fetched orders response:", response.data); // Added console log
            return response.data?.data || []; // Fixed: orders are in response.data.data
        } catch (error) {
            console.log("Error fetching orders:", error); // Added console log
            return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
        }
    }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default orderSlice.reducer;
