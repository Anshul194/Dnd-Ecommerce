import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstances from "@/axiosConfig/axiosInstance";
export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async ({ product, variant, token, tenant }, { rejectWithValue }) => {
    try {
      const response = await axiosInstances.post("/wishlist", {
        product,
        variant,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstances.get("/wishlist");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async ({ productId, variantId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstances.delete(`/wishlist/`, {
        params: { productId, variantId },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        let items = action.payload?.wishlist?.items;
        state.items = Array.isArray(items) ? items : [];
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the item from the items array using the productId passed as arg
        const productId = action?.meta?.arg?.productId;
        if (productId) {
          state.items = state.items.filter(
            (item) => item.product?._id !== productId
          );
        }
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

const selectWishlistItems = (state) => state.wishlist.items;

export { selectWishlistItems };

export default wishlistSlice.reducer;
