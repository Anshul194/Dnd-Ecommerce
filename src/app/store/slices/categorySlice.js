// src/lib/redux/slices/categorySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/axiosConfig/axiosInstance";

export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async (_, { getState }) => {
    const response = await axiosInstance.get("/category");
    return response.data.data.body.data.result;
  },
  {
    condition: (_, { getState }) => {
      const state = getState();
      const now = Date.now();
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
      
      // Prevent concurrent calls if already loading
      if (state.category.loading) {
        return false;
      }
      
      // Prevent API call if cache is valid
      if (
        state.category.categories?.length > 0 &&
        state.category.lastFetched &&
        now - state.category.lastFetched < CACHE_DURATION
      ) {
        return false; // Cancel the request
      }
      return true; // Proceed with the request
    }
  }
);

export const fetchCategoryWithSubcategories = async () => {
  try {
    // send explicit pagination params — some backends require both page and limit
    const params = { page: 1, limit: 1000 };

    const response = await axiosInstance.get("/category/navbar", {
      params,
    });

    const payload = response?.data;

    // Try to normalize various possible response shapes and return an array/object
    if (Array.isArray(payload?.data?.body?.data?.result)) {
      return payload.data.body.data.result;
    }
    if (Array.isArray(payload?.data?.result)) {
      return payload.data.result;
    }
    if (Array.isArray(payload?.data)) {
      return payload.data;
    }
    if (Array.isArray(payload)) {
      return payload;
    }

    // If the API returns an object wrapper for categories, return the most likely object
    if (payload?.data?.body?.data) return payload.data.body.data;
    if (payload?.data) return payload.data;
    return payload;
  } catch (error) {
    console.error("Error fetching categories with subcategories:", error);
  }
};

const categorySlice = createSlice({
  name: "category",
  initialState: {
    categories: [],
    loading: false,
    error: null,
    lastFetched: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default categorySlice.reducer;
