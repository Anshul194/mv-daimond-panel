import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

// Review state interface
interface ReviewState {
  loading: boolean;
  error: string | null;
  success: boolean;
  results: any[];
  totalDocuments: number;
  currentPage: number;
  totalPages: number;
}

const initialState: ReviewState = {
  loading: false,
  error: null,
  success: false,
  results: [],
  totalDocuments: 0,
  currentPage: 1,
  totalPages: 1,
};

// Async thunk for fetching reviews
export const fetchReviews = createAsyncThunk<
  any,
  { page?: number; limit?: number; targetType?: string } | void,
  { rejectValue: string }
>("review/fetchReviews", async (params = {}, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 10, targetType } = params || {};

    const queryParams = new URLSearchParams();
    queryParams.append("page", String(page));
    queryParams.append("limit", String(limit));

    if (targetType) {
      queryParams.append("filters", JSON.stringify({ targetType }));
    } else {
      queryParams.append("filters", JSON.stringify({}));
    }

    queryParams.append("searchFields", JSON.stringify({}));
    queryParams.append("sort", JSON.stringify({ createdAt: "desc" }));

    const response = await axiosInstance.get(
      `/api/review?${queryParams.toString()}`
    );
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch reviews"
    );
  }
});

// Async thunk for creating a review
export const createReview = createAsyncThunk<any, FormData, { rejectValue: string }>(
  "review/createReview",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/review", formData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to create review");
    }
  }
);

// Async thunk for updating a review
export const updateReview = createAsyncThunk<any, { id: string; formData: FormData }, { rejectValue: string }>(
  "review/updateReview",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/review/${id}`, formData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update review");
    }
  }
);

// Async thunk for updating review status
export const updateReviewStatus = createAsyncThunk<any, { id: string; status: string }, { rejectValue: string }>(
  "review/updateReviewStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/api/review/${id}`, { status });
      return { id, status, data: response.data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update review status");
    }
  }
);

// Async thunk for deleting a review
export const deleteReview = createAsyncThunk<any, string, { rejectValue: string }>(
  "review/deleteReview",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/api/review/${id}`);
      return { id, data: response.data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete review");
    }
  }
);

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch reviews
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const data = action.payload?.body?.data || action.payload?.data || action.payload;
        state.results = data?.result || data?.reviews || data?.results || [];
        state.totalDocuments = data?.totalDocuments || data?.totalItems || 0;
        state.currentPage = data?.currentPage || data?.page || 1;
        state.totalPages = data?.totalPages || 1;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch reviews";
        state.success = false;
      })
      // Create review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(createReview.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create review";
      })
      // Update review
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateReview.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update review";
      })
      // Update review status
      .addCase(updateReviewStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateReviewStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.results.findIndex(review => review._id === action.payload.id);
        if (index !== -1) {
          state.results[index].status = action.payload.status;
        }
      })
      .addCase(updateReviewStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update review status";
      })
      // Delete review
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.results = state.results.filter(review => review._id !== action.payload.id);
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete review";
      });
  },
});

export const { resetState } = reviewSlice.actions;

export default reviewSlice.reducer;
