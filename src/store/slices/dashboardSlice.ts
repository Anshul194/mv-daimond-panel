// src/redux/slices/dashboardSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

// Dashboard response type
interface DashboardState {
  loading: boolean;
  error: string | null;
  data: any | null;
}

const initialState: DashboardState = {
  loading: false,
  error: null,
  data: null,
};

// Async thunk – decides API based on role
export const fetchDashboard = createAsyncThunk<
  any,
  void,
  { rejectValue: string }
>("dashboard/fetch", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user") as string)
      : null;

    if (!token || !user) {
      return rejectWithValue("Not authenticated");
    }

    // role-based API
    let endpoint = "/api/dashboard/vendor";
    if (user.role === "superadmin") {
      endpoint = "/api/dashboard/superadmin";
    }

    const response = await axiosInstance.get(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Only return the inner data object
    return response.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch dashboard"
    );
  }
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    resetDashboard(state) {
      state.loading = false;
      state.error = null;
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching dashboard";
      });
  },
});

export const { resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
