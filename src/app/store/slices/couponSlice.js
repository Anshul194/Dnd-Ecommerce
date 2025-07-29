import axiosInstance from '@/axiosConfig/axiosInstance';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch coupons
export const fetchCoupons = createAsyncThunk(
    'coupons/fetchCoupons',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/coupon');
            console.log('Fetched coupons:', response.data);
            return response.data?.coupons?.data || [];
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const couponSlice = createSlice({
    name: 'coupons',
    initialState: {
        items: [],
        loading: false,
        error: null,
        selectedCoupon: null,
    },
    reducers: {
        setSelectedCoupon: (state, action) => {
            state.selectedCoupon = action.payload;
        },
        clearSelectedCoupon: (state) => {
            state.selectedCoupon = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCoupons.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCoupons.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchCoupons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setSelectedCoupon, clearSelectedCoupon } = couponSlice.actions;
export default couponSlice.reducer;