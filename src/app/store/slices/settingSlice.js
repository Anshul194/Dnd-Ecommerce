import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/axiosConfig/axiosInstance";

// Async thunk to fetch settings
export const fetchSettings = createAsyncThunk(
  "setting/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/settings");
      console.log("setting response ===> ", response);
      return response.data.setting || {};
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk to update settings
export const updateSettings = createAsyncThunk(
  "setting/updateSettings",
  async (updatedData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put("/settings", updatedData);
      return response.data?.data || {};
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const settingSlice = createSlice({
  name: "setting",
  initialState: {
    settings: {
      tenant: "",
      codLimit: 1500,
      freeShippingThreshold: 500,
      codShippingChargeBelowThreshold: 80,
      prepaidShippingChargeBelowThreshold: 40,
      repeatOrderRestrictionDays: 10,
      codOtpRequired: true,
      codDisableForHighRTO: true,
      codBlockOnRTOAddress: true,
      highRTOOrderCount: 3,
      activeHomepageLayout: null,
    },
    loading: false,
    error: null,
  },
  reducers: {
    clearSettings: (state) => {
      state.settings = {};
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch settings";
      })

      // Update
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update settings";
      });
  },
});

export const { clearSettings } = settingSlice.actions;
export default settingSlice.reducer;
