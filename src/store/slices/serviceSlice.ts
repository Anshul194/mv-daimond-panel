import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

interface Service {
    _id: string;
    title: string;
    image: string;
    alt: string;
    link: string;
    status: 'active' | 'inactive';
    order: number;
}

interface ServiceState {
    loading: boolean;
    error: string | null;
    success: boolean;
    services: Service[];
    totalDocuments: number;
    currentPage: number;
    totalPages: number;
}

const initialState: ServiceState = {
    loading: false,
    error: null,
    success: false,
    services: [],
    totalDocuments: 0,
    currentPage: 1,
    totalPages: 1,
};

// Fetch Services
export const fetchServices = createAsyncThunk<
    any,
    { page?: number; limit?: number } | void,
    { rejectValue: string }
>("service/fetchServices", async (params = {}, { rejectWithValue }) => {
    try {
        const { page = 1, limit = 10 } = params || {};
        const queryParams = new URLSearchParams();
        queryParams.append("page", String(page));
        queryParams.append("limit", String(limit));
        const response = await axiosInstance.get(`/api/service?${queryParams.toString()}`);
        return response.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || "Failed to fetch services");
    }
});

// Create Service
export const createService = createAsyncThunk(
    "service/createService",
    async (data: FormData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/api/service", data);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to create service");
        }
    }
);

// Update Service
export const updateService = createAsyncThunk(
    "service/updateService",
    async ({ id, data }: { id: string; data: FormData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/api/service/${id}`, data);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to update service");
        }
    }
);

// Delete Service
export const deleteService = createAsyncThunk(
    "service/deleteService",
    async (id: string, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/api/service/${id}`);
            return { id };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to delete service");
        }
    }
);

const serviceSlice = createSlice({
    name: "service",
    initialState,
    reducers: {
        resetState: (state) => {
            state.success = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchServices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchServices.fulfilled, (state, action) => {
                state.loading = false;
                const data = action.payload?.data || action.payload;
                state.services = data?.docs || [];
                state.totalDocuments = data?.total || 0;
                state.currentPage = data?.page || 1;
                state.totalPages = data?.totalPages || 1;
            })
            .addCase(fetchServices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createService.fulfilled, (state) => {
                state.success = true;
                state.loading = false;
            })
            .addCase(createService.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateService.fulfilled, (state) => {
                state.success = true;
                state.loading = false;
            })
            .addCase(updateService.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteService.fulfilled, (state, action) => {
                state.services = state.services.filter(s => s._id !== action.payload.id);
            });
    },
});

export const { resetState } = serviceSlice.actions;
export default serviceSlice.reducer;
