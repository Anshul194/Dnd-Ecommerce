import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosConfig/axiosInstance';

export const fetchStates = createAsyncThunk(
    'region/fetchStates',
    async (countryId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/api/state', {
                params: { countryId }
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || 'Failed to fetch states');
        }
    }
);

export const fetchCities = createAsyncThunk(
    'region/fetchCities',
    async (stateId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/api/city', {
                params: { stateId }
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.error || 'Failed to fetch cities');
        }
    }
);

const regionSlice = createSlice({
    name: 'region',
    initialState: {
        states: [],
        cities: [],
        loadingStates: false,
        loadingCities: false,
        errorStates: null,
        errorCities: null,
    },
    reducers: {
        clearCities(state) {
            state.cities = [];
            state.errorCities = null;
        },
        clearStates(state) {
            state.states = [];
            state.errorStates = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // States
            .addCase(fetchStates.pending, (state) => {
                state.loadingStates = true;
                state.errorStates = null;
            })
            .addCase(fetchStates.fulfilled, (state, action) => {
                state.loadingStates = false;
                state.states = action.payload;
            })
            .addCase(fetchStates.rejected, (state, action) => {
                state.loadingStates = false;
                state.errorStates = action.payload;
            })
            // Cities
            .addCase(fetchCities.pending, (state) => {
                state.loadingCities = true;
                state.errorCities = null;
            })
            .addCase(fetchCities.fulfilled, (state, action) => {
                state.loadingCities = false;
                state.cities = action.payload;
            })
            .addCase(fetchCities.rejected, (state, action) => {
                state.loadingCities = false;
                state.errorCities = action.payload;
            });
    }
});

export const { clearCities, clearStates } = regionSlice.actions;
export default regionSlice.reducer;