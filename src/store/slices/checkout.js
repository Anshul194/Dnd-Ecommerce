import axiosInstance from "@/axiosConfig/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
const initialState = {
  loading: false,
  error: null,
  data: null,
};

export const checkout = createAsyncThunk(
  "checkout/submit",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/api/order",
        {
          ...data,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      localStorage.removeItem("cart");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkout.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(checkout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default checkoutSlice.reducer;
