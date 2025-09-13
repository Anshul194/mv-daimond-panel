import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../../services/axiosConfig';

interface BrandState {
    loading: boolean;
    error: string | null;
    data: any;
}

const initialState: BrandState = {
    loading: false,
    error: null,
    data: null,
};

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

export const createBrand = createAsyncThunk(
    'brand/createBrand',
    async (
        {
            name,
            title,
            description,
            logo, // File object
        }: {
            name: string;
            title: string;
            description: string;
            logo: File;
        },
        { rejectWithValue }
    ) => {
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('logo', logo);

            const response = await axiosInstance.post(`${API_BASE_URL}/api/brands`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error: any) {
            console.log('Error creating brand:', error?.message);
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);


export const fetchBrands = createAsyncThunk<
    {
        brands: any[];
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
            title?: string;
        };
        searchFields?: {
            name?: string;
            title?: string;
        };
        sort?: {
            createdAt?: 'asc' | 'desc';
            name?: 'asc' | 'desc';
        };
    } | void,
    { rejectValue: string }
>('brand/fetchBrands', async (params = {}, { rejectWithValue }) => {
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
            `${API_BASE_URL}/api/brands?${queryParams.toString()}`
        );

        const data = response.data;
        console.log('Fetched Brands:', data?.body?.data?.result);
        return {
            brands: data?.body?.data?.result || [],
            pagination: {
                total: data.body?.data?.totalDocuments || data.body.total || 0,
                page: data.body?.data?.currentPage || data.body.page || 1,
                limit: data.body?.data?.limit || limit,
                totalPages: data.body?.data?.totalPages || Math.ceil((data.body.totalDocuments || 0) / limit),
            }
        };
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch brands');
    }
});

export const updateBrand = createAsyncThunk(
    'brand/updateBrand',
    async (
        {
            id,
            name,
            title,
            description,
            logo, // File object (optional)
            token,
        }: {
            id: string;
            name: string;
            title: string;
            description: string;
            logo?: File;
            token: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('title', title);
            formData.append('description', description);
            if (logo) {
                formData.append('logo', logo);
            }

            const response = await axiosInstance.put(
                `${API_BASE_URL}/api/brands/${id}`,
                formData,
                {
                    headers: {
                                     'Content-Type': 'multipart/form-data',

                    },
                }
            );

            console.log('Brand updated successfully:', response.data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);



export const deleteBrand = createAsyncThunk(
    'brand/deleteBrand',
    async ({ id, token }: { id: string; token: string }, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`${API_BASE_URL}/api/brands/${id}`, {
                headers: {
             'Content-Type': 'application/json',
                },
            });
            console.log(`Brand with ID ${id} deleted successfully.`);
            return id; // Return the ID of the deleted brand
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);


export const fetchBrandById = createAsyncThunk(
    'brand/fetchBrandById',
    async (
        { id, token }: { id: string; token: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await axiosInstance.get(`${API_BASE_URL}/api/brands/${id}`, {
                headers: {
                  'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);


const brandSlice = createSlice({
    name: 'brand',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createBrand.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createBrand.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(createBrand.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchBrands.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBrands.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchBrands.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateBrand.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBrand.fulfilled, (state, action) => {
                state.loading = false;
                // Update the brand data in the state
                if (Array.isArray(state.data)) {
                    const index = state.data.findIndex((brand: any) => brand._id === action.payload._id);
                    if (index !== -1) {
                        state.data[index] = action.payload;
                    }
                }
            })
            .addCase(updateBrand.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteBrand.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteBrand.fulfilled, (state, action) => {
                state.loading = false;
                // Remove the deleted brand from the state
                if (Array.isArray(state.data)) {
                    state.data = state.data.filter((brand: any) => brand._id !== action.payload);
                }
            })
            .addCase(deleteBrand.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchBrandById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBrandById.fulfilled, (state, action) => {
                state.loading = false;
                // Update the brand data in the state
                if (state.data) {
                    const index = state.data.findIndex((brand: any) => brand._id === action.payload._id);
                    if (index !== -1) {
                        state.data[index] = action.payload;
                    } else {
                        state.data.push(action.payload);
                    }
                } else {
                    state.data = [action.payload];
                }
            })
            .addCase(fetchBrandById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

    },
});

export default brandSlice.reducer;