// src/lib/redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// localStorage utility functions
const CART_STORAGE_KEY = "dnd_ecommerce_cart";

const saveCartToLocalStorage = (cartData) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
};

const getCartFromLocalStorage = () => {
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : null;
  } catch (error) {
    console.error("Failed to get cart from localStorage:", error);
    return null;
  }
};

const clearCartFromLocalStorage = () => {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear cart from localStorage:", error);
  }
};

// Async thunk to add an item to the cart (using localStorage)
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (
    { product, variant, quantity, price },
    { rejectWithValue, getState }
  ) => {
    try {
      const currentState = getState().cart;
      const existingCart = getCartFromLocalStorage() || {
        cartId: Date.now().toString(),
        cartItems: [],
        total: 0,
      };

      console.log("Adding to cart:", { product, variant, quantity, price });
      console.log("Existing cart items:", existingCart.cartItems);

      // Check if item already exists in cart (comparing both product ID and variant ID)
      const existingItemIndex = existingCart.cartItems.findIndex((item) => {
        const productMatch = String(item.product) === String(product);
        const variantMatch = String(item.variant) === String(variant);
        console.log("Comparing:", {
          existingProduct: item.product,
          newProduct: product,
          productMatch,
          existingVariant: item.variant,
          newVariant: variant,
          variantMatch,
        });
        return productMatch && variantMatch;
      });

      let updatedItems;
      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        console.log(
          "Item exists, updating quantity from",
          existingCart.cartItems[existingItemIndex].quantity,
          "to",
          existingCart.cartItems[existingItemIndex].quantity + quantity
        );
        updatedItems = [...existingCart.cartItems];
        updatedItems[existingItemIndex].quantity += quantity;
        // Update price in case it has changed
        updatedItems[existingItemIndex].price = price;
      } else {
        // Add new item
        console.log("Adding new item to cart");
        const newItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          product,
          variant,
          quantity,
          price,
        };
        updatedItems = [...existingCart.cartItems, newItem];
      }

      // Calculate total
      const total = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const updatedCart = {
        ...existingCart,
        cartItems: updatedItems,
        total,
      };

      saveCartToLocalStorage(updatedCart);
      return updatedCart;
    } catch (error) {
      console.log("Add to Cart Error:", error);
      return rejectWithValue("Add to cart failed");
    }
  }
);

export const getCartItems = createAsyncThunk(
  "cart/getCartItems",
  async (_, { rejectWithValue }) => {
    try {
      const cartData = getCartFromLocalStorage();

      if (!cartData) {
        return {
          cartId: null,
          cartItems: [],
          total: 0,
        };
      }

      console.log("Fetched Cart Items from localStorage:", {
        cartId: cartData.cartId,
        cartItems: cartData.cartItems || [],
      });

      return {
        cartId: cartData.cartId,
        cartItems: cartData.cartItems || [],
        total: cartData.total || 0,
      };
    } catch (error) {
      return rejectWithValue("Failed to fetch cart items from localStorage");
    }
  }
);

export const removeItemFromCart = createAsyncThunk(
  "cart/removeItemFromCart",
  async (itemId, { rejectWithValue }) => {
    try {
      console.log("Removing Item ID:", itemId);
      const existingCart = getCartFromLocalStorage();

      if (!existingCart) {
        return rejectWithValue("Cart not found");
      }

      const updatedItems = existingCart.cartItems.filter(
        (item) => item.id !== itemId
      );
      const total = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const updatedCart = {
        ...existingCart,
        cartItems: updatedItems,
        total,
      };

      saveCartToLocalStorage(updatedCart);
      return { itemId, updatedCart };
    } catch (error) {
      return rejectWithValue("Remove from cart failed");
    }
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  "cart/updateCartItemQuantity",
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const existingCart = getCartFromLocalStorage();

      if (!existingCart) {
        return rejectWithValue("Cart not found");
      }
      console.log("Updating Item ID:", itemId, "to Quantity:", quantity);

      const updatedItems = existingCart.cartItems.map((item) => {
        if (item.id === itemId) {
          return { ...item, quantity: Math.max(1, quantity) };
        }
        return item;
      });

      const total = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const updatedCart = {
        ...existingCart,
        cartItems: updatedItems,
        total,
      };

      saveCartToLocalStorage(updatedCart);
      return updatedCart;
    } catch (error) {
      return rejectWithValue("Update quantity failed");
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      clearCartFromLocalStorage();
      return {
        cartId: null,
        cartItems: [],
        total: 0,
      };
    } catch (error) {
      return rejectWithValue("Clear cart failed");
    }
  }
);

// Slice
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartId: null,
    cartItems: [],
    total: 0,
    loading: false,
    error: null,
    isCartOpen: false, // sidebar state
  },
  reducers: {
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    openCart: (state) => {
      state.isCartOpen = true;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.cartItems = action.payload.cartItems;
          state.cartId = action.payload.cartId;
          state.total = action.payload.total;
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCartItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCartItems.fulfilled, (state, action) => {
        console.log("PayLoad:", action.payload);
        state.loading = false;
        state.cartItems = action.payload.cartItems;
        state.cartId = action.payload.cartId;
        state.total = action.payload.total;
      })
      .addCase(getCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeItemFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.updatedCart) {
          state.cartItems = action.payload.updatedCart.cartItems;
          state.total = action.payload.updatedCart.total;
        }
      })
      .addCase(removeItemFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.cartItems = action.payload.cartItems;
          state.total = action.payload.total;
        }
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload.cartItems;
        state.cartId = action.payload.cartId;
        state.total = action.payload.total;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { toggleCart, openCart, closeCart } = cartSlice.actions;
export default cartSlice.reducer;
