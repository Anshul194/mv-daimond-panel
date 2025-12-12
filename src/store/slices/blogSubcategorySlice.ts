import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

// ----------------------
// ✅ Types
// ----------------------
interface BlogSubcategory {
  _id?: string;
  name: string;
  categoryId: string;
  isActive: boolean;
  [key: string]: any;
}

interface BlogSubcategoryFilters {
  [key: string]: string | number | boolean;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface BlogSubcategoryState {
  subcategories: BlogSubcategory[];
  loading: boolean;
  error: string | null;
  success: boolean;
  searchQuery: string;
  filters: BlogSubcategoryFilters;
  pagination: Pagination;
}

// ----------------------
// ✅ Initial State
// ----------------------
const initialState: BlogSubcategoryState = {
  subcategories: [],
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
// ✅ Create Subcategory
// ----------------------
export const createBlogSubcategory = createAsyncThunk<
  any,
  Partial<BlogSubcategory>,
  { rejectValue: string }
>("blogSubcategory/create", async (data, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post(`${API_BASE_URL}/api/blog-subcategory`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Create failed");
  }
});

// ----------------------
// ✅ Fetch Subcategories
// ----------------------
export interface FetchSubcategoriesParams {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  searchFields?: Record<string, any>;
  sort?: Record<string, "asc" | "desc">;
}

export const fetchBlogSubcategories = createAsyncThunk<
  {
    subcategories: BlogSubcategory[];
    pagination: Pagination;
  },
  FetchSubcategoriesParams | void,
  { rejectValue: string }
>("blogSubcategory/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const {
      page = 1,
      limit = 10,
      filters = {},
      searchFields = {},
      sort = { createdAt: "desc" },
    } = params || {};

    const queryParams = new URLSearchParams();

    const res = await axiosInstance.get(
      `${API_BASE_URL}/api/blog-subcategory?${queryParams.toString()}`
    );
    const data = res.data.body.data;
    console.log("Fetched blog subcategories:", {
      subcategories: data?.data || [],
      pagination: {
        total: data?.totalItems || 0,
        page: data?.page || 1,
        limit: data?.limit || limit,
        totalPages:
          data?.totalPages || Math.ceil((data?.totalItems || 0) / limit),
      },
    });
    return {
      subcategories: data?.data || [],
      pagination: {
        total: data?.totalItems || 0,
        page: data?.page || 1,
        limit: data?.limit || limit,
        totalPages:
          data?.totalPages || Math.ceil((data?.totalItems || 0) / limit),
      },
    };
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch blog subcategories"
    );
  }
});

// ----------------------
// ✅ Delete Subcategory
// ----------------------
export const deleteBlogSubcategory = createAsyncThunk<
  any,
  { id: string },
  { rejectValue: string }
>("blogSubcategory/delete", async ({ id }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.delete(`${API_BASE_URL}/api/blog-subcategory/${id}`);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Delete failed");
  }
});

// ----------------------
// ✅ Update Subcategory
// ----------------------
export const updateBlogSubcategory = createAsyncThunk<
  any,
  { id: string; subcategoryData: Partial<BlogSubcategory> },
  { rejectValue: string }
>(
  "blogSubcategory/update",
  async ({ id, subcategoryData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `${API_BASE_URL}/api/blog-subcategory/${id}`,
        subcategoryData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Update failed");
    }
  }
);

// ----------------------
// ✅ Get Subcategory by ID
// ----------------------
export const getBlogSubcategoryById = createAsyncThunk<
  BlogSubcategory,
  { id: string },
  { rejectValue: string }
>("blogSubcategory/getById", async ({ id }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`${API_BASE_URL}/api/blog-subcategory/${id}`);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Get failed");
  }
});

// ----------------------
// ✅ Slice
// ----------------------
const blogSubcategorySlice = createSlice({
  name: "blogSubcategory",
  initialState,
  reducers: {
    setBlogSubcategorySearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setBlogSubcategoryFilters(
      state,
      action: PayloadAction<BlogSubcategoryFilters>
    ) {
      state.filters = action.payload;
    },
    resetBlogSubcategoryFilters(state) {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBlogSubcategory.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createBlogSubcategory.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createBlogSubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error";
      })
      .addCase(fetchBlogSubcategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogSubcategories.fulfilled, (state, action) => {
        state.loading = false;
        state.subcategories = action.payload.subcategories;
        state.pagination = action.payload.pagination;
        state.success = true;
      })
      .addCase(fetchBlogSubcategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Fetch failed";
      })
      .addCase(deleteBlogSubcategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBlogSubcategory.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deleteBlogSubcategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Delete failed";
      });
  },
});

// ----------------------
// ✅ Export Actions and Reducer
// ----------------------
export const {
  setBlogSubcategorySearchQuery,
  setBlogSubcategoryFilters,
  resetBlogSubcategoryFilters,
} = blogSubcategorySlice.actions;

export default blogSubcategorySlice.reducer;
