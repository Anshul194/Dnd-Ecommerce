// src/lib/redux/slices/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/axiosConfig/axiosInstance";

export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async (payload) => {
    console.log("Fetching products with payload:", payload);
    const quaryParams = new URLSearchParams();
    payload.page && quaryParams.append("page", payload.page);
    payload.limit && quaryParams.append("limit", payload.limit);
    payload.sortBy && quaryParams.append("sortBy", payload.sortBy);

    if (payload.category) {
      quaryParams.append("category", payload.category);
    }
    if (payload.minPrice) {
      quaryParams.append("minPrice", payload.minPrice);
    }
    if (payload.maxPrice) {
      quaryParams.append("maxPrice", payload.maxPrice);
    }
    if (payload.searchTerm) {
      quaryParams.append("searchTerm", payload.searchTerm);
    }
    if (payload.isAddon !== undefined) {
      quaryParams.append("isAddon", payload.isAddon);
    }

    const response = await axiosInstance.get("/product", {
      params: quaryParams,
    });
    console.log("Response from fetchProducts:", response);
    console.log("Products Data:", response.data.products.data);
    return response.data.products.data;
  }
);

export const fetchProductById = createAsyncThunk(
  "product/fetchProductById",
  async (id) => {
    const response = await axiosInstance.get(`/product/${id}`);
    console.log("Product Data:", response);
    console.log("Ingredients fetched:", response.data.data.ingredients);

    return response.data.data;
  }
);

export const addReview = createAsyncThunk(
  "product/addReview",
  async (reviewData) => {
    try {
      const response = await axiosInstance.post("/review", reviewData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Review added successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error adding review:", error);
      throw error;
    }
  }
);

export const fetchProductReviews = createAsyncThunk(
  "product/fetchProductReviews",
  async (productId) => {
    try {
      const response = await axiosInstance.get(
        `/review?productId=${productId}`
      );
      console.log("Product Reviews Data:", response);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching product reviews:", error);
      throw error;
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default productSlice.reducer;
