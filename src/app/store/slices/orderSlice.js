// src/lib/redux/slices/orderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/axiosConfig/axiosInstance";

// Async thunk to fetch all orders
export const fetchOrders = createAsyncThunk(
  "order/fetchOrders",
  async (payload) => {
    const queryParams = new URLSearchParams();
    payload.page && queryParams.append("page", payload.page);
    payload.limit && queryParams.append("limit", payload.limit);
    payload.sortBy && queryParams.append("sortBy", payload.sortBy);

    // if (payload.userId) {
    //   queryParams.append("userId", payload.userId);
    // }
    if (payload.status) {
      queryParams.append("status", payload.status);
    }

    const response = await axiosInstance.get(`/orders/place`, {
      params: queryParams,
    });

    console.log("Orders Data:", response.data.data);
    return response.data.data;
  }
);

// Async thunk to fetch a single order by ID
export const fetchOrderById = createAsyncThunk(
  "order/fetchOrderById",
  async (id) => {
    const response = await axiosInstance.get(`/orders/${id}`);
    console.log("Order Details:------------->", response);
    return response.data.data;
  }
);

// Slice
const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all orders
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
        state.error = action.error.message;
      })

      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default orderSlice.reducer;
