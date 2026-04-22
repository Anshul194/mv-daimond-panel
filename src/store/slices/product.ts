import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance, { axiosPublic } from "../../services/axiosConfig";

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
  productAttributes?: any[]; // <-- add this
  productAttributesLoading?: boolean;
  productAttributesError?: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  success: false,
  searchQuery: "",
  filters: {},
  productAttributes: [],
  productAttributesLoading: false,
  productAttributesError: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
};

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

export const createProduct = createAsyncThunk<
  any,
  FormData,
  { rejectValue: string }
>("product/create", async (formData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/product`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    const errorData = err.response?.data;
    let errorMessage = "Failed to create product";
    
    // Check nested structures: body.body.errors or body.errors or errors
    const innerBody = errorData?.body?.body || errorData?.body || errorData;
    
    if (Array.isArray(innerBody?.errors) && innerBody.errors.length > 0) {
      errorMessage = innerBody.errors[0].message || innerBody.errors[0];
    } else if (innerBody?.message && innerBody.message !== "Validation error") {
      errorMessage = innerBody.message;
    } else if (errorData?.message) {
      errorMessage = errorData.message;
    }
    
    return rejectWithValue(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
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
      `${API_BASE_URL}/api/product?${queryParams.toString()}`,
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
      `${API_BASE_URL}/api/product/${productId}`,
      data
    );
    return response.data;
  } catch (err: any) {
    const errorData = err.response?.data;
    let errorMessage = "Failed to update product";
    
    const innerBody = errorData?.body?.body || errorData?.body || errorData;
    
    if (Array.isArray(innerBody?.errors) && innerBody.errors.length > 0) {
      errorMessage = innerBody.errors.map((e: any) => e.message || e).join('; ');
    } else if (innerBody?.message && innerBody.message !== "Validation error") {
      errorMessage = innerBody.message;
    } else if (errorData?.message) {
      errorMessage = errorData.message;
    }
    
    return rejectWithValue(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
  }
});

export const deleteproduct = createAsyncThunk<
  any,
  { productId: string; token: string },
  { rejectValue: string }
>("brand/delete", async ({ productId, token }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(
      `${API_BASE_URL}/api/product/${productId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    const errorData = err.response?.data;
    let errorMessage = "Failed to delete product";
    
    const innerBody = errorData?.body?.body || errorData?.body || errorData;
    
    if (Array.isArray(innerBody?.errors) && innerBody.errors.length > 0) {
      errorMessage = innerBody.errors[0].message || innerBody.errors[0];
    } else if (innerBody?.message) {
      errorMessage = innerBody.message;
    }
    
    return rejectWithValue(typeof errorMessage === 'string' ? errorMessage : "Failed to delete product");
  }
});

// Set product approval/status (JSON body)
export const setProductApproval = createAsyncThunk<
  any,
  { productId: string; is_approved: boolean; status: string },
  { rejectValue: string }
>("product/setApproval", async ({ productId, is_approved, status }, { rejectWithValue }) => {
  try {
    console.log('setProductApproval request', { productId, is_approved, status });
    // Use authenticated axiosInstance and explicitly pass token from localStorage
    let token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      try {
        const rawUser = localStorage.getItem('user');
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          token = parsed?.accessToken || parsed?.token || parsed?.authToken || parsed?.auth?.token || parsed?.data?.token || parsed?.user?.token;
        }
      } catch (e) {
        // ignore JSON parse errors
      }
    }
    // If still no token, scan localStorage for a JWT-looking string or nested token fields
    if (!token) {
      const jwtRegex = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        const val = localStorage.getItem(key);
        if (!val) continue;
        if (jwtRegex.test(val)) {
          token = val;
          break;
        }
        try {
          const parsed = JSON.parse(val);
          const candidate = parsed?.accessToken || parsed?.token || parsed?.authToken || parsed?.data?.token || parsed?.user?.token;
          if (candidate && jwtRegex.test(String(candidate))) {
            token = String(candidate);
            break;
          }
        } catch (e) {
          // ignore
        }
      }
    }
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-access-token'] = token;
    }
    console.log('setProductApproval request', { productId, is_approved, status, usingToken: !!token });
    const response = await axiosInstance.put(
      `${API_BASE_URL}/api/product/${productId}`,
      { is_approved, status },
      { headers }
    );
    console.log('setProductApproval response', response?.data);
    return response.data;
  } catch (err: any) {
    console.error('setProductApproval error', err?.response || err);
    return rejectWithValue(err.response?.data?.message || "Failed to set product approval");
  }
});

// Add Product Attribute Thunk
export const fetchProductAttributes = createAsyncThunk<
  any,
  string,
  { rejectValue: string }
>("product/fetchProductAttributes", async (categoryId, { rejectWithValue }) => {
  try {
    const response = await axiosPublic.get(
      `/api/productattribute/${categoryId}`
    );
    return response.data.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch product attributes"
    );
  }
});

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProductSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
      state.pagination.page = 1; // Reset to first page on search
    },
    setProductFilters(state, action: PayloadAction<ProductFilters>) {
      state.filters = action.payload;
      state.pagination.page = 1; // Reset to first page on filter change
    },
    resetProductFilters(state) {
      state.filters = {};
      state.pagination.page = 1;
    },
    setProductPage(state, action: PayloadAction<number>) {
      state.pagination.page = action.payload;
    },
    setProductLimit(state, action: PayloadAction<number>) {
      state.pagination.limit = action.payload;
      state.pagination.page = 1; // Reset to first page on limit change
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
      })
      // Product Attribute Thunk
      .addCase(fetchProductAttributes.pending, (state) => {
        state.productAttributesLoading = true;
        state.productAttributesError = null;
      })
      .addCase(fetchProductAttributes.fulfilled, (state, action) => {
        state.productAttributesLoading = false;
        state.productAttributes = action.payload;
      })
      .addCase(fetchProductAttributes.rejected, (state, action) => {
        state.productAttributesLoading = false;
        state.productAttributesError =
          action.payload || "Failed to fetch product attributes";
      });
  },
});

export const {
  setProductSearchQuery,
  setProductFilters,
  resetProductFilters,
  setProductPage,
  setProductLimit,
} = productSlice.actions;

export default productSlice.reducer;

