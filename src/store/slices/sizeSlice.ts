import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../../services/axiosConfig';

interface Size {
    _id?: string;
    name: string;
    size_code: string;
}

interface SizeState {
    sizes: Size[];
    loading: boolean;
    error: string | null;
}

const initialState: SizeState = {
    sizes: [],
    loading: false,
    error: null,
};

// Async thunk to create a new size
export const createSize = createAsyncThunk<
    Size,
    { name: string; size_code: string },
    { rejectValue: string }
>('size/createSize', async (data, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(
            'http://localhost:3000/api/size',
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to create size');
    }
});

export const fetchSizes = createAsyncThunk<
    {
        sizes: Size[];
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
        filters?: {
            name?: string;
            size_code?: string;
        };
        searchFields?: {
            name?: string;
            size_code?: string;
        };
        sort?: {
            createdAt?: 'asc' | 'desc';
            name?: 'asc' | 'desc';
        };
    } | void,
    { rejectValue: string }
>('size/fetchSizes', async (params = {}, { rejectWithValue }) => {
    try {
        const {
            page = 1,
            limit = 10,
            filters = {},
            searchFields = {},
            sort = { createdAt: 'desc' }
        } = params || {};

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

        const response = await axiosInstance.get(
            `http://localhost:3000/api/size?${queryParams.toString()}`
        );

        const data = response.data;
        return {
            sizes: data?.body?.data?.result || [],
            pagination: {
                total: data.body?.data?.totalDocuments || data.body.total || 0,
                page: data.body?.data?.currentPage || data.body.page || 1,
                limit: data.body?.data?.limit || limit,
                totalPages: data.body?.data?.totalPages || Math.ceil((data.body.totalDocuments || 0) / limit),
            }
        };
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch sizes');
    }
});


export const fetchSizeById = createAsyncThunk<
    Size,
    string,
    { rejectValue: string }
>('size/fetchSizeById', async (id, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(
            `http://localhost:3000/api/size/${id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            }
        );
        return response.data?.body?.data || response.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch size');
    }
});


export const updateSize = createAsyncThunk<
    Size,
    { id: string; data: Partial<Size>; token?: string },
    { rejectValue: string }
>('size/updateSize', async ({ id, data, token }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(
            `http://localhost:3000/api/size/${id}`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json'                },
            }
        );
        return response.data?.body?.data || response.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to update size');
    }
});

export const deleteSize = createAsyncThunk<
    string,
    { id: string; token?: string },
    { rejectValue: string }
>('size/deleteSize', async ({ id }, { rejectWithValue }) => {
    try {
        await axiosInstance.delete(
            `http://localhost:3000/api/size/${id}`,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
            }
        );
        return id;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to delete size');
    }
});


const sizeSlice = createSlice({
    name: 'size',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createSize.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createSize.fulfilled, (state, action) => {
                state.loading = false;
                state.sizes.push(action.payload);
            })
            .addCase(createSize.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unknown error';
            })
            .addCase(fetchSizes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSizes.fulfilled, (state, action) => {
                state.loading = false;
                state.sizes = action.payload.sizes;
            })
            .addCase(fetchSizes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unknown error';
            })
            .addCase(fetchSizeById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSizeById.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.sizes.findIndex(size => size._id === action.payload._id);
                if (index !== -1) {
                    state.sizes[index] = action.payload;
                } else {
                    state.sizes.push(action.payload);
                }
            })
            .addCase(fetchSizeById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unknown error';
            })
            .addCase(updateSize.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateSize.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.sizes.findIndex(size => size._id === action.payload._id);
                if (index !== -1) {
                    state.sizes[index] = action.payload;
                } else {
                    state.sizes.push(action.payload);
                }
            })
            .addCase(updateSize.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unknown error';
            })
            .addCase(deleteSize.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteSize.fulfilled, (state, action) => {
                state.loading = false;
                state.sizes = state.sizes.filter(size => size._id !== action.payload);
            })
            .addCase(deleteSize.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unknown error';
            });
    },
});

export default sizeSlice.reducer;