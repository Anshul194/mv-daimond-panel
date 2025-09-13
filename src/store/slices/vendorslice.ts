import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";


// Vendor registration payload interface
interface VendorSignupPayload {
  username: string;
  email: string;
  password: string;
  role: string;
  storeName: string;
  contactNumber: string;
  address: string;
}

// Vendor state interface
interface VendorState {
  loading: boolean;
  error: string | null;
  success: boolean;
  results: any[];
  totalDocuments: number;
  currentPage: number;
  totalPages: number;
}

const initialState: VendorState = {
  loading: false,
  error: null,
  success: false,
  results: [],
  totalDocuments: 0,
  currentPage: 1,
  totalPages: 1,
};

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
// Async thunk for vendor signup
export const registerVendor = createAsyncThunk<
  any,
  VendorSignupPayload,
  { rejectValue: string }
>("vendor/register", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/auth/register`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        // If you need to send cookies, add withCredentials: true
        // withCredentials: true,
      }
    );
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to register vendor"
    );
  }
});

// Async thunk for fetching vendor data
export const fetchVendor = createAsyncThunk<
  any,
  { page?: number; limit?: number } | void,
  { rejectValue: string }
>("vendor/fetchVendor", async (params = {}, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 10 } = params || {};
    // Get token from localStorage
    const token = localStorage.getItem("accessToken") || "";
    if (!token) {
      return rejectWithValue("No access token found");
    }
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/vendor?page=${page}&limit=${limit}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );
    return response.data.body.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch vendor"
    );
  }
});

const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {
    resetVendorState(state) {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.results = [];
      state.totalDocuments = 0;
      state.currentPage = 1;
      state.totalPages = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registerVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // No change to results on register
      })
      .addCase(registerVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to register vendor";
        state.success = false;
      })
      .addCase(fetchVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(fetchVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.results = action.payload?.results || [];
        state.totalDocuments = action.payload?.totalDocuments || 0;
        state.currentPage = action.payload?.currentPage || 1;
        state.totalPages = action.payload?.totalPages || 1;
      })
      .addCase(fetchVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch vendor";
        state.success = false;
      });
  },
});

export const { resetVendorState } = vendorSlice.actions;
export default vendorSlice.reducer;
