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
        // API returns: { status: 'true', message: '...', wishlist: { items: [...] } }
        // Extract items from the wishlist object
        const response = action.payload;
        let items = [];
        
        if (response?.wishlist?.items && Array.isArray(response.wishlist.items)) {
          // Response has wishlist.items array
          items = response.wishlist.items;
        } else if (response?.items && Array.isArray(response.items)) {
          // Response has items array directly
          items = response.items;
        } else if (Array.isArray(response)) {
          // Response is directly an array
          items = response;
        } else if (response?.product) {
          // Response is a single item object
          items = [...state.items, response];
        }
        
        // Update state with the items from the response
        // This ensures we have the latest data from the server
        if (items.length > 0 || Array.isArray(response?.wishlist?.items)) {
          state.items = items;
        }
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
        // Remove the item from the items array using the productId and variantId passed as arg
        const productId = action?.meta?.arg?.productId;
        const variantId = action?.meta?.arg?.variantId;
        
        if (productId) {
          // Convert to string for reliable comparison
          const productIdStr = String(productId);
          const variantIdStr = variantId ? String(variantId) : null;
          
          state.items = state.items.filter((item) => {
            // Get item product ID (handle both _id and id fields)
            const itemProductId = item.product?._id || item.product?.id;
            const itemProductIdStr = itemProductId ? String(itemProductId) : null;
            
            // If product IDs don't match, keep the item
            if (itemProductIdStr !== productIdStr) {
              return true;
            }
            
            // If variantId is provided, also check variant match
            if (variantIdStr) {
              const itemVariantId = item.variant?._id || item.variant?.id;
              const itemVariantIdStr = itemVariantId ? String(itemVariantId) : null;
              
              // If variant doesn't match, keep the item
              if (itemVariantIdStr !== variantIdStr) {
                return true;
              }
            }
            
            // Product ID matches (and variant matches if provided), so remove this item
            return false;
          });
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
