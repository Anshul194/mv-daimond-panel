import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

interface Banner {
    _id: string;
    title: string;
    subtitle: string;
    image: string;
    rightImage: string;
    label: string;
    buttonPrimaryText: string;
    buttonPrimaryLink: string;
    buttonSecondaryText: string;
    buttonSecondaryLink: string;
    status: 'active' | 'inactive';
    order: number;
}

interface BannerState {
    loading: boolean;
    error: string | null;
    success: boolean;
    banners: Banner[];
    totalDocuments: number;
    currentPage: number;
    totalPages: number;
}

const initialState: BannerState = {
    loading: false,
    error: null,
    success: false,
    banners: [],
    totalDocuments: 0,
    currentPage: 1,
    totalPages: 1,
};

// Fetch Banners
export const fetchBanners = createAsyncThunk<
    any,
    { page?: number; limit?: number; search?: string } | void,
    { rejectValue: string }
>("banner/fetchBanners", async (params = {}, { rejectWithValue }) => {
    try {
        const { page = 1, limit = 10 } = params || {};
        const queryParams = new URLSearchParams();
        queryParams.append("page", String(page));
        queryParams.append("limit", String(limit));

        const response = await axiosInstance.get(`/api/banner?${queryParams.toString()}`);
        return response.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || "Failed to fetch banners");
    }
});

// Create Banner
export const createBanner = createAsyncThunk(
    "banner/createBanner",
    async (data: FormData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/api/banner", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to create banner");
        }
    }
);

// Update Banner
export const updateBanner = createAsyncThunk(
    "banner/updateBanner",
    async ({ id, data }: { id: string; data: FormData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/api/banner/${id}`, data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to update banner");
        }
    }
);

// Delete Banner
export const deleteBanner = createAsyncThunk(
    "banner/deleteBanner",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/api/banner/${id}`);
            return { id };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to delete banner");
        }
    }
);

const bannerSlice = createSlice({
    name: "banner",
    initialState,
    reducers: {
        resetState: (state) => {
            state.success = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBanners.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchBanners.fulfilled, (state, action) => {
                state.loading = false;
                const data = action.payload?.data || action.payload;
                state.banners = data?.docs || [];
                state.totalDocuments = data?.total || 0;
                state.currentPage = data?.page || 1;
                state.totalPages = data?.totalPages || 1;
            })
            .addCase(fetchBanners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createBanner.fulfilled, (state) => {
                state.success = true;
            })
            .addCase(updateBanner.fulfilled, (state) => {
                state.success = true;
            })
            .addCase(deleteBanner.fulfilled, (state, action) => {
                state.banners = state.banners.filter(b => b._id !== action.payload.id);
            });
    },
});

export const { resetState } = bannerSlice.actions;
export default bannerSlice.reducer;
