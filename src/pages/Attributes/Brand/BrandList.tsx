import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
    fetchBrands,
    createBrand,
    updateBrand,
    deleteBrand,
} from "../../../store/slices/brandslice";
import toast from "react-hot-toast";
import {
    Pencil,
    Trash2,
    CheckCircle,
    XCircle,
    Search,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    X,
    AlertTriangle,
} from "lucide-react";

const PAGE_LIMITS = [5, 10, 20];

const BrandDeleteModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    brand: any | null;
    isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, brand, isDeleting }) => {
    if (!isOpen || !brand) return null;
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/30" onClick={onClose}></div>
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
                    <div className="flex items-center justify-between p-6 border-b">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold">Delete Brand</h3>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to delete the brand <strong>{brand.name}</strong>?
                        </p>
                        <p className="text-sm text-gray-500">This action cannot be undone.</p>
                    </div>
                    <div className="flex justify-end gap-3 p-6 border-t">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none disabled:opacity-50 flex items-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BrandList: React.FC = () => {
    const dispatch = useAppDispatch();
    const { data, loading, error } = useAppSelector((state) => state.brand);

    // Pagination & filters
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({
        name: "",
        title: "",
        description: "",
        logo: null as File | null,
    });
    const [formLoading, setFormLoading] = useState(false);

    // Edit modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        _id: "",
        name: "",
        title: "",
        description: "",
        logo: null as File | null,
    });
    const [editLoading, setEditLoading] = useState(false);

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [brandToDelete, setBrandToDelete] = useState<any | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Fetch brands
    useEffect(() => {
        dispatch(
            fetchBrands({
                page,
                limit,
                searchFields: search ? { name: search, title: search } : {},
            }) as any
        );
    }, [dispatch, page, limit, search]);

    // Debounced search
    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput), 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    // Add modal handlers
    const handleOpenModal = () => {
        setForm({ name: "", title: "", description: "", logo: null });
        setModalOpen(true);
    };
    const handleCloseModal = () => {
        setModalOpen(false);
        setFormLoading(false);
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setForm((prev) => ({ ...prev, logo: e.target.files![0] }));
        }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            await dispatch(
                createBrand({
                    name: form.name,
                    title: form.title,
                    description: form.description,
                    logo: form.logo!,
                }) as any
            ).unwrap();
            toast.success("Brand created");
            handleCloseModal();
            dispatch(fetchBrands({ page, limit, searchFields: search ? { name: search, title: search } : {} }) as any);
        } catch (err: any) {
            toast.error(typeof err === "string" ? err : "Failed to create brand");
            setFormLoading(false);
        }
    };

    // Edit modal handlers
    const handleOpenEditModal = (brand: any) => {
        setEditForm({
            _id: brand._id,
            name: brand.name,
            title: brand.title,
            description: brand.description,
            logo: null,
        });
        setEditModalOpen(true);
    };
    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        setEditLoading(false);
    };
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };
    const handleEditLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setEditForm((prev) => ({ ...prev, logo: e.target.files![0] }));
        }
    };
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            await dispatch(
                updateBrand({
                    id: editForm._id,
                    name: editForm.name,
                    title: editForm.title,
                    description: editForm.description,
                    logo: editForm.logo || undefined,
                    token: "",
                }) as any
            ).unwrap();
            toast.success("Brand updated");
            handleCloseEditModal();
            dispatch(fetchBrands({ page, limit, searchFields: search ? { name: search, title: search } : {} }) as any);
        } catch (err: any) {
            console.error("Error updating brand:", err);
            toast.error(typeof err === "string" ? err : "Failed to update brand");
            setEditLoading(false);
        }
    };

    // Delete modal handlers
    const handleOpenDeleteModal = (brand: any) => {
        setBrandToDelete(brand);
        setDeleteModalOpen(true);
    };
    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setDeleteLoading(false);
        setBrandToDelete(null);
    };
    const handleDelete = async () => {
        if (!brandToDelete) return;
        setDeleteLoading(true);
        try {
            await dispatch(deleteBrand({ id: brandToDelete._id, token: "" }) as any).unwrap();
            toast.success("Brand deleted");
            handleCloseDeleteModal();
            dispatch(fetchBrands({ page, limit, searchFields: search ? { name: search, title: search } : {} }) as any);
        } catch (err: any) {
            console.error("Error deleting brand:", err);
            toast.error(typeof err === "string" ? err : "Failed to delete brand");
            setDeleteLoading(false);
        }
    };

    const handleResetFilters = () => {
        setSearchInput("");
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        if (data?.pagination && newPage >= 1 && newPage <= data.pagination.totalPages) setPage(newPage);
    };

    const brands = data?.brands || [];
    const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

    // Pagination numbers (with ellipsis)
    const generatePageNumbers = () => {
        const pages = [];
        const totalPages = pagination.totalPages;
        const current = pagination.page;
        const maxPages = 5;
        const start = Math.max(1, current - Math.floor(maxPages / 2));
        const end = Math.min(totalPages, start + maxPages - 1);
        if (start > 1) pages.push(1, '...');
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages) pages.push('...', totalPages);
        return pages;
    };

    return (
        <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 xl:px-10 xl:py-12">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Brands</h1>
                <span className="text-gray-500 text-sm">Total: {pagination.total}</span>
            </div>

            {/* Search & Filter */}
            <div className="bg-white shadow p-4 rounded-md mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by name or title..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm">Show:</span>
                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                            className="border border-gray-300 rounded-md px-3 py-2"
                        >
                            {PAGE_LIMITS.map((l) => (
                                <option key={l} value={l}>
                                    {l}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleResetFilters}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </button>
                    <button
                        onClick={handleOpenModal}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Add Brand
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-8">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Logo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {brands.map((brand: any, idx: number) => (
                            <tr key={brand._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-700">
                                    {(pagination.page - 1) * pagination.limit + idx + 1}
                                </td>
                                <td className="px-6 py-4">
                                    <img
                                        src={
                                            brand.logo
                                                ? `${import.meta.env.VITE_IMAGE_URL}/${brand.logo}`
                                                : `https://placehold.co/40x40?text=${brand?.name?.charAt(0) || "B"}`
                                        }
                                        alt={brand.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{brand.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{brand.title}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{brand.description}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleOpenEditModal(brand)}
                                        className="text-blue-500 hover:text-blue-700 transition-colors"
                                    >
                                        <Pencil className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleOpenDeleteModal(brand)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {brands.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                    No brands found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-end gap-2 mt-4">
                <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                {generatePageNumbers().map((page, idx) =>
                    typeof page === "number" ? (
                        <button
                            key={idx}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded ${
                                pagination.page === page
                                    ? "bg-indigo-500 text-white"
                                    : "bg-gray-100 hover:bg-gray-200"
                            }`}
                        >
                            {page}
                        </button>
                    ) : (
                        <span key={idx} className="px-2 text-gray-400">
                            {page}
                        </span>
                    )
                )}
                <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Add Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-lg font-semibold mb-4">Add Brand</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                placeholder="Name"
                                className="w-full border rounded px-3 py-2"
                                disabled={formLoading}
                            />
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                required
                                placeholder="Title"
                                className="w-full border rounded px-3 py-2"
                                disabled={formLoading}
                            />
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                required
                                placeholder="Description"
                                className="w-full border rounded px-3 py-2"
                                disabled={formLoading}
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="w-full"
                                disabled={formLoading}
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 rounded border bg-white text-gray-700"
                                    disabled={formLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded bg-indigo-600 text-white"
                                    disabled={formLoading}
                                >
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
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                        <button
                            onClick={handleCloseEditModal}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-lg font-semibold mb-4">Edit Brand</h2>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <input
                                name="name"
                                value={editForm.name}
                                onChange={handleEditChange}
                                required
                                placeholder="Name"
                                className="w-full border rounded px-3 py-2"
                                disabled={editLoading}
                            />
                            <input
                                name="title"
                                value={editForm.title}
                                onChange={handleEditChange}
                                required
                                placeholder="Title"
                                className="w-full border rounded px-3 py-2"
                                disabled={editLoading}
                            />
                            <textarea
                                name="description"
                                value={editForm.description}
                                onChange={handleEditChange}
                                required
                                placeholder="Description"
                                className="w-full border rounded px-3 py-2"
                                disabled={editLoading}
                            />
                            {/* Image Preview */}
                            <div className="flex items-center gap-4">
                                {(editForm.logo
                                    ? URL.createObjectURL(editForm.logo)
                                    : editForm._id && brands.find((b: any) => b._id === editForm._id)?.logo
                                        ? `${import.meta.env.VITE_IMAGE_URL}/${brands.find((b: any) => b._id === editForm._id)?.logo}`
                                        : null
                                ) ? (
                                    <img
                                        src={
                                            editForm.logo
                                                ? URL.createObjectURL(editForm.logo)
                                                : `${import.meta.env.VITE_IMAGE_URL}/${brands.find((b: any) => b._id === editForm._id)?.logo}`
                                        }
                                        alt="Logo Preview"
                                        className="w-14 h-14 rounded-full object-cover border"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl">
                                        {editForm.name?.charAt(0) || "B"}
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleEditLogoChange}
                                    className="w-full"
                                    disabled={editLoading}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleCloseEditModal}
                                    className="px-4 py-2 rounded border bg-white text-gray-700"
                                    disabled={editLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded bg-indigo-600 text-white"
                                    disabled={editLoading}
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            <BrandDeleteModal
                isOpen={deleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDelete}
                brand={brandToDelete}
                isDeleting={deleteLoading}
            />
        </div>
    );
};

export default BrandList;
