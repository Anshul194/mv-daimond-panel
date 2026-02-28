import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosConfig';

interface InstagramReel {
    _id: string;
    image: string;
    reelUrl: string;
    order: number;
    status: 'active' | 'inactive';
}

interface InstagramHeader {
    title: string;
    description: string;
}

interface InstagramState {
    reels: InstagramReel[];
    header: InstagramHeader;
    loading: boolean;
    error: string | null;
}

const initialState: InstagramState = {
    reels: [],
    header: { title: '', description: '' },
    loading: false,
    error: null,
};

export const fetchInstagramData = createAsyncThunk('instagram/fetchData', async () => {
    const [reelsRes, headerRes] = await Promise.all([
        axiosInstance.get('/api/instagram-reels'),
        axiosInstance.get('/api/instagram-header')
    ]);
    return {
        reels: reelsRes.data.data,
        header: headerRes.data.data
    };
});

export const updateInstagramHeader = createAsyncThunk('instagram/updateHeader', async (data: InstagramHeader) => {
    const response = await axiosInstance.put('/api/instagram-header', data);
    return response.data.data;
});

export const addInstagramReel = createAsyncThunk('instagram/addReel', async (data: Partial<InstagramReel>) => {
    const response = await axiosInstance.post('/api/instagram-reels', data);
    return response.data.data;
});

export const updateInstagramReel = createAsyncThunk('instagram/updateReel', async ({ id, data }: { id: string, data: Partial<InstagramReel> }) => {
    const response = await axiosInstance.put(`/api/instagram-reels/${id}`, data);
    return response.data.data;
});

export const deleteInstagramReel = createAsyncThunk('instagram/deleteReel', async (id: string) => {
    await axiosInstance.delete(`/api/instagram-reels/${id}`);
    return id;
});

const instagramSlice = createSlice({
    name: 'instagram',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchInstagramData.pending, (state) => { state.loading = true; })
            .addCase(fetchInstagramData.fulfilled, (state, action) => {
                state.loading = false;
                state.reels = action.payload.reels;
                state.header = action.payload.header;
            })
            .addCase(fetchInstagramData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch Instagram data';
            })
            .addCase(updateInstagramHeader.fulfilled, (state, action) => {
                state.header = action.payload;
            })
            .addCase(addInstagramReel.fulfilled, (state, action) => {
                state.reels.push(action.payload);
            })
            .addCase(updateInstagramReel.fulfilled, (state, action) => {
                const index = state.reels.findIndex(r => r._id === action.payload._id);
                if (index !== -1) state.reels[index] = action.payload;
            })
            .addCase(deleteInstagramReel.fulfilled, (state, action) => {
                state.reels = state.reels.filter(r => r._id !== action.payload);
            });
    },
});

export default instagramSlice.reducer;
