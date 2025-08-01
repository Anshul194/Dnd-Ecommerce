// src/lib/redux/slices/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/axiosConfig/axiosInstance";

export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async (payload) => {
    const quaryParams = new URLSearchParams();
    quaryParams.append("page", payload.page);
    quaryParams.append("limit", payload.limit);
    quaryParams.append("sortBy", payload.sortBy);

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

    const response = await axiosInstance.get("/product", {
      params: quaryParams,
    });
    console.log("Products Data:", response.data.products.data);
    return response.data.products.data;
  }
);

export const fetchProductById = createAsyncThunk(
  "product/fetchProductById",
  async (id) => {
    const response = await axiosInstance.get(`/product/${id}`);
    console.log("Product Data:", response);

    return response.data.data;
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
