import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

// Types
interface Order {
  _id: string;
  payment_track: string;
  payment_gateway: string;
  transaction_id: string;
  orderSessionId: string;
  order_status: "pending" | "processing" | "shipped" | "delivered" | "canceled" | "returned";
  payment_status: "paid" | "unpaid";
  invoice_number: number;
  user_id: string;
  type: string;
  tax_id: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  invoice_url?: string;
  order_number?: string;
  order_address?: Record<string, unknown> | null;
  sub_orders?: Record<string, unknown>[];
  order_track?: Record<string, unknown>[];
  order_payment_meta?: Record<string, unknown> | null;
}

interface OrderFilters {
  [key: string]: string | number | boolean;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  success: boolean;
  searchQuery: string;
  filters: OrderFilters;
  pagination: Pagination;
}

// Initial State
const initialState: OrderState = {
  orders: [],
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

// ✅ Create Order
export const createOrder = createAsyncThunk<
  Order,
  Partial<Order>,
  { rejectValue: string }
>("order/create", async (orderData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/api/order`, orderData);
    return response.data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      error.response?.data?.message || "Failed to create order"
    );
  }
});

// ✅ Fetch Orders
export interface FetchOrdersParams {
  page?: number;
  limit?: number;
  filters?: Record<string, string | number | boolean>;
  searchFields?: Record<string, string>;
  sort?: Record<string, "asc" | "desc">;
}

export const fetchOrders = createAsyncThunk<
  {
    orders: Order[];
    pagination: Pagination;
  },
  FetchOrdersParams | void,
  { rejectValue: string }
>("order/fetchAll", async (params = {}, { rejectWithValue }) => {
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
      `${API_BASE_URL}/api/order?admin=true&${queryParams.toString()}`
    );
    const data = response.data;
    console.log("Fetched Orders:", data);
    
    // Process the orders to extract actual data from Mongoose documents
    const processedOrders = data?.data?.map((order: Record<string, unknown>) => {
      // If order has _doc property, extract the actual data
      if (order._doc) {
        return {
          ...order._doc,
          // Merge additional populated fields that might be outside _doc
          order_address: order.order_address || null,
          sub_orders: order.sub_orders || [],
          order_track: order.order_track || [],
          order_payment_meta: order.order_payment_meta || null,
        };
      }
      // If no _doc, return as is (fallback)
      return order;
    }) || [];
    
    return {
      orders: processedOrders,
      pagination: {
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || limit,
        totalPages: data.totalPages || Math.ceil((data.total || 0) / limit),
      },
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to fetch orders"
    );
  }
});

// ✅ Delete Order
export const deleteOrder = createAsyncThunk<
  { success: boolean; message: string },
  { orderId: string },
  { rejectValue: string }
>("order/delete", async ({ orderId }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(`${API_BASE_URL}/api/order/${orderId}`);
    return response.data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete order"
    );
  }
});

export const fetchOrderById = createAsyncThunk<Order, { orderId: string }>(
  "order/fetchById",
  async ({ orderId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/api/order/${orderId}`);
      return response.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch order"
      );
    }
  }
);

// ✅ Update Order
export const updateOrder = createAsyncThunk<
  Order,
  { orderId: string; updateData: Partial<Order> },
  { rejectValue: string }
>("order/update", async ({ orderId, updateData }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/api/order_update/${orderId}`,
      updateData
    );
    return response.data;
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      error.response?.data?.message || "Failed to update order"
    );
  }
});

// ✅ Slice
const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setOrderSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setOrderFilters(state, action: PayloadAction<OrderFilters>) {
      state.filters = action.payload;
    },
    resetOrderFilters(state) {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOrder.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error";
        state.success = false;
      })
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
        state.success = true;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch orders";
      })
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete order";
      })
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateOrder.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update order";
        state.success = false;
      });
  },
});

// ✅ Actions
export const { setOrderSearchQuery, setOrderFilters, resetOrderFilters } =
  orderSlice.actions;

export default orderSlice.reducer;
