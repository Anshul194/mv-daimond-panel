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
    
    // Build query parameters
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

    // Token is automatically added by axios interceptor
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

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Handle different response structures
        const data = action.payload?.body?.data || action.payload?.data || action.payload;
        state.results = data?.result || data?.reviews || [];
        state.totalDocuments = data?.totalDocuments || data?.totalItems || 0;
        state.currentPage = data?.currentPage || data?.page || 1;
        state.totalPages = data?.totalPages || 1;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch reviews";
        state.success = false;
      });
  },
});

export default reviewSlice.reducer;

