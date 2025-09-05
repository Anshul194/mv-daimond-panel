import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

interface ProductAttribute {
  name: string;
  value: string;
}

interface ProductItem {
  size: string;
  color: string;
  additional_price: string;
  extra_cost: string;
  stock_count: string;
  attributes: ProductAttribute[];
  image?: File | null;
}

interface ProductFilters {
  [key: string]: string | number | boolean;
}

interface ProductState {
  products: ProductItem[];
  loading: boolean;
  error: string | null;
  success: boolean;
  searchQuery: string;
  filters: ProductFilters;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  success: false,
  searchQuery: "",
  filters: {},
};

export const createProduct = createAsyncThunk<
  any,
  FormData,
  { rejectValue: string }
>("product/create", async (formData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      "http://localhost:3000/api/product",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to create product"
    );
  }
});

export interface FetchProductsParams {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  searchFields?: Record<string, any>;
  sort?: Record<string, "asc" | "desc">;
}

export interface Product {
  // Define your product fields here
  [key: string]: any;
}

export const fetchProducts = createAsyncThunk<
  {
    products: Product[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  },
  FetchProductsParams | void,
  { rejectValue: string }
>("product/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const {
      page = 1,
      limit = 10,
      filters = {},
      searchFields = {},
      sort = { createdAt: "desc" },
    } = params || {};

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());

    if (Object.keys(filters).length > 0) {
      queryParams.append("filters", JSON.stringify(filters));
    }

    if (Object.keys(searchFields).length > 0) {
      queryParams.append("searchFields", JSON.stringify(searchFields));
    }

    if (Object.keys(sort).length > 0) {
      queryParams.append("sort", JSON.stringify(sort));
    }

    const response = await axiosInstance.get(
      `http://localhost:3000/api/product?${queryParams.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;
    if (!data || !data.body) {
      throw new Error("Invalid response structure");
    }

    const apiData = data.body.data || data.body;
    console.log("API Data:", {
      products: apiData.docs || [],
      pagination: {
        total: apiData.total || 0,
        page: apiData.page || 1,
        limit: apiData.limit || limit,
        totalPages:
          apiData.totalPages ||
          Math.ceil((apiData.totalDocuments || 0) / limit),
      },
    });
    return {
      products: apiData.docs || [],
      pagination: {
        total: apiData.total || 0,
        page: apiData.page || 1,
        limit: apiData.limit || limit,
        totalPages:
          apiData.totalPages ||
          Math.ceil((apiData.totalDocuments || 0) / limit),
      },
    };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch products"
    );
  }
});

export const updateProduct = createAsyncThunk<
  any,
  { productId: string; data: FormData },
  { rejectValue: string }
>("product/update", async ({ productId, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(
      `http://localhost:3000/api/product/${productId}`,
      data,
      
    );
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to update product"
    );
  }
});

export const deleteproduct = createAsyncThunk<
  any,
  { productId: string; token: string },
  { rejectValue: string }
>("brand/delete", async ({ productId, token }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(
      `http://localhost:3000/api/product/${productId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete brand"
    );
  }
});

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProductSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setProductFilters(state, action: PayloadAction<ProductFilters>) {
      state.filters = action.payload;
    },
    resetProductFilters(state) {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error";
        state.success = false;
      })
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
        state.success = true;
        // Add logic to store fetched products if needed
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch products";
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProduct.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update product";
        state.success = false;
      })
      .addCase(deleteproduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteproduct.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Handle successful brand deletion if needed
      })
      .addCase(deleteproduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete brand";
      });
  },
});

export const { setProductSearchQuery, setProductFilters, resetProductFilters } =
  productSlice.actions;

export default productSlice.reducer;
