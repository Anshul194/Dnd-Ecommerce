import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../axiosConfig/axiosInstance';
export const fetchGroupedContent = createAsyncThunk(
    'content/fetchGroupedContent',
    async (_, { rejectWithValue }) => {
       try {
        const response = await axiosInstance.get('/content', {
            params: { action: 'grouped' },
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console?.log('Fetched content:', response.data?.data);
        return {
            sections: response.data.data,
            stats: response.data.stats,
            totalSectionTypes: response.data.totalSectionTypes,
            totalSections: response.data.totalSections
        };
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch content');
    }
    }
);

const contentSlice = createSlice({
    name: 'content',
    initialState: {
        groupedContent: null,
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchGroupedContent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGroupedContent.fulfilled, (state, action) => {
                state.loading = false;
                state.groupedContent = action.payload;
            })
            .addCase(fetchGroupedContent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default contentSlice.reducer;