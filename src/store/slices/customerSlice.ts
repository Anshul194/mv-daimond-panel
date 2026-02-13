import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

// Customer state interface
interface CustomerState {
  loading: boolean;
  error: string | null;
  success: boolean;
  results: any[];
  totalDocuments: number;
  currentPage: number;
  totalPages: number;
}

const initialState: CustomerState = {
  loading: false,
  error: null,
  success: false,
  results: [],
  totalDocuments: 0,
  currentPage: 1,
  totalPages: 1,
};

// Async thunk for fetching customers
export const fetchCustomers = createAsyncThunk<
  any,
  { page?: number; limit?: number } | void,
  { rejectValue: string }
>("customer/fetchCustomers", async (params = {}, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 10 } = params || {};
    // Token is automatically added by axios interceptor
    const response = await axiosInstance.get(
      `/api/user/all?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch customers"
    );
  }
});

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Handle different response structures
        const data = action.payload?.body?.data || action.payload?.data || action.payload;
        state.results = data?.users || [];
        state.totalDocuments = data?.totalItems || 0;
        state.currentPage = data?.currentPage || 1;
        state.totalPages = data?.totalPages || 1;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch customers";
        state.success = false;
      });
  },
});

export default customerSlice.reducer;

