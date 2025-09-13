import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../../services/axiosConfig';

interface Color {
    _id: string; // Changed from id to _id to match API response
    id?: string; // Keep id as optional for backward compatibility
    name: string;
    code: string;
    colorCode?: string; // Added for flexibility
    createdAt?: string;
    updatedAt?: string;
}

interface FetchColorsParams {
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
    searchFields?: Record<string, any>;
    sort?: Record<string, 'asc' | 'desc'>;
}

interface ColorState {
    colors: Color[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    selectedColor: Color | null; // Added for edit functionality
    loading: boolean;
    error: string | null;
}

const initialState: ColorState = {
    colors: [],
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    },
    selectedColor: null,
    loading: false,
    error: null,
};

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

export const fetchColorCodes = createAsyncThunk<
    {
        colors: Color[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    },
    FetchColorsParams
>('color/fetchColorCodes', async (params = {}, { rejectWithValue }) => {
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

        const response = await axiosInstance.get(
            `${API_BASE_URL}/api/colorcode?${queryParams.toString()}`
        );

        const data = response.data;
        if (!data || !data.body) {
            throw new Error('Invalid response structure');
        }

        console.log('API Response:', data.body);

        // Fixed pagination mapping to handle API response structure
        const apiData = data.body.data || data.body;
        console.log('API Data:', apiData);
        console.log('API Total Documents:', data.body.totalDocuments || data.body.total);
        console.log('API Total Pages:', data.body);
        console.log('API Pagination:', data.body.currentPage || data.body);
        
        return {
            colors: apiData.results || apiData || [],
            pagination: {
                total: data.body?.data?.totalDocuments || data.body.total || 0,
                page: data.body?.data?.currentPage || data.body.page || 1,
                limit: data.body?.data?.limit || limit,
                totalPages: data.body?.data?.totalPages || Math.ceil((data.body.totalDocuments || 0) / limit),
            }
        };
    } catch (error: any) {
        console.error('Fetch colors error:', error);
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const createColorCode = createAsyncThunk<
    Color,
    { name: string; colorCode: string },
    { rejectValue: string }
>('color/createColorCode', async (colorData, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(
            `${API_BASE_URL}/api/colorcode`,
            {
                name: colorData.name,
                colorCode: colorData.colorCode
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
        return response.data.body.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const updateColorCode = createAsyncThunk<
    Color,
    { id: string; name: string; colorCode: string ,status?: string},
    { rejectValue: string }
>('color/updateColorCode', async ({ id, name, colorCode ,status}, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(
            `${API_BASE_URL}/api/colorcode/${id}`,
            { name, colorCode ,status }, // Assuming status is always 'active' for updates
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
        console.log('Update Color Response:', response.data);
        return response.data?.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const fetchColorCodeById = createAsyncThunk<
    Color,
    string,
    { rejectValue: string }
>('color/fetchColorCodeById', async (id, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(`${API_BASE_URL}/api/colorcode/${id}`);
        return response?.data?.body?.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const deleteColorCode = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>('color/deleteColorCode', async (colorId, { rejectWithValue }) => {
    try {
        await axiosInstance.delete(`${API_BASE_URL}/api/colorcode/${colorId}`);
        return colorId;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
});

const colorSlice = createSlice({
    name: 'color',
    initialState,
    reducers: {
        setSelectedColor: (state, action) => {
            state.selectedColor = action.payload;
        },
        clearSelectedColor: (state) => {
            state.selectedColor = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchColorCodes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchColorCodes.fulfilled, (state, action) => {
                state.loading = false;
                state.colors = action.payload.colors;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchColorCodes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createColorCode.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createColorCode.fulfilled, (state, action) => {
                state.loading = false;
                state.colors.push(action.payload);
                state.pagination.total += 1;
            })
            .addCase(createColorCode.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteColorCode.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteColorCode.fulfilled, (state, action) => {
                state.loading = false;
                // Fixed to use _id instead of id
                state.colors = state.colors.filter(color => color._id !== action.payload);
                state.pagination.total -= 1;
            })
            .addCase(deleteColorCode.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateColorCode.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateColorCode.fulfilled, (state, action) => {
                state.loading = false;
                // Fixed to use _id instead of id
                const index = state.colors.findIndex(color => color._id === action.payload._id);
                if (index !== -1) {
                    state.colors[index] = action.payload;
                }
            })
            .addCase(updateColorCode.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchColorCodeById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchColorCodeById.fulfilled, (state, action) => {
                state.loading = false;
                // Fixed to use _id instead of id
                const index = state.colors.findIndex(color => color._id === action.payload._id);
                if (index !== -1) {
                    state.colors[index] = action.payload;
                } else {
                    state.colors.push(action.payload);
                }
                state.selectedColor = action.payload;
            })
            .addCase(fetchColorCodeById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setSelectedColor, clearSelectedColor, clearError } = colorSlice.actions;
export default colorSlice.reducer;