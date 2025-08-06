import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/axiosConfig/axiosInstance";

// 🔄 Async thunk for creating a support ticket
export const createSupportTicket = createAsyncThunk(
  "supportTicket/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/crm/tickets", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data?.data;
    } catch (error) {
      // Ensure we return a string error message
      let errorMessage = "An error occurred while creating the ticket";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        
        // If it's a validation error with details, format it nicely
        if (error.response.data.data && Array.isArray(error.response.data.data)) {
          const validationErrors = error.response.data.data.map(err => err.message).join(', ');
          errorMessage = `${error.response.data.message}: ${validationErrors}`;
        }
      } else if (error.response?.data) {
        errorMessage = typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// 🎯 Support Ticket Slice
const supportTicketSlice = createSlice({
  name: "supportTicket",
  initialState: {
    loading: false,
    error: null,
    success: false,
    ticket: null,
  },
  reducers: {
    resetTicketState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.ticket = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSupportTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createSupportTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.ticket = action.payload;
      })
      .addCase(createSupportTicket.rejected, (state, action) => {
        state.loading = false;
        // Ensure error is always a string
        if (typeof action.payload === 'string') {
          state.error = action.payload;
        } else if (action.payload && action.payload.message) {
          state.error = action.payload.message;
        } else if (action.payload && typeof action.payload === 'object') {
          state.error = JSON.stringify(action.payload);
        } else {
          state.error = "Failed to create ticket";
        }
      });
  },
});

export const { resetTicketState } = supportTicketSlice.actions;
export default supportTicketSlice.reducer;
