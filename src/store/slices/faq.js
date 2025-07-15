import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosConfig/axiosInstance';
// Async thunk to fetch FAQs
export const fetchFaqs = createAsyncThunk(
    'faq/fetchFaqs',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/api/faq', {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('Fetched FAQs:', response.data);
            return response.data?.body?.data?.docs;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const faqSlice = createSlice({
    name: 'faq',
    initialState: {
        faqs: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFaqs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFaqs.fulfilled, (state, action) => {
                state.loading = false;
                state.faqs = action.payload;
            })
            .addCase(fetchFaqs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default faqSlice.reducer;