import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface Collection {
  _id: string;
  name: string;
  image: string;
  status: string;
  order: number;
  createdAt: string;
}

interface CollectionState {
  collections: Collection[];
  loading: boolean;
  error: string | null;
  totalDocuments: number;
  currentPage: number;
  totalPages: number;
}

const initialState: CollectionState = {
  collections: [],
  loading: false,
  error: null,
  totalDocuments: 0,
  currentPage: 1,
  totalPages: 1,
};

export const fetchCollections = createAsyncThunk(
  "collection/fetchCollections",
  async ({ page = 1, limit = 10, status }: { page?: number; limit?: number; status?: string } = {}) => {
    let url = `/api/collection?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    const response = await axios.get(url);
    return response.data.data;
  }
);

export const createCollection = createAsyncThunk(
  "collection/createCollection",
  async (formData: FormData) => {
    const response = await axios.post("/api/collection", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  }
);

export const updateCollection = createAsyncThunk(
  "collection/updateCollection",
  async ({ id, formData }: { id: string; formData: FormData }) => {
    const response = await axios.put(`/api/collection/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  }
);

export const deleteCollection = createAsyncThunk(
  "collection/deleteCollection",
  async (id: string) => {
    await axios.delete(`/api/collection/${id}`);
    return id;
  }
);

const collectionSlice = createSlice({
  name: "collection",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollections.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.loading = false;
        state.collections = action.payload.result;
        state.totalDocuments = action.payload.totalDocuments;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch collections";
      })
      .addCase(createCollection.fulfilled, (state, action) => {
        state.collections.unshift(action.payload);
      })
      .addCase(updateCollection.fulfilled, (state, action) => {
        const index = state.collections.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.collections[index] = action.payload;
        }
      })
      .addCase(deleteCollection.fulfilled, (state, action) => {
        state.collections = state.collections.filter((c) => c._id !== action.payload);
      });
  },
});

export default collectionSlice.reducer;
