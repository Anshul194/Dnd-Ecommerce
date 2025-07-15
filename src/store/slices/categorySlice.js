"use client";

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosConfig/axiosInstance';

// Thunk to fetch categories
export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/category', {
        headers: {
            'Content-Type': 'application/json',
        },
      });
      console.log('response',response.data);
      return response.data?.body?.data?.result || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching categories');
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState: {
    data: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default categorySlice.reducer;
