import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosConfig/axiosInstance";

// Async thunk to fetch sizes
export const fetchSizes = createAsyncThunk(
  "size/fetchSizes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/size", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Fetched Sizes:", response.data);
      return response.data?.body?.data?.result;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Slice for sizes
const sizeSlice = createSlice({
  name: "size",
  initialState: {
    sizes: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSizes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSizes.fulfilled, (state, action) => {
        state.loading = false;
        state.sizes = action.payload;
      })
      .addCase(fetchSizes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default sizeSlice.reducer;
