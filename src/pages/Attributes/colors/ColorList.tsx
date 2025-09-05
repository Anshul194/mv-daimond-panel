import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchColorCodes, deleteColorCode, updateColorCode, fetchColorCodeById } from "../../../store/slices/colorSlice";
import { RootState } from "../../../store";
import { 
    RotateCcw, 
    Search, 
    Filter, 
    ChevronLeft, 
    ChevronRight,
    Pencil,
    Trash2,
    CheckCircle,
    XCircle,
    X,
    Save
} from "lucide-react";

interface ColorItem {
    _id: string;
    name: string;
    code?: string;
    colorCode: string;
    status?: "active" | "inactive";
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

const ColorList: React.FC = () => {
    const dispatch = useDispatch();
    const { colors, loading, error, pagination } = useSelector((state: RootState) => state.color);

    // Local state for search and filters
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [localFilters, setLocalFilters] = useState<Record<string, any>>({});

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [colorToDelete, setColorToDelete] = useState<ColorItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Edit modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [colorToEdit, setColorToEdit] = useState<ColorItem | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "",
        colorCode: "",
        status: "active" 
    });

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== searchQuery) {
                setSearchQuery(searchInput);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput, searchQuery]);

    // Fetch colors with filters and search
    useEffect(() => {
        const activeFilters = {
            ...(localFilters.status ? { status: localFilters.status } : {}),
        };

        dispatch(fetchColorCodes({
            page: pagination?.page || 1,
            limit: pagination?.limit || 10,
            filters: activeFilters,
            searchFields: searchQuery ? { name: searchQuery } : {},
            sort: { createdAt: 'desc' }
        }) as any);
    }, [dispatch, pagination?.page, pagination?.limit, searchQuery, localFilters]);

    const handleRefresh = () => {
        const activeFilters = {
            ...(localFilters.status ? { status: localFilters.status } : {}),
        };

        dispatch(fetchColorCodes({
            page: pagination?.page || 1,
            limit: pagination?.limit || 10,
            filters: activeFilters,
            searchFields: searchQuery ? { name: searchQuery } : {},
            sort: { createdAt: 'desc' }
        }) as any);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
            const activeFilters = {
                ...(localFilters.status ? { status: localFilters.status } : {}),
            };

            dispatch(fetchColorCodes({
                page: newPage,
                limit: pagination?.limit || 10,
                filters: activeFilters,
                searchFields: searchQuery ? { name: searchQuery } : {},
                sort: { createdAt: 'desc' }
            }) as any);
        }
    };

    const handleLimitChange = (newLimit: number) => {
        const activeFilters = {
            ...(localFilters.status ? { status: localFilters.status } : {}),
        };

        dispatch(fetchColorCodes({
            page: 1,
            limit: newLimit,
            filters: activeFilters,
            searchFields: searchQuery ? { name: searchQuery } : {},
            sort: { createdAt: 'desc' }
        }) as any);
    };

    const handleFilterChange = (key: string, value: string) => {
        const updated = { ...localFilters, [key]: value };
        setLocalFilters(updated);
    };

    const handleResetFilters = () => {
        setSearchInput("");
        setSearchQuery("");
        setLocalFilters({});
    };

    const generatePageNumbers = () => {
        const pages = [];
        const totalPages = pagination?.totalPages || 1;
        const current = pagination?.page || 1;
        const maxPages = 5;

        const start = Math.max(1, current - Math.floor(maxPages / 2));
        const end = Math.min(totalPages, start + maxPages - 1);

        if (start > 1) pages.push(1, '...');
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages) pages.push('...', totalPages);

        return pages;
    };

    // Delete modal functions
    const openDeleteModal = (color: ColorItem) => {
        setColorToDelete(color);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setColorToDelete(null);
        setDeleteModalOpen(false);
        setIsDeleting(false);
    };

    const handleDeleteConfirm = async () => {
        if (colorToDelete) {
            setIsDeleting(true);
            try {
                await dispatch(deleteColorCode(colorToDelete._id) as any).unwrap();
                closeDeleteModal();
                handleRefresh();
            } catch (error) {
                console.error('Delete failed:', error);
                setIsDeleting(false);
            }
        }
    };

    // Edit modal functions
    const openEditModal = async (color: ColorItem) => {
        setColorToEdit(color);
        setEditForm({
            name: color.name,
            colorCode: color.colorCode,

            status: color.status || "active"
        });
        
        // Fetch latest color data
        try {
            const latestColor = await dispatch(fetchColorCodeById(color?._id) as any).unwrap();
            setEditForm({
                name: latestColor.name,
                colorCode: latestColor.colorCode,
                status: latestColor.status || "active"
            });
        } catch (error) {
            console.error('Failed to fetch color details:', error);
        }
        
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setColorToEdit(null);
        setEditModalOpen(false);
        setIsEditing(false);
        setEditForm({ name: "", colorCode: "" , status: "active" });
        handleRefresh();
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (colorToEdit && editForm.name.trim() && editForm.colorCode.trim()) {
            setIsEditing(true);
            try {
                await dispatch(updateColorCode({
                    id: colorToEdit._id,
                    name: editForm.name.trim(),
                    colorCode: editForm.colorCode.trim(),
                    status: editForm?.status || "active"
                }) as any).unwrap();
                closeEditModal();
                handleRefresh();
            } catch (error) {
                console.error('Update failed:', error);
                setIsEditing(false);
            }
        }
    };

    const handleColorCodeChange = (value: string) => {
        // Ensure it starts with # if it doesn't already
        let colorCode = value;
        if (colorCode && !colorCode.startsWith('#')) {
            colorCode = '#' + colorCode;
        }
        setEditForm(prev => ({ ...prev, colorCode }));
    };

    // Validate hex color
    const isValidHexColor = (color: string) => {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    };

    // Delete Confirmation Modal Component
    const DeleteModal: React.FC<{
        isOpen: boolean;
        onClose: () => void;
        onConfirm: () => void;
        color: ColorItem | null;
        isDeleting: boolean;
    }> = ({ isOpen, onClose, onConfirm, color, isDeleting }) => {
        if (!isOpen || !color) return null;
        
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                            Delete Color
                        </h2>
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="mb-6">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Are you sure you want to delete this color?
                        </p>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div
                                className="w-8 h-8 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: color.colorCode }}
                            />
                            <div>
                                <p className="font-medium text-gray-800 dark:text-white">{color.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{color.colorCode}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Edit Modal Component
    const EditModal: React.FC<{
        isOpen: boolean;
        onClose: () => void;
        onSubmit: (e: React.FormEvent) => void;
        color: ColorItem | null;
        isEditing: boolean;
        form: { name: string; colorCode: string ,status: string };
        onFormChange: (field: string, value: string) => void;
    }> = ({ isOpen, onClose, onSubmit, color, isEditing, form, onFormChange }) => {
        if (!isOpen || !color) return null;
        
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm">
                <div className="bg-transparent backdrop-blur-sm dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                            Edit Color
                        </h2>
                        <button
                            onClick={onClose}
                            disabled={isEditing}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Color Name
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => onFormChange('name', e.target.value)}
                                placeholder="Enter color name"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                required
                                disabled={isEditing}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Color Code
                            </label>
                            <div className="flex gap-3">
                                <div className="flex items-center gap-3 w-full">
                                    {/* Color code input */}
                                    <input
                                        type="text"
                                        value={form.colorCode}
                                        onChange={(e) => handleColorCodeChange(e.target.value)}
                                        placeholder="#FF0000"
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white font-mono"
                                        required
                                        disabled={isEditing}
                                        style={{ minWidth: 110 }}
                                    />
                                    {/* Color picker */}
                                    <input
                                        type="color"
                                        value={isValidHexColor(form.colorCode) ? form.colorCode : "#ffffff"}
                                        onChange={e => handleColorCodeChange(e.target.value)}
                                        disabled={isEditing}
                                        className="w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 p-0 cursor-pointer bg-transparent"
                                        title="Pick color"
                                        style={{ minWidth: 40 }}
                                    />
                                    {/* Status selector */}
                                    {/* <select
                                        value={form.status}
                                        onChange={e => onFormChange('status', e.target.value)}
                                        disabled={isEditing}
                                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-2 text-xs dark:bg-gray-700 dark:text-white min-w-[90px]"
                                        style={{ minWidth: 90 }}
                                        title="Status"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select> */}
                                </div>
                                {form.colorCode && !isValidHexColor(form.colorCode) && (
                                    <p className="text-red-500 text-xs mt-1">Invalid hex color format</p>
                                )}
                            </div>

                            
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isEditing}
                                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isEditing || !form.name.trim() || !isValidHexColor(form.colorCode)}
                                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {isEditing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Update
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Color Codes</h1>
                <span className="text-gray-500 text-sm dark:text-gray-400">
                    Total: {pagination?.total || colors.length}
                </span>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white shadow p-4 rounded-md mb-6 dark:bg-gray-900">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search by color name..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-400" />
                        {/* <select
                            value={localFilters.status || ""}
                            onChange={(e) => handleFilterChange("status", e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select> */}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm dark:text-gray-300">Show:</span>
                        <select
                            value={pagination?.limit || 10}
                            onChange={(e) => handleLimitChange(Number(e.target.value))}
                            className="border border-gray-300 rounded-md px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                    <button
                        onClick={handleResetFilters}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </button>
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Refresh
                    </button>
                </div>
            </div>

            

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-x-auto dark:bg-gray-900">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">#</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Color Preview</th>
                                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Status</th> */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Created</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
                            {colors.map((color: any, idx: number) => (
                                <tr key={color._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                        {((pagination?.page || 1) - 1) * (pagination?.limit || 10) + idx + 1}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                        {color.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                                            {color.colorCode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-sm"
                                                style={{ backgroundColor: color.colorCode }}
                                                title={`${color.name} - ${color.colorCode}`}
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                    {color.colorCode}
                                                </span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    {color.name}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    {/* <td className="px-6 py-4 text-sm">
                                        {color.status === "active" ? (
                                            <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                                                <CheckCircle className="h-4 w-4" />
                                                <span className="text-xs">Active</span>
                                            </span>
                                        ) : color.status === "inactive" ? (
                                            <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                                                <XCircle className="h-4 w-4" />
                                                <span className="text-xs">Inactive</span>
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">N/A</span>
                                        )}
                                    </td> */}
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(color.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => openEditModal(color)}
                                            className="text-blue-500 hover:text-blue-700 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                            title="Edit Color"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(color)}
                                            className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                            title="Delete Color"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {colors.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400 dark:text-gray-500">
                                        No colors found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} results
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
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
                                            : "bg-gray-100 dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    {page}
                                </button>
                            ) : (
                                <span key={idx} className="px-2 text-gray-400 dark:text-gray-500">
                                    {page}
                                </span>
                            )
                        )}
                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteConfirm}
                color={colorToDelete}
                isDeleting={isDeleting}
            />

            <EditModal
                isOpen={editModalOpen}
                onClose={closeEditModal}
                onSubmit={handleEditSubmit}
                color={colorToEdit}
                isEditing={isEditing}
                form={editForm}
                onFormChange={(field, value) => setEditForm(prev => ({ ...prev, [field]: value }))}
            />
        </div>
    );
};

export default ColorList;