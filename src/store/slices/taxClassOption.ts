import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

// ----------------------
// ✅ Types
// ----------------------
interface TaxClassOption {
  _id?: string;
  name: string;
  description?: string;
  isActive: boolean;
  [key: string]: any;
}

interface TaxClassOptionFilters {
  [key: string]: string | number | boolean;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TaxClassOptionState {
  options: TaxClassOption[];
  loading: boolean;
  error: string | null;
  success: boolean;
  searchQuery: string;
  filters: TaxClassOptionFilters;
  pagination: Pagination;
}

// ----------------------
// ✅ Initial State
// ----------------------
const initialState: TaxClassOptionState = {
  options: [],
  loading: false,
  error: null,
  success: false,
  searchQuery: "",
  filters: {},
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
};
const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

// ----------------------
// ✅ Create Option
// ----------------------
export const createTaxClassOption = createAsyncThunk<
  any,
  Partial<TaxClassOption>,
  { rejectValue: string }
>("taxClassOption/create", async (data, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/api/tax-class-option`, data);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to create tax class option"
    );
  }
});

// ----------------------
// ✅ Fetch All Options
// ----------------------
export interface FetchTaxClassOptionsParams {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  searchFields?: Record<string, any>;
  sort?: Record<string, "asc" | "desc">;
}

export const fetchTaxClassOptions = createAsyncThunk<
  {
    options: TaxClassOption[];
    pagination: Pagination;
  },
  FetchTaxClassOptionsParams | void,
  { rejectValue: string }
>("taxClassOption/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const {
      page = 1,
      limit = 10,
      filters = {},
      searchFields = {},
      sort = { createdAt: "desc" },
    } = params || {};

    const queryParams = new URLSearchParams();

    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/tax-class-option?${queryParams.toString()}`
    );
    const data = response.data;

    return {
      options: data.data.data || [],
      pagination: {
        total: data.data.pagination.totalItems || 0,
        page: data.data.pagination.page || 1,
        limit: data.data.pagination.limit || limit,
        totalPages:
          data.data.pagination.totalPages ||
          Math.ceil((data.data.pagination.totalItems || 0) / limit),
      },
    };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch tax class options"
    );
  }
});

// ----------------------
// ✅ Delete Option
// ----------------------
export const deleteTaxClassOption = createAsyncThunk<
  any,
  { optionId: string },
  { rejectValue: string }
>("taxClassOption/delete", async ({ optionId }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(
      `${API_BASE_URL}/api/tax-class-option/${optionId}`
    );
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete tax class option"
    );
  }
});

// ----------------------
// ✅ Update Option
// ----------------------
export const updateTaxClassOption = createAsyncThunk<
  any,
  { optionId: string; data: Partial<TaxClassOption> },
  { rejectValue: string }
>("taxClassOption/update", async ({ optionId, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/api/tax-class-option/${optionId}`,
      data
    );
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to update tax class option"
    );
  }
});

// ----------------------
// ✅ Get Option by ID
// ----------------------
export const getTaxClassOptionById = createAsyncThunk<
  TaxClassOption,
  { optionId: string },
  { rejectValue: string }
>("taxClassOption/getById", async ({ optionId }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/tax-class-option/${optionId}`
    );
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch tax class option"
    );
  }
});

// ----------------------
// ✅ Slice
// ----------------------
const taxClassOptionSlice = createSlice({
  name: "taxClassOption",
  initialState,
  reducers: {
    setTaxClassOptionSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setTaxClassOptionFilters(
      state,
      action: PayloadAction<TaxClassOptionFilters>
    ) {
      state.filters = action.payload;
    },
    resetTaxClassOptionFilters(state) {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTaxClassOption.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createTaxClassOption.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createTaxClassOption.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error";
        state.success = false;
      })
      .addCase(fetchTaxClassOptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaxClassOptions.fulfilled, (state, action) => {
        state.loading = false;
        state.options = action.payload.options;
        state.pagination = action.payload.pagination;
        state.success = true;
      })
      .addCase(fetchTaxClassOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch options";
      })
      .addCase(deleteTaxClassOption.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTaxClassOption.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deleteTaxClassOption.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete option";
      });
  },
});

// ----------------------
// ✅ Actions and Reducer
// ----------------------
export const {
  setTaxClassOptionSearchQuery,
  setTaxClassOptionFilters,
  resetTaxClassOptionFilters,
} = taxClassOptionSlice.actions;

export default taxClassOptionSlice.reducer;
