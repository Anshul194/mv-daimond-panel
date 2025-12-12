import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../../services/axiosConfig';

interface DeliveryOption {
    _id: string;
    icon: string;
    title: string;
    sub_title: string;
}

interface DeliveryState {
    options: DeliveryOption[];
    loading: boolean;
    error: string | null;
}

const initialState: DeliveryState = {
    options: [],
    loading: false,
    error: null,
};
const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

// Async thunk to fetch delivery options
export const fetchDeliveryOptions = createAsyncThunk<
    {
        options: DeliveryOption[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    },
    {
        page?: number;
        limit?: number;
        filters?: Record<string, any>;
        searchFields?: Record<string, any>;
        sort?: Record<string, any>;
    }
>(
    'delivery/fetchOptions',
    async (params = {}, { rejectWithValue }) => {
        try {
            const {
                page = 1,
                limit = 10,
                filters = {},
                searchFields = {},
                sort = { createdAt: 'desc' }
            } = params;

            const queryParams = new URLSearchParams();
            queryParams.append('page', page.toString());
            queryParams.append('limit', limit.toString());

            if (Object.keys(filters).length > 0) {
                queryParams.append('filters', JSON.stringify(filters));
            }

            if (Object.keys(searchFields).length > 0) {
                queryParams.append('searchFields', JSON.stringify(searchFields));
            }

            if (Object.keys(sort).length > 0) {
                queryParams.append('sort', JSON.stringify(sort));
            }

            const response = await axios.get(
                `${API_BASE_URL}/api/delivery-options?${queryParams.toString()}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            const data = response.data;
            if (!data || !data.body) {
                throw new Error('Invalid response structure');
            }

            const apiData = data.body.data || data.body;
                console.log('api',apiData)
            return {
                options: apiData.result || apiData || [],
                pagination: {
                    total: data.body?.data?.totalDocuments || data.body.total || 0,
                    page: data.body?.data?.currentPage || data.body.page || 1,
                    limit: data.body?.data?.limit || limit,
                    totalPages: data.body?.data?.totalPages || Math.ceil((data.body.totalDocuments || 0) / limit),
                }
            };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);


export const fetchDeliveryOptionById = createAsyncThunk<
    DeliveryOption,
    string,
    { rejectValue: string }
>(
    'delivery/fetchOptionById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/delivery-options/${id}`, {
                headers: {
                    Authorization: 'Bearer <YOUR_TOKEN_HERE>',
                },
                withCredentials: true,
            });
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);


export const deleteDeliveryOption = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>(
    'delivery/deleteOption',
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`${API_BASE_URL}/api/delivery-options/${id}`, {
                headers: {
                    'Content-Type': 'application/json',},   
            });
            return id;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);


export const updateDeliveryOption = createAsyncThunk<
    DeliveryOption,
    { id: string; icon?: File; title?: string; sub_title?: string },
    { rejectValue: string }
>(
    'delivery/updateOption',
    async ({ id, icon, title, sub_title }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            if (icon) formData.append('icon', icon);
            if (title) formData.append('title', title);
            if (sub_title) formData.append('sub_title', sub_title);

            const response = await axiosInstance.put(
                `${API_BASE_URL}/api/delivery-options/${id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Async thunk to create a delivery option
export const createDeliveryOption = createAsyncThunk<
    DeliveryOption,
    { icon: File; title: string; sub_title: string }
>('delivery/createOption', async (data, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        formData.append('icon', data.icon);
        formData.append('title', data.title);
        formData.append('sub_title', data.sub_title);

        const response = await axiosInstance.post(`${API_BASE_URL}/api/delivery-options`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

const deliverySlice = createSlice({
    name: 'delivery',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchDeliveryOptions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDeliveryOptions.fulfilled, (state, action) => {
                state.loading = false;
                state.options = action.payload;
            })
            .addCase(fetchDeliveryOptions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create
            .addCase(createDeliveryOption.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createDeliveryOption.fulfilled, (state, action) => {
                state.loading = false;
                state.options.push(action.payload);
            })
            .addCase(createDeliveryOption.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default deliverySlice.reducer;