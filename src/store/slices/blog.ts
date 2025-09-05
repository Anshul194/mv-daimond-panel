import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

// ----------------------
// ✅ Types
// ----------------------
interface Blog {
  _id?: string;
  title: string;
  content: string;
  image?: string;
  isActive: boolean;
  category?: string;
  [key: string]: any;
}

interface BlogFilters {
  [key: string]: string | number | boolean;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface BlogState {
  blogs: Blog[];
  loading: boolean;
  error: string | null;
  success: boolean;
  searchQuery: string;
  filters: BlogFilters;
  pagination: Pagination;
}

// ----------------------
// ✅ Initial State
// ----------------------
const initialState: BlogState = {
  blogs: [],
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
// ✅ Create Blog
// ----------------------
export const createBlog = createAsyncThunk<
  any,
  Partial<Blog>,
  { rejectValue: string }
>("blog/create", async (data, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post("/api/blog", data, {
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
// ✅ Fetch Blogs
// ----------------------
export interface FetchBlogsParams {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  searchFields?: Record<string, any>;
  sort?: Record<string, "asc" | "desc">;
}

export const fetchBlogs = createAsyncThunk<
  {
    blogs: Blog[];
    pagination: Pagination;
  },
  FetchBlogsParams | void,
  { rejectValue: string }
>("blog/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const {
      page = 1,
      limit = 10,
      filters = {},
      searchFields = {},
      sort = { createdAt: "desc" },
    } = params || {};

    const queryParams = new URLSearchParams();
    queryParams.set("page", String(page));
    queryParams.set("limit", String(limit));

    Object.entries(filters).forEach(([key, value]) =>
      queryParams.append(`filters[${key}]`, String(value))
    );

    Object.entries(searchFields).forEach(([key, value]) =>
      queryParams.append(`search[${key}]`, String(value))
    );

    Object.entries(sort).forEach(([key, value]) =>
      queryParams.append(`sort[${key}]`, value)
    );

    const res = await axiosInstance.get(`/api/blog?${queryParams.toString()}`);
    const data = res.data.body.data;
    console.log("Fetched blogs:", data);
    return {
      blogs: data?.data || [],
      pagination: {
        total: data?.total || 0,
        page: data?.page || 1,
        limit: data?.limit || limit,
        totalPages: data?.totalPages || Math.ceil((data?.total || 0) / limit),
      },
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Fetch failed");
  }
});

// ----------------------
// ✅ Delete Blog
// ----------------------
export const deleteBlog = createAsyncThunk<
  any,
  { id: string },
  { rejectValue: string }
>("blog/delete", async ({ id }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.delete(`/api/blog/${id}`);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Delete failed");
  }
});

// ----------------------
// ✅ Update Blog
// ----------------------
export const updateBlog = createAsyncThunk<
  any,
  { id: string; blogData: Partial<Blog> },
  { rejectValue: string }
>("blog/update", async ({ id, blogData }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`/api/blog/${id}`, blogData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Update failed");
  }
});

// ----------------------
// ✅ Get Blog by ID
// ----------------------
export const getBlogById = createAsyncThunk<
  Blog,
  { id: string },
  { rejectValue: string }
>("blog/getById", async ({ id }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/api/blog/${id}`);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Get failed");
  }
});

// ----------------------
// ✅ Slice
// ----------------------
const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    setBlogSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setBlogFilters(state, action: PayloadAction<BlogFilters>) {
      state.filters = action.payload;
    },
    resetBlogFilters(state) {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBlog.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createBlog.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Create error";
      })

      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload.blogs;
        state.pagination = action.payload.pagination;
        state.success = true;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Fetch error";
      })

      .addCase(deleteBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBlog.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Delete error";
      });
  },
});

// ----------------------
// ✅ Exports
// ----------------------
export const { setBlogSearchQuery, setBlogFilters, resetBlogFilters } =
  blogSlice.actions;

export default blogSlice.reducer;
