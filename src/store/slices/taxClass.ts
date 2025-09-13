import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

// ----------------------
// ✅ Types
// ----------------------
interface Tax {
  _id?: string;
  name: string;
  percentage: number;
  isActive: boolean;
  [key: string]: any;
}

interface TaxFilters {
  [key: string]: string | number | boolean;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TaxState {
  taxes: Tax[];
  loading: boolean;
  error: string | null;
  success: boolean;
  searchQuery: string;
  filters: TaxFilters;
  pagination: Pagination;
}

// ----------------------
// ✅ Initial State
// ----------------------
const initialState: TaxState = {
  taxes: [],
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
// ✅ Create Tax
// ----------------------
export const createTax = createAsyncThunk<
  any,
  Partial<Tax>,
  { rejectValue: string }
>("tax/create", async (taxData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/api/tax-class`, taxData);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to create tax"
    );
  }
});

// ----------------------
// ✅ Fetch All Taxes
// ----------------------
export interface FetchTaxesParams {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  searchFields?: Record<string, any>;
  sort?: Record<string, "asc" | "desc">;
}

export const fetchTaxes = createAsyncThunk<
  {
    taxes: Tax[];
    pagination: Pagination;
  },
  FetchTaxesParams | void,
  { rejectValue: string }
>("tax/fetchAll", async (params = {}, { rejectWithValue }) => {
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
      `${API_BASE_URL}/api/tax-class?${queryParams.toString()}`
    );
    const data = response.data;
    console.log("Fetched Taxes Data:", data);
    return {
      taxes: data?.body?.data?.result || [],
      pagination: {
        total: data?.body?.data?.totalItems || 0,
        page: data?.body?.data?.page || 1,
        limit: data?.body?.data?.limit || limit,
        totalPages:
          data?.body?.data?.totalPages ||
          Math.ceil((data?.body?.data?.totalItems || 0) / limit),
      },
    };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Failed to fetch taxes"
    );
  }
});

// ----------------------
// ✅ Delete Tax
// ----------------------
export const deleteTax = createAsyncThunk<
  any,
  { taxId: string },
  { rejectValue: string }
>("tax/delete", async ({ taxId }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(`${API_BASE_URL}/api/tax-class/${taxId}`);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete tax"
    );
  }
});

// ----------------------
// ✅ Update Tax
// ----------------------
export const updateTax = createAsyncThunk<
  any,
  { taxId: string; taxData: Partial<Tax> },
  { rejectValue: string }
>("tax/update", async ({ taxId, taxData }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/api/tax-class/${taxId}`,
      taxData
    );
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to update tax"
    );
  }
});

// ----------------------
// ✅ Get Tax by ID
// ----------------------
export const getTaxById = createAsyncThunk<
  Tax,
  { taxId: string },
  { rejectValue: string }
>("tax/getById", async ({ taxId }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/api/tax-class/${taxId}`);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch tax"
    );
  }
});

// ----------------------
// ✅ Slice
// ----------------------
const taxSlice = createSlice({
  name: "tax",
  initialState,
  reducers: {
    setTaxSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setTaxFilters(state, action: PayloadAction<TaxFilters>) {
      state.filters = action.payload;
    },
    resetTaxFilters(state) {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTax.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createTax.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createTax.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error";
        state.success = false;
      })
      .addCase(fetchTaxes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaxes.fulfilled, (state, action) => {
        state.loading = false;
        state.taxes = action.payload.taxes;
        state.pagination = action.payload.pagination;
        state.success = true;
      })
      .addCase(fetchTaxes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch taxes";
      })
      .addCase(deleteTax.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTax.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deleteTax.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete tax";
      });
  },
});

// ----------------------
// ✅ Actions and Reducer
// ----------------------
export const { setTaxSearchQuery, setTaxFilters, resetTaxFilters } =
  taxSlice.actions;

export default taxSlice.reducer;
