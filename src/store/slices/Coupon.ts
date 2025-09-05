import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

// ----------------------
// ✅ Types
// ----------------------
interface Coupon {
  _id?: string;
  code: string;
  discount: number;
  isActive: boolean;
  expiresAt?: string;
  [key: string]: any;
}

interface CouponFilters {
  [key: string]: string | number | boolean;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CouponState {
  coupons: Coupon[];
  loading: boolean;
  error: string | null;
  success: boolean;
  searchQuery: string;
  filters: CouponFilters;
  pagination: Pagination;
}

// ----------------------
// ✅ Initial State
// ----------------------
const initialState: CouponState = {
  coupons: [],
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
// ✅ Create Coupon
// ----------------------
export const createCoupon = createAsyncThunk<
  any,
  Partial<Coupon>,
  { rejectValue: string }
>("coupon/create", async (couponData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/api/coupon", couponData);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to create coupon"
    );
  }
});

// ----------------------
// ✅ Fetch All Coupons
// ----------------------
export interface FetchCouponsParams {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
  searchFields?: Record<string, any>;
  sort?: Record<string, "asc" | "desc">;
}

export const fetchCoupons = createAsyncThunk<
  {
    coupons: Coupon[];
    pagination: Pagination;
  },
  FetchCouponsParams | void,
  { rejectValue: string }
>("coupon/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const {
      page = 1,
      limit = 10,
      filters = {},
      searchFields = {},
      sort = { createdAt: "desc" },
    } = params || {};

    const queryParams = new URLSearchParams();
    // queryParams.append("page", page.toString());
    // queryParams.append("limit", limit.toString());

    // if (Object.keys(filters).length > 0) {
    //   queryParams.append("filters", JSON.stringify(filters));
    // }

    // if (Object.keys(searchFields).length > 0) {
    //   queryParams.append("searchFields", JSON.stringify(searchFields));
    // }

    // if (Object.keys(sort).length > 0) {
    //   queryParams.append("sort", JSON.stringify(sort));
    // }

    const response = await axiosInstance.get(
      `/api/coupon?${queryParams.toString()}`
    );
    const data = response.data;
    console.log("Fetched coupons:", data);
    return {
      coupons: data.result || [],
      pagination: {
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || limit,
        totalPages:
          data.totalPages ||
          Math.ceil((data.total || 0) / limit),
      },
    };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch coupons"
    );
  }
});

// ----------------------
// ✅ Delete Coupon
// ----------------------
export const deleteCoupon = createAsyncThunk<
  any,
  { couponId: string },
  { rejectValue: string }
>("coupon/delete", async ({ couponId }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(`/api/coupon/${couponId}`);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete coupon"
    );
  }
});

export const updateCoupon = createAsyncThunk<
  any,
  { couponId: string; couponData: Partial<Coupon> },
  { rejectValue: string }
>("coupon/update", async ({ couponId, couponData }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(
      `/api/coupon/${couponId}`,
      couponData
    );
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to update coupon"
    );
  }
});

export const getCouponById = createAsyncThunk<
  Coupon,
  { couponId: string },
  { rejectValue: string }
>("coupon/getById", async (couponId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`/api/coupon/${couponId}`);
        return response.data.coupon;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch coupon"
    );
  }
});
// ----------------------
// ✅ Slice
// ----------------------
const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {
    setCouponSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setCouponFilters(state, action: PayloadAction<CouponFilters>) {
      state.filters = action.payload;
    },
    resetCouponFilters(state) {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCoupon.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error";
        state.success = false;
      })
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload.coupons;
        state.pagination = action.payload.pagination;
        state.success = true;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch coupons";
      })
      .addCase(deleteCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCoupon.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete coupon";
      });
  },
});

// ----------------------
// ✅ Actions and Reducer
// ----------------------
export const { setCouponSearchQuery, setCouponFilters, resetCouponFilters } =
  couponSlice.actions;

export default couponSlice.reducer;
