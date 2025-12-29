import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/axiosConfig/axiosInstance";

const isBrowser =
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const CHECKOUT_STATE_KEY = "dnd_ecommerce_checkout_open";

// Async thunk to submit checkout data (example)
export const submitCheckout = createAsyncThunk(
  "checkout/submitCheckout",
  async (checkoutDetails, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/checkout", checkoutDetails);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const setAddress = createAsyncThunk(
  "checkout/setAddress",
  async (address, { rejectWithValue }) => {
    try {
      localStorage.setItem("address", JSON.stringify(address));
      return address;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const placeOrder = createAsyncThunk(
  "checkout/placeOrder",
  async (orderDetails, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/orders/place", orderDetails);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const checkoutSlice = createSlice({
  name: "checkout",
  initialState: {
    checkoutOpen: false,
    checkoutData: {},
    addressAdded:
      (isBrowser && localStorage.getItem("address") && true) || false,
    addressData:
      (isBrowser && JSON.parse(localStorage.getItem("address"))) || {},
    loading: false,
    error: null,
  },
  reducers: {
    setCheckoutOpen: (state) => {
      state.checkoutOpen = true;
      if (isBrowser) localStorage.setItem(CHECKOUT_STATE_KEY, "true");
    },
    resetAddress: (state) => {
      state.addressAdded = false;
      state.addressData = {};
    },
    setCheckoutClose: (state) => {
      state.checkoutOpen = false;
      if (isBrowser) localStorage.removeItem(CHECKOUT_STATE_KEY);
    },
    restoreCheckoutState: (state) => {
      if (isBrowser) {
        const isOpen = localStorage.getItem(CHECKOUT_STATE_KEY) === "true";
        if (isOpen) state.checkoutOpen = true;
      }
    },
    getAddressFormLocalStorage: (state) => {
      state.addressData = isBrowser
        ? JSON.parse(localStorage.getItem("address")) || {}
        : {};
    },
    setCheckoutData: (state, action) => {
      state.checkoutData = action.payload;
    },
    clearCheckoutData: (state) => {
      state.checkoutData = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.checkoutData = action.payload;
      })
      .addCase(submitCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(setAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addressAdded = true;
        state.addressData = action.payload;
      })
      .addCase(setAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCheckoutOpen,
  setCheckoutClose,
  setCheckoutData,
  clearCheckoutData,
  resetAddress,
  getAddressFormLocalStorage,
  restoreCheckoutState,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
