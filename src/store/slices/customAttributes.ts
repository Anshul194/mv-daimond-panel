import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../../services/axiosConfig';

interface LastModifiedBy {
    id?: string | null;
    email: string;
    timestamp: string;
}

interface Term {
    _id: string;
    value?: string;
    image: string;
    // Some terms are arrays of characters, reconstruct value if needed
    [key: string]: any;
}

interface CustomAttribute {
    _id: string;
    title: string;
    terms: Term[];
    images?: string[];
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    __v: number;
    lastModifiedBy: LastModifiedBy;
}

interface CustomAttributesState {
    data: CustomAttribute[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
}

const initialState: CustomAttributesState = {
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    loading: false,
    error: null,
};

export interface FetchCustomAttributesParams {
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
    searchFields?: Record<string, any>;
    sort?: Record<string, any>;
}

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

export const fetchCustomAttributes = createAsyncThunk<
    {
        data: CustomAttribute[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    },
    FetchCustomAttributesParams
>(
    'customAttributes/fetchCustomAttributes',
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

            const response = await axiosInstance.get(
                `${API_BASE_URL}/api/productattribute?${queryParams.toString()}`
            );

            const data = response.data;
            if (!data || !data.data) {
                throw new Error('Invalid response structure');
            }

            // Normalize terms: reconstruct value if missing
            const attributes = (data.data.data || data.data).map((attr: CustomAttribute) => ({
                ...attr,
                terms: attr.terms.map((term: Term) => {
                    if (term.value) return term;
                    // reconstruct value from numeric keys
                    const chars = Object.keys(term)
                        .filter(k => !isNaN(Number(k)))
                        .sort((a, b) => Number(a) - Number(b))
                        .map(k => term[k])
                        .join('');
                    return { ...term, value: chars };
                }),
            }));
            console.log('Fetched custom attributes:', data.data.totalPages);

            return {
                data: attributes,
                pagination: {
                    total: data.data.total || 0,
                    page: data.data.page || 1,
                    limit: data.data.limit || limit,
                    totalPages: data.data.totalPages || Math.ceil((data.data.total || 0) / limit),
                }
            };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const createCustomAttribute = createAsyncThunk(
    'customAttributes/createCustomAttribute',
    async (
        {
            title,
            category_id,
            terms,
        }: {
            title: string;
            category_id?: string;
            terms: { value: string; image: File | Blob }[];
        },
        { rejectWithValue }
    ) => {
        try {
            const formData = new FormData();
            formData.append('title', title);
            if (category_id) {
                formData.append('category_id', category_id);
            }
            terms.forEach((term, idx) => {
                formData.append(`terms[${idx}][value]`, term.value);
                formData.append(`terms[${idx}][image]`, term.image);
            });

            const response = await axiosInstance.post(
                `${API_BASE_URL}/api/productattribute`,
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



export const updateCustomAttribute = createAsyncThunk(
    'customAttributes/updateCustomAttribute',
    async (
        {
            id,
            title,
            terms,
        }: {
            id: string;
            title: string;
            terms: { value: string; image: string | File | Blob; filename?: string }[];
        },
        { rejectWithValue }
    ) => {
        try {
            const formData = new FormData();
            formData.append('title', title);

            terms.forEach((term, idx) => {
                formData.append(`terms[${idx}][value]`, term.value);

                // If image is a File/Blob, append as file, else append filename string if provided
                if (term.image instanceof File || term.image instanceof Blob) {
                    // If filename is provided, use it; otherwise, default to term.value or empty string
                    const fileName = term.filename || (term.image instanceof File ? term.image.name : '') || term.value || '';
                    formData.append(`terms[${idx}][image]`, term.image, fileName);
                } else if (typeof term.image === 'string' && term.image) {
                    // Pass filename as a separate field if image is a string (existing image)
                    formData.append(`terms[${idx}][image]`, term.image);
                }
            });

            const response = await axiosInstance.put(
                `${API_BASE_URL}/api/productattribute`,
                formData,
                {
                    params: { id },
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


export const deleteCustomAttribute = createAsyncThunk(
    'customAttributes/deleteCustomAttribute',
    async (
        {
            id,
            title,
            terms,
        }: {
            id: string;
            title: string;
            terms: { value: string; image: File | Blob }[];
        },
        { rejectWithValue }
    ) => {
        try {
            const formData = new FormData();
            formData.append('title', title);
            terms.forEach((term, idx) => {
                formData.append(`terms[${idx}][value]`, term.value);
                formData.append(`terms[${idx}][image]`, term.image);
            });

            const response = await axiosInstance.delete(
                `${API_BASE_URL}/api/productattribute`,
                {
                    params: { id },
                    data: formData,
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

const customAttributesSlice = createSlice({
    name: 'customAttributes',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchCustomAttributes.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCustomAttributes.fulfilled, (state, action: PayloadAction<Omit<CustomAttributesState, 'loading' | 'error'>>) => {
                state.loading = false;
                state.data = action.payload.data;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.limit = action.payload.limit;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchCustomAttributes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createCustomAttribute.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCustomAttribute.fulfilled, (state, action: PayloadAction<CustomAttribute>) => {
                state.loading = false;
                state.data.push(action.payload);
                state.total += 1; // Increment total count
            })
            .addCase(createCustomAttribute.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateCustomAttribute.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCustomAttribute.fulfilled, (state, action: PayloadAction<CustomAttribute>) => {
                state.loading = false;
                const index = state.data.findIndex(attr => attr._id === action.payload._id);
                if (index !== -1) {
                    state.data[index] = action.payload; // Update existing attribute
                }
            })
            .addCase(updateCustomAttribute.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteCustomAttribute.pending, state => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCustomAttribute.fulfilled, (state, action: PayloadAction<{ _id: string }>) => {
                state.loading = false;
                state.data = state.data.filter(attr => attr._id !== action.payload._id);
                state.total -= 1; // Decrement total count
            })
            .addCase(deleteCustomAttribute.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });


    },
});

export default customAttributesSlice.reducer;