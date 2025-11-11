// src/lib/redux/slices/productSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/axiosConfig/axiosInstance";

export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async (payload) => {
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
      quaryParams.append("selectFields", { name: payload.searchTerm });
    }
    if (payload.isAddon !== undefined) {
      quaryParams.append("isAddon", payload.isAddon);
    }

    if (payload.frequentlyPurchased) {
      quaryParams.append("frequentlyPurchased", payload.frequentlyPurchased);
    }

    const response = await axiosInstance.get("/product", {
      params: quaryParams,
    });
    return response.data.products.data;
  }
);

export const fetchProductById = createAsyncThunk(
  "product/fetchProductById",
  async (id) => {
    const response = await axiosInstance.get(`/product/${id}`);
    const response2 = await axiosInstance.get(
      `/review?productId=${response.data.product._id}`
    );

    return {
      ...response.data.product,
      reviews: response2.data.data || [],
    };
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
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

export const fetchProductReviews = createAsyncThunk(
  "product/fetchProductReviews",
  async (id) => {
    try {
      const response = await axiosInstance.get(`/review?productId=${id}`);
      // Check for success property in response
      if (response.data && response.data.success === false) {
        // Backend returned an error, return empty array
        return [];
      }
      return response.data.data;
    } catch (error) {
      // Return empty array to avoid crashing
      return [];
    }
  }
);

export const fetchFrequentlyPurchasedProducts = createAsyncThunk(
  "product/fetchFrequentlyPurchasedProducts",
  async (payload) => {
    console.log("frequently api is calling");
    try {
      const quaryParams = new URLSearchParams();
      payload.page && quaryParams.append("page", payload.page);
      payload.limit && quaryParams.append("limit", payload.limit);
      payload.sortBy && quaryParams.append("sortBy", payload.sortBy);

      if (payload.category) {
        quaryParams.append("category", payload.category);
      }

      if (payload.frequentlyPurchased) {
        quaryParams.append("frequentlyPurchased", payload.frequentlyPurchased);
      }

      const response = await axiosInstance.get("/product", {
        params: quaryParams,
      });
      return response.data.products.data;
    } catch (error) {
      throw error;
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    selectedProduct: null,
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
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

const selectSelectedProduct = (state) => state.product.selectedProduct;
const removeSelectedProduct = (state) => {
  state.product.selectedProduct = null;
};

export { selectSelectedProduct, removeSelectedProduct };

export default productSlice.reducer;
