import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/axiosConfig/axiosInstance";
import { ChevronsUp } from "lucide-react";

// Async thunk to fetch product attributes by title "Style"
export const fetchAttributesByTitle = createAsyncThunk(
  "attributes/fetchByTitle",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        '/api/productattribute?filters={"title":"Home page Styles"}',
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Response from fetchAttributesByTitle:",
        response.data?.data?.data[0]?.terms
      );
      // Extract terms from the response
      const terms = response.data?.data?.data[0]?.terms || [];

      return terms;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch attributes"
      );
    }
  }
);

const attributesSlice = createSlice({
  name: "attributes",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttributesByTitle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttributesByTitle.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAttributesByTitle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default attributesSlice.reducer;
