// src/lib/redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// localStorage utility functions
const CART_STORAGE_KEY = "dnd_ecommerce_cart";

const saveCartToLocalStorage = (cartData) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
  } catch (error) {
    // console.error("Failed to save cart to localStorage:", error);
  }
};

const getCartFromLocalStorage = () => {
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : null;
  } catch (error) {
    // console.error("Failed to get cart from localStorage:", error);
    return null;
  }
};

const clearCartFromLocalStorage = () => {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    // console.error("Failed to clear cart from localStorage:", error);
  }
};

// Map server cart format to local cart storage format
function mapServerCartToLocal(serverCart) {
  if (!serverCart) return { cartId: null, cartItems: [], total: 0 };
  const cartId =
    serverCart._id ||
    serverCart.id ||
    (serverCart.userIsGestId
      ? `guest:${serverCart.userIsGestId}`
      : Date.now().toString());
  const items = (serverCart.items || []).map((it) => {
    const productId =
      it.product && (it.product._id || it.product)
        ? it.product._id || it.product
        : null;
    const variantId =
      it.variant && (it.variant._id || it.variant)
        ? it.variant._id || it.variant
        : null;
    console.log("Mapping cart item - product with variants:", it.product);
    const id = `${productId}:${variantId || ""}`;
    return {
      id,
      product: it.product,
      variant: variantId,
      quantity: it.quantity,
      price: it.price,
      addedAt: it.addedAt
        ? new Date(it.addedAt).toISOString()
        : new Date().toISOString(),
    };
  });
  const total =
    serverCart.total || items.reduce((s, it) => s + it.price * it.quantity, 0);
  return { cartId, cartItems: items, total };
}

// Async thunk to add an item to the cart (using localStorage)
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (
    { product, variant, quantity, price },
    { rejectWithValue, getState }
  ) => {
    try {
      // Try server API first. If it fails, fall back to localStorage.
      const accessToken =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      let guestId =
        typeof window !== "undefined" ? localStorage.getItem("guestId") : null;

      const headers = { "Content-Type": "application/json" };
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
      if (guestId) headers["x-guest-id"] = guestId;

      const payloadProduct =
        product && (product._id || product.id)
          ? product._id || product.id
          : product;
      const payloadVariant =
        variant && (variant._id || variant.id)
          ? variant._id || variant.id
          : variant;
      const resp = await fetch("/api/new-cart/items", {
        method: "POST",
        headers,
        body: JSON.stringify({
          product: payloadProduct,
          variant: payloadVariant,
          quantity,
          price,
          userIsGestId: guestId,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        const serverCart = data.cart;
        // Save guestId returned by server if present
        if (serverCart && serverCart.userIsGestId) {
          try {
            localStorage.setItem("guestId", serverCart.userIsGestId);
          } catch (e) { }
        }

        const mapped = mapServerCartToLocal(serverCart);
        saveCartToLocalStorage(mapped);
        return mapped;
      }

      // Fallback to localStorage behavior if server call fails
      const existingCart = getCartFromLocalStorage() || {
        cartId: Date.now().toString(),
        cartItems: [],
        total: 0,
      };

      const existingItemIndex = existingCart.cartItems.findIndex((item) => {
        const productMatch = String(item.product) === String(product);
        const variantMatch = String(item.variant) === String(variant);
        return productMatch && variantMatch;
      });

      let updatedItems;
      if (existingItemIndex !== -1) {
        updatedItems = [...existingCart.cartItems];
        updatedItems[existingItemIndex].quantity += quantity;
        updatedItems[existingItemIndex].price = price;
      } else {
        const payloadProduct =
          product && (product._id || product.id)
            ? product._id || product.id
            : product;
        const payloadVariant =
          variant && (variant._id || variant.id)
            ? variant._id || variant.id
            : variant;
        const newItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          product: product,
          variant: payloadVariant,
          quantity,
          price,
          addedAt: new Date().toISOString(),
        };
        updatedItems = [...existingCart.cartItems, newItem];
      }

      const total = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const updatedCart = { ...existingCart, cartItems: updatedItems, total };
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
      // Try server first
      try {
        const accessToken =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;
        const guestId =
          typeof window !== "undefined"
            ? localStorage.getItem("guestId")
            : null;
        const headers = {};
        if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
        if (guestId) headers["x-guest-id"] = guestId;

        const resp = await fetch("/api/new-cart", { method: "GET", headers });
        if (resp.ok) {
          const data = await resp.json();
          const mapped = mapServerCartToLocal(data.cart || data);
          saveCartToLocalStorage(mapped);
          return mapped;
        }
      } catch (e) {
        // ignore and fallback to local
      }

      const cartData = getCartFromLocalStorage();
      if (!cartData) {
        return { cartId: null, cartItems: [], total: 0 };
      }
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
      // Try server API
      const existingCart = getCartFromLocalStorage();
      if (!existingCart) return rejectWithValue("Cart not found");

      // itemId format from server mapping: productId:variantId
      const parts = String(itemId).split(":");
      const productId = parts[0];
      const variantId = parts[1] || null;

      const accessToken =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      const guestId =
        typeof window !== "undefined" ? localStorage.getItem("guestId") : null;
      const headers = { "Content-Type": "application/json" };
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
      if (guestId) headers["x-guest-id"] = guestId;

      try {
        const resp = await fetch("/api/new-cart/items", {
          method: "DELETE",
          headers,
          body: JSON.stringify({
            product: productId,
            variant: variantId,
            userIsGestId: guestId,
          }),
        });
        if (resp.ok) {
          const data = await resp.json();
          const mapped = mapServerCartToLocal(data.cart);
          saveCartToLocalStorage(mapped);
          return { itemId, updatedCart: mapped };
        }
      } catch (e) {
        // ignore and fallback to local
      }

      // Local fallback
      const updatedItems = existingCart.cartItems.filter(
        (item) => item.id !== itemId
      );
      const total = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const updatedCart = { ...existingCart, cartItems: updatedItems, total };
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
      if (!existingCart) return rejectWithValue("Cart not found");

      const parts = String(itemId).split(":");
      const productId = parts[0];
      const variantId = parts[1] || null;

      const accessToken =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      const guestId =
        typeof window !== "undefined" ? localStorage.getItem("guestId") : null;
      const headers = { "Content-Type": "application/json" };
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
      if (guestId) headers["x-guest-id"] = guestId;

      try {
        const resp = await fetch("/api/new-cart/items", {
          method: "PUT",
          headers,
          body: JSON.stringify({
            product: productId,
            variant: variantId,
            quantity,
            userIsGestId: guestId,
          }),
        });
        if (resp.ok) {
          const data = await resp.json();
          const mapped = mapServerCartToLocal(data.cart);
          saveCartToLocalStorage(mapped);
          return mapped;
        }
      } catch (e) {
        // fallback to local
      }

      // Local fallback
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
      const updatedCart = { ...existingCart, cartItems: updatedItems, total };
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
    buyNowProduct: null,
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
    setBuyNowProduct: (state, action) => {
      state.buyNowProduct = action.payload;
    },
    removeBuyNowProduct: (state) => {
      state.buyNowProduct = null;
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

export const {
  toggleCart,
  openCart,
  closeCart,
  setBuyNowProduct,
  removeBuyNowProduct,
} = cartSlice.actions;
export default cartSlice.reducer;
