"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosConfig/axiosInstance";

// Thunk to fetch cards
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      // const response = await axiosInstance.get("/api/cart", {
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      // });
      // console.log("response", response.data);
      // return response.data?.body?.data?.result || [];
      const existingCart = localStorage.getItem("cart");
      const existingCartData = existingCart ? JSON.parse(existingCart) : [];
      return existingCartData;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error fetching cards");
    }
  }
);

export const addCart = createAsyncThunk(
  "cart/addCart",
  async (cardData, { rejectWithValue }) => {
    try {
      console.log("cardData", cardData);
      const existingCart = localStorage.getItem("cart");
      const existingCartData = existingCart ? JSON.parse(existingCart) : [];
      // Check if the card already exists in the cart
      console.log("existingCartData", existingCartData);
      const cardExists = existingCartData.some(
        (item) =>
          item.pid_id === cardData.pid_id &&
          item.selectedOptions.ringSize === cardData.selectedOptions.ringSize &&
          item.selectedOptions.metalType === cardData.selectedOptions.metalType
      );

      console.log("Card exists:", cardExists);
      if (cardExists) {
        console.log("Card already exists in the cart, updating quantity");
        // If the card already exists, update the quantity
        const updatedCart = existingCartData.map((item) =>
          item.id === cardData.pid_id
            ? { ...item, quantity: item.quantity + cardData.quantity }
            : item
        );
        return localStorage.setItem("cart", JSON.stringify(updatedCart));
      } else {
        console.log("Card does not exist in the cart, adding new card");
        // If the card does not exist, add it to the cart
        existingCartData.push(cardData);

        console.log("Card added to the cart");
        console.log("existingCartData after adding", existingCartData);
      }

      localStorage.setItem("cart", JSON.stringify(existingCartData));
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error adding card");
    }
  }
);

export const removeItemFromCart = createAsyncThunk(
  "cart/removeItemFromCart",
  async (pid_id, { rejectWithValue }) => {
    try {
      const existingCart = localStorage.getItem("cart");
      const existingCartData = existingCart ? JSON.parse(existingCart) : [];
      // Filter out the item with the given pid_id
      const updatedCart = existingCartData.filter(
        (item) =>
          item.pid_id !== pid_id &&
          item.selectedOptions.ringSize === item.selectedOptions.ringSize &&
          item.selectedOptions.metalType === item.selectedOptions.metalType
      );
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart; // Return the updated cart
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error removing item");
    }
  }
);

const cardSlice = createSlice({
  name: "card",
  initialState: {
    data: [],
    status: "idle",
    error: null,
  },
  reducers: {
    // You can add reducers here if you want to add/update/delete card locally
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        fetchCart(); // Refresh the cart after adding a new item
      })
      .addCase(addCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default cardSlice.reducer;
