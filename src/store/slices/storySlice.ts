import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosConfig';
import { toast } from 'react-hot-toast';

const API_BASE_URL = '/api';
interface Story {
    _id?: string;
    title: string;
    mediaType: 'image' | 'video';
    mediaUrl: string;
    status: 'active' | 'inactive';
}

interface StoryState {
    stories: Story[];
    loading: boolean;
    error: string | null;
}

const initialState: StoryState = {
    stories: [],
    loading: false,
    error: null,
};

export const fetchStories = createAsyncThunk('stories/fetchStories', async () => {
    const response = await axiosInstance.get(`${API_BASE_URL}/story`);
    return response.data.data;
});

export const createStory = createAsyncThunk('stories/createStory', async (formData: FormData) => {
    const response = await axiosInstance.post(`${API_BASE_URL}/story`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
});

export const updateStory = createAsyncThunk('stories/updateStory', async ({ id, formData }: { id: string; formData: FormData }) => {
    const response = await axiosInstance.put(`${API_BASE_URL}/story/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
});

export const deleteStory = createAsyncThunk('stories/deleteStory', async (id: string) => {
    await axiosInstance.delete(`${API_BASE_URL}/story/${id}`);
    return id;
});

const storySlice = createSlice({
    name: 'stories',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchStories.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStories.fulfilled, (state, action) => {
                state.loading = false;
                state.stories = action.payload;
            })
            .addCase(fetchStories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch stories';
            })
            .addCase(createStory.fulfilled, (state, action) => {
                state.stories.unshift(action.payload.data);
                toast.success('Story created successfully');
            })
            .addCase(updateStory.fulfilled, (state, action) => {
                const index = state.stories.findIndex((s) => s._id === action.payload.data._id);
                if (index !== -1) {
                    state.stories[index] = action.payload.data;
                }
                toast.success('Story updated successfully');
            })
            .addCase(deleteStory.fulfilled, (state, action) => {
                state.stories = state.stories.filter((s) => s._id !== action.payload);
                toast.success('Story deleted successfully');
            });
    },
});

export default storySlice.reducer;
