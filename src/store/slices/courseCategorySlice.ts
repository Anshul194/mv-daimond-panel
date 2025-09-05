import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../../services/axiosConfig';

interface CourseCategory {
    image: string;
    subCategoryCount: number;
    createdAt: string;
    status: string;
    _id: string;
    name: string;
    slug: string;
    isDeleted: boolean;
    updatedAt: string;
    subCategories: string[];
    __v: number;
}

interface FetchCategoriesParams {
    page?: number;
    limit?: number;
    filters?: {
        status?: string;
        isDeleted?: boolean;
    };
    searchFields?: {
        name?: string;
    };
    sort?: {
        createdAt?: 'asc' | 'desc';
        name?: 'asc' | 'desc';
    };
}

interface CourseCategoryState {
    subcategoriesLoading: any;
    categories: CourseCategory[];
    subCategories: SubCategory[]; // <-- Add this line
    loading: boolean;
    error: string | null;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    searchQuery: string;
 filters: {
        status: string;
        isDeleted: boolean;
    };
}


const initialState: CourseCategoryState = {
    categories: [],
    subCategories: [], // <-- Add this line
    loading: false,
    error: null,
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    },
    searchQuery: '',
    filters: {
        status: '',
        isDeleted: false,
    },
    subcategoriesLoading: undefined
};

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

// 1. Define the SubCategory interface
interface SubCategory {
    category: any;
    parentCategory: any;
    _id: string;
    name: string;
    slug: string;
    categoryId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    isDeleted?: boolean;
    __v?: number;
}

// 2. Add the async thunk for creating a subcategory
export const createSubCategory = createAsyncThunk<
    SubCategory,
    {
        name: string;
        slug: string;
        categoryId: string;
        status: string;
    }
>('subCategories/create', async (subCategoryData, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(
            `${API_BASE_URL}/api/SubCategory`,
            subCategoryData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data?.data?.subCategory;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

// Async thunk to fetch course categories with pagination and search
export const fetchCourseCategories = createAsyncThunk<
    {
        categories: CourseCategory[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    },
    FetchCategoriesParams
>('courseCategories/fetchAll', async (params = {}, { rejectWithValue }) => {
    try {
        const {
            page = 1,
            limit = 10,
            filters = {},
            searchFields = {},
            sort = { createdAt: 'desc' }
        } = params;

        // Build query parameters
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

        console.log('Fetching course categories with params:', {
            page,
            limit,
            filters,
            searchFields,
            sort,
            queryParams: queryParams.toString()
        });

        const response = await axiosInstance.get(
            `${API_BASE_URL}/api/category?${queryParams.toString()}`
        );

        console.log('Fetched  categories:', response.data);
        
        const data = response.data;

        console.log('API Total Documents:', data.body.totalDocuments || data.body.total);
        console.log('API Total Pages:', data.body);
        console.log('API Pagination:', data.body.currentPage || data.body);
        console.log('API Limit:',data);

        return {
            categories: data?.body?.data?.result || [],
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
});

export const fetchsubCategoriesByCategory = createAsyncThunk<
    SubCategory[],
    string
>('subCategories/fetchByCategory', async (categoryId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(
            `${API_BASE_URL}/api/category/subcategory?categoryId=${categoryId}`
        );

        console.log('Fetched subcategories for category:', categoryId, response.data);
        return response.data?.data || [];
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});


export const fetchSubCategories = createAsyncThunk<
    {
        subCategories: SubCategory[];
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
            status?: string;
            isDeleted?: boolean;
            categoryId?: string;
        };
        searchFields?: {
            name?: string;
        };
        sort?: {
            createdAt?: 'asc' | 'desc';
            name?: 'asc' | 'desc';
        };
    }
>('subCategories/fetchAll', async (params = {}, { rejectWithValue }) => {
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
            `${API_BASE_URL}/api/SubCategory?${queryParams.toString()}`
        );


        const data = response.data;
        console.log('Fetched subcategories:', data?.body?.data?.results);
        return {
            subCategories: data?.body?.data?.results || [],
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
});


// Async thunk to delete a course category by ID
export const deleteCourseCategory = createAsyncThunk<
    string, // Return the deleted category ID
    string  // Accept the category ID as argument
>('courseCategories/delete', async (categoryId, { rejectWithValue }) => {
    try {

          await axiosInstance.delete(`${API_BASE_URL}/api/category/${categoryId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        return categoryId;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});


export const deleteSubCategory = createAsyncThunk<
    string, // Return the deleted subcategory ID
    string  // Accept the subcategory ID as argument
>('subCategories/delete', async (subCategoryId, { rejectWithValue }) => {
    try {
        await axiosInstance.delete(`${API_BASE_URL}/api/SubCategory/${subCategoryId}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return subCategoryId;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});


export const createCourseCategory = createAsyncThunk<
  CourseCategory,
  FormData
>('courseCategories/create', async (formData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/category`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data?.data?.category;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});


export const updateCourseCategory = createAsyncThunk<
    CourseCategory,
    { categoryId: string; formData: FormData }
>('courseCategories/update', async ({ categoryId, formData }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(
            `${API_BASE_URL}/api/category/${categoryId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        console.log('Update response:', response.data);
        return response.data?.data;
    } catch (err: any) {
        console.error('Error updating  category:', err?.message);

        return rejectWithValue(err.response?.data?.message || err.message);
    }
});


// Async thunk to fetch a single course category by ID
export const fetchCourseCategoryById = createAsyncThunk<
    CourseCategory,
    string
>('courseCategories/fetchById', async (categoryId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(
            `${API_BASE_URL}/api/category/${categoryId}`
        );
        return response.data?.body?.data?.category || response.data?.body?.data || response.data?.body;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});

export const fetchSubCategoryById = createAsyncThunk<
    SubCategory,
    string
>('subCategories/fetchById', async (subCategoryId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get(
            `${API_BASE_URL}/api/SubCategory/${subCategoryId}`
        );
        return response.data?.body?.data?.subCategory || response.data?.body?.data || response.data?.body;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});


export const updateSubCategory = createAsyncThunk<
    SubCategory,
    { subCategoryId: string; formData: FormData }
>('subCategories/update', async ({ subCategoryId, formData }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(
            `${API_BASE_URL}/api/SubCategory/${subCategoryId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        console.log('Update response:', response.data);
        return response.data?.body?.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || err.message);
    }
});



const courseCategorySlice = createSlice({
    name: 'courseCategories',
    initialState,
    reducers: {
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
            state.searchQuery = '';
        },

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCourseCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCourseCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload.categories;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchCourseCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createCourseCategory.pending, (state:any) => {
                state.loading = true;
                state.error = null;
            }
            )
            .addCase(createCourseCategory.fulfilled, (state:any, action:any) => {
                state.loading = false;
                state.categories.push(action.payload);
            }
            )
            .addCase(createCourseCategory.rejected, (state:any, action:any) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createSubCategory.pending, (state:any) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createSubCategory.fulfilled, (state:any, action:any) => {
                state.loading = false;
                // Assuming you want to add the new subcategory to the categories array
                const categoryIndex = state.categories.findIndex(
                    (cat: CourseCategory) => cat._id === action.payload.categoryId
                );
                if (categoryIndex !== -1) {
                    state.categories[categoryIndex].subCategoryCount += 1; // Update subcategory count
                }
            })
            .addCase(createSubCategory.rejected, (state:any, action:any) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteCourseCategory.pending, (state:any) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCourseCategory.fulfilled, (state:any, action:any) => {
                state.loading = false;
                // Remove the deleted category from the state
                state.categories = state.categories.filter(
                    (category: CourseCategory) => category._id !== action.payload
                );
            })
            .addCase(deleteCourseCategory.rejected, (state:any, action:any) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchSubCategories.pending, (state:any) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSubCategories.fulfilled, (state:any, action:any) => {
                state.loading = false;
                // Assuming you want to add the fetched subcategories to the state
                state.subCategories  = action.payload.subCategories;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchSubCategories.rejected, (state:any, action:any) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(deleteSubCategory.pending, (state:any) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteSubCategory.fulfilled, (state:any, action:any) => {
                state.loading = false;
                const categoryIndex = state.categories.findIndex(
                    (cat: CourseCategory) => cat._id === action.payload.categoryId
                );
                if (categoryIndex !== -1) {
                    state.categories[categoryIndex].subCategoryCount -= 1;
                }
            })
            .addCase(deleteSubCategory.rejected, (state:any, action:any) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateCourseCategory.pending, (state:any) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCourseCategory.fulfilled, (state:any, action:any) => {
                state.loading = false;
                const index = state.categories.findIndex(
                    (category: CourseCategory) => category._id === action.payload._id
                );
                if (index !== -1) {
                    state.categories[index] = action.payload;
                }
            })
            .addCase(updateCourseCategory.rejected, (state:any, action:any) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchCourseCategoryById.pending, (state:any) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCourseCategoryById.fulfilled, (state:any, action:any) => {
                state.loading = false;
                // Assuming you want to update the state with the fetched category
                const index = state.categories.findIndex(
                    (category: CourseCategory) => category._id === action.payload._id
                );
                if (index !== -1) {
                    state.categories[index] = action.payload;
                } else {
                    state.categories.push(action.payload);
                }
            })
            .addCase(fetchCourseCategoryById.rejected, (state:any, action:any) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchSubCategoryById.pending, (state:any) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSubCategoryById.fulfilled, (state:any, action:any) => {
                state.loading = false;
                // Assuming you want to update the state with the fetched subcategory
                const index = state.subCategories.findIndex(
                    (subCategory: SubCategory) => subCategory._id === action.payload._id
                );
                if (index !== -1) {
                    state.subCategories[index] = action.payload;
                } else {
                    state.subCategories.push(action.payload);
                }
            })
            .addCase(fetchSubCategoryById.rejected, (state:any, action:any) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateSubCategory.pending, (state:any) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateSubCategory.fulfilled, (state:any, action:any) => {
                state.loading = false;
                const index = state.subCategories.findIndex(
                    (subCategory: SubCategory) => subCategory._id === action.payload._id
                );
                if (index !== -1) {
                    state.subCategories[index] = action.payload;
                }
            })
            .addCase(updateSubCategory.rejected, (state:any, action:any) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchsubCategoriesByCategory.pending, (state:any) => {
                state.loading = true;
                state.error = null;
            }
            )
            .addCase(fetchsubCategoriesByCategory.fulfilled, (state:any, action:any) => {
                state.loading = false;
                // Assuming you want to update the subCategories state with the fetched subcategories
                state.subCategories = action.payload;
            }
            )
            .addCase(fetchsubCategoriesByCategory.rejected, (state:any, action:any) => {
                state.loading = false;
                state.error = action.payload as string;
            });

           


        




    },
});

export const { setSearchQuery, setFilters, resetFilters } = courseCategorySlice.actions;
export default courseCategorySlice.reducer;