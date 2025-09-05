import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { fetchSizes, createSize, updateSize, deleteSize } from "../../../store/slices/sizeSlice";
import { Plus, Loader2, Search, ChevronLeft, ChevronRight, RotateCcw, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface Size {
    _id?: string;
    name: string;
    size_code: string;
}

const PAGE_LIMITS = [5, 10, 20];

const SizeList: React.FC = () => {
    const dispatch = useAppDispatch();
    const { sizes, loading, error } = useAppSelector((state) => state.size);

    // Pagination & filters
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [filters, setFilters] = useState<{ name?: string; size_code?: string }>({});
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ name: "", size_code: "" });
    const [formLoading, setFormLoading] = useState(false);

    // Edit modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState<{ _id?: string; name: string; size_code: string }>({ name: "", size_code: "" });
    const [editLoading, setEditLoading] = useState(false);

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Fetch sizes
    useEffect(() => {
        const params = {
            page,
            limit,
            filters,
            searchFields: search ? { name: search, size_code: search } : {},
            sort: { createdAt: "desc" as const },
        };
        dispatch(fetchSizes(params) as any).then((res: any) => {
            if (res?.payload?.pagination) setPagination(res.payload.pagination);
        });
    }, [dispatch, page, limit, filters, search]);

    // Debounced search
    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput), 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    // Add modal handlers
    const handleOpenModal = () => {
        setForm({ name: "", size_code: "" });
        setModalOpen(true);
    };
    const handleCloseModal = () => {
        setModalOpen(false);
        setFormLoading(false);
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            await dispatch(createSize(form) as any).unwrap();
            toast.success("Size created successfully");
            handleCloseModal();
            dispatch(fetchSizes({ page, limit, filters, searchFields: search ? { name: search, size_code: search } : {}, sort: { createdAt: "desc" } }) as any);
        } catch (err: any) {
            toast.error(typeof err === "string" ? err : "Failed to create size");
            setFormLoading(false);
        }
    };

    // Edit modal handlers
    const handleOpenEditModal = (size: Size) => {
        setEditForm(size);
        setEditModalOpen(true);
    };
    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        setEditLoading(false);
    };
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm._id) return;
        setEditLoading(true);
        try {
            await dispatch(updateSize({ id: editForm._id, data: { name: editForm.name, size_code: editForm.size_code } }) as any).unwrap();
            toast.success("Size updated successfully");
            handleCloseEditModal();
            dispatch(fetchSizes({ page, limit, filters, searchFields: search ? { name: search, size_code: search } : {}, sort: { createdAt: "desc" } }) as any);
        } catch (err: any) {
            toast.error(typeof err === "string" ? err : "Failed to update size");
            setEditLoading(false);
        }
    };

    // Delete modal handlers
    const handleOpenDeleteModal = (id: string) => {
        setDeleteId(id);
        setDeleteModalOpen(true);
    };
    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setDeleteLoading(false);
        setDeleteId(null);
    };
    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await dispatch(deleteSize({ id: deleteId }) as any).unwrap();
            toast.success("Size deleted successfully");
            handleCloseDeleteModal();
            dispatch(fetchSizes({ page, limit, filters, searchFields: search ? { name: search, size_code: search } : {}, sort: { createdAt: "desc" } }) as any);
        } catch (err: any) {
            toast.error(typeof err === "string" ? err : "Failed to delete size");
            setDeleteLoading(false);
        }
    };

    const handleResetFilters = () => {
        setSearchInput("");
        setFilters({});
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) setPage(newPage);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Sizes</h1>
                <button
                    onClick={handleOpenModal}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                    <Plus className="w-4 h-4" />
                    Add Size
                </button>
            </div>

            <div className="bg-white shadow p-4 rounded-md mb-6 dark:bg-gray-900 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search by name or code..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm dark:text-gray-300">Show:</span>
                    <select
                        value={limit}
                        onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                        className="border border-gray-300 rounded-md px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    >
                        {PAGE_LIMITS.map((l) => (
                            <option key={l} value={l}>{l}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
                >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                </button>
            </div>

            

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-x-auto dark:bg-gray-900">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Size Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
                            {sizes.map((size, idx) => (
                                <tr key={size._id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                        {(pagination.page - 1) * pagination.limit + idx + 1}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{size.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{size.size_code}</td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button
                                            onClick={() => handleOpenEditModal(size)}
                                            className="p-2 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900"
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4 text-indigo-600" />
                                        </button>
                                        <button
                                            onClick={() => handleOpenDeleteModal(size._id!)}
                                            className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {sizes.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400 dark:text-gray-500">
                                        No sizes found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            <div className="flex justify-end gap-2 mt-4">
                <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`px-3 py-1 rounded ${
                            pagination.page === p
                                ? "bg-indigo-500 text-white"
                                : "bg-gray-100 dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                    >
                        {p}
                    </button>
                ))}
                <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Add Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 relative">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            ×
                        </button>
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Add Size</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Name
                                </label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    disabled={formLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Size Code
                                </label>
                                <input
                                    name="size_code"
                                    value={form.size_code}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    disabled={formLoading}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                    disabled={formLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2"
                                    disabled={formLoading}
                                >
                                    {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 relative">
                        <button
                            onClick={handleCloseEditModal}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            ×
                        </button>
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Edit Size</h2>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Name
                                </label>
                                <input
                                    name="name"
                                    value={editForm.name}
                                    onChange={handleEditChange}
                                    required
                                    className="w-full border border-gray-300 rounded px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    disabled={editLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Size Code
                                </label>
                                <input
                                    name="size_code"
                                    value={editForm.size_code}
                                    onChange={handleEditChange}
                                    required
                                    className="w-full border border-gray-300 rounded px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    disabled={editLoading}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleCloseEditModal}
                                    className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                    disabled={editLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2"
                                    disabled={editLoading}
                                >
                                    {editLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6 relative">
                        <button
                            onClick={handleCloseDeleteModal}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            ×
                        </button>
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Delete Size</h2>
                        <p className="mb-4 text-gray-700 dark:text-gray-300">Are you sure you want to delete this size?</p>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={handleCloseDeleteModal}
                                className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                disabled={deleteLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                                disabled={deleteLoading}
                            >
                                {deleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SizeList;