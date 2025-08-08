import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstances from '@/axiosConfig/axiosInstance';
export const addToWishlist = createAsyncThunk(
    'wishlist/addToWishlist',
    async ({ product, variant, token, tenant }, { rejectWithValue }) => {
        try {
            const response = await axiosInstances.post(
                '/wishlist',
                { product, variant },
               
            );
            console.log("Add to Wishlist Response:", response.data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchWishlist = createAsyncThunk(
    'wishlist/fetchWishlist',
    async ({ token, tenant }, { rejectWithValue }) => {
        try {
            const response = await axiosInstances.get('/wishlist');
            console.log("Fetched Wishlist:", response.data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);



const wishlistSlice = createSlice({
    name: 'wishlist',
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
                state.items.push(action.payload);
            })
            .addCase(addToWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            }
            )
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;
                let items = action.payload?.wishlist?.items;
                state.items = Array.isArray(items) ? items : [];
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

    },
});

export default wishlistSlice.reducer;