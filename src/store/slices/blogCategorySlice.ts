import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

// ----------------------
// ✅ Types
// ----------------------
interface BlogCategory {
  _id?: string;
  name: string;
  isActive: boolean;
  [key: string]: any;
}

interface BlogCategoryFilters {
  [key: string]: string | number | boolean;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface BlogCategoryState {
  categories: BlogCategory[];
  loading: boolean;
  error: string | null;
  success: boolean;
  searchQuery: string;
  filters: BlogCategoryFilters;
  pagination: Pagination;
}

// ----------------------
// ✅ Initial State
// ----------------------
const initialState: BlogCategoryState = {
  categories: [],
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

// ----------------------
// ✅ Create Category
// ----------------------
export const createBlogCategory = createAsyncThunk<
  any,
  Partial<BlogCategory>,
  { rejectValue: string }
>("blogCategory/create", async (data, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/api/blog-category", data, {
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
// ✅ Fetch Categories
// ----------------------
export interface FetchCategoriesParams {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  searchFields?: Record<string, any>;
  sort?: Record<string, "asc" | "desc">;
}

export const fetchBlogCategories = createAsyncThunk<
  {
    categories: BlogCategory[];
    pagination: Pagination;
  },
  FetchCategoriesParams | void,
  { rejectValue: string }
>("blogCategory/fetchAll", async (params = {}, { rejectWithValue }) => {
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
      `/api/blog-category?${queryParams.toString()}`
    );
    const data = res.data.body.data;
    console.log("Fetched blog categories:", data);
    return {
      categories: data?.result || [],
      pagination: {
        total: data?.totalItems || 0,
        page: data?.page || 1,
        limit: data?.limit || limit,
        totalPages:
          data?.pagination?.totalPages ||
          Math.ceil((data?.pagination?.totalItems || 0) / limit),
      },
    };
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch blog categories"
    );
  }
});

// ----------------------
// ✅ Delete Category
// ----------------------
export const deleteBlogCategory = createAsyncThunk<
  any,
  { id: string },
  { rejectValue: string }
>("blogCategory/delete", async (id, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.delete(`/api/blog-category/${id}`);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Delete failed");
  }
});

// ----------------------
// ✅ Update Category
// ----------------------
export const updateBlogCategory = createAsyncThunk<
  any,
  { id: string; categoryData: Partial<BlogCategory> },
  { rejectValue: string }
>("blogCategory/update", async ({ id, categoryData }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(
      `/api/blog-category/${id}`,
      categoryData,
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
});

// ----------------------
// ✅ Get Category by ID
// ----------------------
export const getBlogCategoryById = createAsyncThunk<
  BlogCategory,
  { id: string },
  { rejectValue: string }
>("blogCategory/getById", async ({ id }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/api/blog-category/${id}`);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Get failed");
  }
});

// ----------------------
// ✅ Slice
// ----------------------
const blogCategorySlice = createSlice({
  name: "blogCategory",
  initialState,
  reducers: {
    setBlogCategorySearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setBlogCategoryFilters(state, action: PayloadAction<BlogCategoryFilters>) {
      state.filters = action.payload;
    },
    resetBlogCategoryFilters(state) {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBlogCategory.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createBlogCategory.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createBlogCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error";
      })
      .addCase(fetchBlogCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogCategories.fulfilled, (state, action) => {
        console.log("payload in fulfilled:", action.payload);
        state.loading = false;
        state.categories = action.payload.categories;
        state.pagination = action.payload.pagination;
        state.success = true;
      })
      .addCase(fetchBlogCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Fetch failed";
      })
      .addCase(deleteBlogCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBlogCategory.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deleteBlogCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Delete failed";
      });
  },
});

// ----------------------
// ✅ Export Actions and Reducer
// ----------------------
export const {
  setBlogCategorySearchQuery,
  setBlogCategoryFilters,
  resetBlogCategoryFilters,
} = blogCategorySlice.actions;

export default blogCategorySlice.reducer;
