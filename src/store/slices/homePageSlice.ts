import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

export interface HomeStat {
    _id: string;
    label: string;
    value: number;
    suffix: string;
    float: boolean;
    order: number;
    status: 'active' | 'inactive';
}

export interface GreenBoxContent {
    _id: string;
    eyebrow: string;
    headlineLine1: string;
    headlineLine2: string;
    description: string;
}

interface HomePageState {
    loading: boolean;
    error: string | null;
    success: boolean;
    stats: HomeStat[];
    content: GreenBoxContent | null;
}

const initialState: HomePageState = {
    loading: false,
    error: null,
    success: false,
    stats: [],
    content: null,
};

// Fetch Stats
export const fetchHomeStats = createAsyncThunk(
    "homePage/fetchHomeStats",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/api/home-stats");
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch stats");
        }
    }
);

// Create Stat
export const createHomeStat = createAsyncThunk(
    "homePage/createHomeStat",
    async (data: Partial<HomeStat>, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/api/home-stats", data);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to create stat");
        }
    }
);

// Update Stat
export const updateHomeStat = createAsyncThunk(
    "homePage/updateHomeStat",
    async ({ id, data }: { id: string; data: Partial<HomeStat> }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/api/home-stats/${id}`, data);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to update stat");
        }
    }
);

// Delete Stat
export const deleteHomeStat = createAsyncThunk(
    "homePage/deleteHomeStat",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/api/home-stats/${id}`);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to delete stat");
        }
    }
);

// Fetch Green Box Content
export const fetchGreenBoxContent = createAsyncThunk(
    "homePage/fetchGreenBoxContent",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/api/green-box");
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch content");
        }
    }
);

// Update Green Box Content
export const updateGreenBoxContent = createAsyncThunk(
    "homePage/updateGreenBoxContent",
    async (data: Partial<GreenBoxContent>, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put("/api/green-box", data);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to update content");
        }
    }
);

const homePageSlice = createSlice({
    name: "homePage",
    initialState,
    reducers: {
        resetHomePageState: (state) => {
            state.success = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Stats
            .addCase(fetchHomeStats.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchHomeStats.fulfilled, (state, action) => {
                state.loading = false;
                // Handle nested response structure
                const data = action.payload?.body?.data || action.payload?.data || action.payload;
                state.stats = Array.isArray(data) ? data : [];
            })
            .addCase(fetchHomeStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Stat
            .addCase(createHomeStat.fulfilled, (state) => {
                state.success = true;
            })
            // Update Stat
            .addCase(updateHomeStat.fulfilled, (state) => {
                state.success = true;
            })
            // Delete Stat
            .addCase(deleteHomeStat.fulfilled, (state, action) => {
                state.stats = state.stats.filter(s => s._id !== action.payload);
            })
            // Content
            .addCase(fetchGreenBoxContent.fulfilled, (state, action) => {
                const data = action.payload?.body?.data || action.payload?.data || action.payload;
                state.content = data || null;
            })
            // Update Content
            .addCase(updateGreenBoxContent.fulfilled, (state) => {
                state.success = true;
            });
    },
});

export const { resetHomePageState } = homePageSlice.actions;
export default homePageSlice.reducer;
