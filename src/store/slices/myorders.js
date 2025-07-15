"use client";

import axiosInstance from "@/axiosConfig/axiosInstance";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Thunk to fetch order history
export const fetchOrderHistory = createAsyncThunk(
  "order/fetchOrderHistory",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/order?user_id=${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Order History Response:", response.data);
      return response.data?.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching order history"
      );
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    data: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderHistory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOrderHistory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchOrderHistory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default orderSlice.reducer;
