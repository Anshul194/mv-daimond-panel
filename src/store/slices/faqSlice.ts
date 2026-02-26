import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

interface Faq {
    _id: string;
    title: string;
    description: string;
    status: 'active' | 'inactive';
    createdAt: string;
}

interface FaqState {
    loading: boolean;
    error: string | null;
    success: boolean;
    faqs: Faq[];
    totalDocuments: number;
    currentPage: number;
    totalPages: number;
}

const initialState: FaqState = {
    loading: false,
    error: null,
    success: false,
    faqs: [],
    totalDocuments: 0,
    currentPage: 1,
    totalPages: 1,
};

// Fetch FAQs
export const fetchFaqs = createAsyncThunk<
    any,
    { page?: number; limit?: number; search?: string } | void,
    { rejectValue: string }
>("faq/fetchFaqs", async (params = {}, { rejectWithValue }) => {
    try {
        const { page = 1, limit = 10, search = "" } = params || {};
        const queryParams = new URLSearchParams();
        queryParams.append("page", String(page));
        queryParams.append("limit", String(limit));

        if (search) {
            queryParams.append("searchFields", JSON.stringify({ title: search }));
        }

        const response = await axiosInstance.get(`/api/faq?${queryParams.toString()}`);
        return response.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || "Failed to fetch FAQs");
    }
});

// Create FAQ
export const createFaq = createAsyncThunk(
    "faq/createFaq",
    async (data: { title: string; description: string; status?: string }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/api/faq", data);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to create FAQ");
        }
    }
);

// Update FAQ
export const updateFaq = createAsyncThunk(
    "faq/updateFaq",
    async ({ id, data }: { id: string; data: Partial<Faq> }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/api/faq/${id}`, data);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to update FAQ");
        }
    }
);

// Delete FAQ
export const deleteFaq = createAsyncThunk(
    "faq/deleteFaq",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/api/faq/${id}`);
            return { id, message: response.data.message };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to delete FAQ");
        }
    }
);

const faqSlice = createSlice({
    name: "faq",
    initialState,
    reducers: {
        resetState: (state) => {
            state.success = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchFaqs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFaqs.fulfilled, (state, action) => {
                state.loading = false;
                // Handle nested response structure
                const data = action.payload?.body?.data || action.payload?.data || action.payload;

                state.faqs = data?.docs || [];
                state.totalDocuments = data?.total || 0;
                state.currentPage = data?.page || 1;
                state.totalPages = data?.totalPages || 1;
            })
            .addCase(fetchFaqs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createFaq.pending, (state) => {
                state.loading = true;
            })
            .addCase(createFaq.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(createFaq.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update
            .addCase(updateFaq.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateFaq.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(updateFaq.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete
            .addCase(deleteFaq.fulfilled, (state, action) => {
                state.faqs = state.faqs.filter((f) => f._id !== action.payload.id);
            });
    },
});

export const { resetState } = faqSlice.actions;
export default faqSlice.reducer;
