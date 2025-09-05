import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";

import toast from "react-hot-toast";
import {

fetchDeliveryOptions,
deleteDeliveryOption,
updateDeliveryOption,
createDeliveryOption,
fetchDeliveryOptionById,
} from "../../../store/slices/deliverySlice";

import { 
Pencil,
Trash2,
CheckCircle,
XCircle,
Search,
Filter,
ChevronLeft,
ChevronRight,
RotateCcw,
X,
AlertTriangle,
Plus,
} from "lucide-react";

// Font Awesome icons (as dropdown options)
// Font Awesome icon options
const fontAwesomeIcons = [
    { value: "fas fa-truck", label: "Truck", icon: "🚚" },
    { value: "fas fa-motorcycle", label: "Motorcycle", icon: "🏍️" },
    { value: "fas fa-bicycle", label: "Bicycle", icon: "🚲" },
    { value: "fas fa-car", label: "Car", icon: "🚗" },
    { value: "fas fa-plane", label: "Plane", icon: "✈️" },
    { value: "fas fa-ship", label: "Ship", icon: "🚢" },
    { value: "fas fa-walking", label: "Walking", icon: "🚶" },
    { value: "fas fa-clock", label: "Clock", icon: "⏰" },
    { value: "fas fa-bolt", label: "Lightning", icon: "⚡" },
    { value: "fas fa-home", label: "Home", icon: "🏠" },
    { value: "fas fa-box", label: "Box", icon: "📦" },
    { value: "fas fa-shopping-bag", label: "Shopping Bag", icon: "🛍️" },
    { value: "fas fa-gift", label: "Gift", icon: "🎁" },
    { value: "fas fa-heart", label: "Heart", icon: "❤️" },
    { value: "fas fa-star", label: "Star", icon: "⭐" },

    // New additions
    { value: "fas fa-dolly", label: "Hand Truck", icon: "🛒" },
    { value: "fas fa-store", label: "Store", icon: "🏬" },
    { value: "fas fa-warehouse", label: "Warehouse", icon: "🏭" },
    { value: "fas fa-route", label: "Route", icon: "🗺️" },
    { value: "fas fa-shipping-fast", label: "Fast Shipping", icon: "📦💨" },
    { value: "fas fa-map-marker-alt", label: "Location", icon: "📍" },
    { value: "fas fa-credit-card", label: "Payment", icon: "💳" },
    { value: "fas fa-barcode", label: "Barcode", icon: "🔢" },
    { value: "fas fa-tags", label: "Tags", icon: "🏷️" },
    { value: "fas fa-diamond", label: "Diamond", icon: "💎" }, // Diamond
    { value: "fas fa-user-check", label: "Verified User", icon: "✅" },
    { value: "fas fa-cash-register", label: "Checkout", icon: "🧾" },
     { value: "fas fa-cube", label: "Parcel", icon: "📦" },
    { value: "fas fa-boxes", label: "Multiple Packages", icon: "📦📦" },
    { value: "fas fa-truck-loading", label: "Truck Loading", icon: "🚛" },
    { value: "fas fa-truck-moving", label: "Moving Truck", icon: "🚚➡️" },
    { value: "fas fa-concierge-bell", label: "Customer Service", icon: "🛎️" },
    { value: "fas fa-headset", label: "Support", icon: "🎧" },
    { value: "fas fa-globe", label: "Global Shipping", icon: "🌍" },
    { value: "fas fa-shield-alt", label: "Secure Delivery", icon: "🛡️" },
    { value: "fas fa-key", label: "Access", icon: "🔑" },
    { value: "fas fa-truck-monster", label: "Heavy Duty", icon: "🚜" },
    { value: "fas fa-ribbon", label: "Premium Packaging", icon: "🎀" },
    { value: "fas fa-box-open", label: "Open Box", icon: "📦👐" },
    { value: "fas fa-hourglass-half", label: "In Progress", icon: "⏳" },
    { value: "fas fa-truck-pickup", label: "Pickup Truck", icon: "🛻" },
    { value: "fas fa-snowplow", label: "Cold Chain", icon: "❄️🚛" },
    { value: "fas fa-receipt", label: "Invoice", icon: "🧾" },
    { value: "fas fa-clipboard-check", label: "Verified Delivery", icon: "✅📋" },
    { value: "fas fa-bell", label: "Notification", icon: "🔔" },
    { value: "fas fa-envelope-open-text", label: "Shipping Label", icon: "✉️" },
    { value: "fas fa-map", label: "Map", icon: "🗺️" },
    { value: "fas fa-route-highway", label: "Highway", icon: "🛣️" },
    { value: "fas fa-door-open", label: "Doorstep Delivery", icon: "🚪" },
    { value: "fas fa-clipboard-list", label: "Order Checklist", icon: "📋📝" },
    { value: "fas fa-smile", label: "Customer Satisfaction", icon: "😊" },
    { value: "fas fa-medal", label: "Top Rated", icon: "🏅" }
];

interface DeliveryOption {
_id: string;
icon: string;
title: string;
sub_title: string;
}

interface Pagination {
total: number;
page: number;
limit: number;
totalPages: number;
}

// Delete Modal
const DeleteModal: React.FC<{
isOpen: boolean;
onClose: () => void;
onConfirm: () => void;
option: DeliveryOption | null;
isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, option, isDeleting }) => {
if (!isOpen || !option) return null;
return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-transparent backdrop-blur-xs transition-opacity" onClick={onClose}></div>
        <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Delete Delivery Option
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Are you sure you want to delete <strong className="text-gray-900 dark:text-white">"{option.title}"</strong>?
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        This action cannot be undone.
                    </p>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

// Edit/Create Modal
const EditModal: React.FC<{
isOpen: boolean;
onClose: () => void;
onConfirm: (id: string | null, data: { icon: string; title: string; sub_title: string }) => void;
option: DeliveryOption | null;
isEditing: boolean;
isCreate?: boolean;
}> = ({ isOpen, onClose, onConfirm, option, isEditing, isCreate }) => {
const [icon, setIcon] = useState(option?.icon || fontAwesomeIcons[0].value);
const [title, setTitle] = useState(option?.title || "");
const [subTitle, setSubTitle] = useState(option?.sub_title || "");

useEffect(() => {
  setIcon(option?.icon || fontAwesomeIcons[0].value);
  setTitle(option?.title || "");
  setSubTitle(option?.sub_title || "");
}, [option, isOpen]);


if (!isOpen) return null;

return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-transparent backdrop-blur-xs transition-opacity" onClick={onClose}></div>
        <div className="flex min-h-full items-center justify-center p-4">
            <form
                className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
                onSubmit={e => {
                    e.preventDefault();
                    onConfirm(option?._id || null, { icon, title, sub_title: subTitle });
                }}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isCreate ? "Create Delivery Option" : "Edit Delivery Option"}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon</label>
                      <select
  value={icon}
  onChange={e => setIcon(e.target.value)}
  className="w-full border border-gray-300 rounded-md px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
>
  {fontAwesomeIcons.map(({ value, label, icon: emoji }) => (
    <option key={value} value={value}>
      {emoji} {label}
    </option>
  ))}
</select>
<div className="mt-2 flex items-center gap-2">
  <i className={`fa ${icon} text-2xl`} />
  <span className="text-gray-700 dark:text-gray-300 text-sm">
    {
      fontAwesomeIcons.find(item => item.value === icon)?.label
    }
  </span>
</div>

                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sub Title</label>
                        <input
                            type="text"
                            value={subTitle}
                            onChange={e => setSubTitle(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isEditing}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isEditing}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isEditing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                {isCreate ? "Creating..." : "Saving..."}
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                {isCreate ? "Create" : "Save"}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    </div>
);
};

const DeliveryOptionList: React.FC = () => {
const dispatch = useAppDispatch();
const { options, loading, error, pagination } = useAppSelector((state: any) => state.delivery);

const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [optionToDelete, setOptionToDelete] = useState<DeliveryOption | null>(null);
const [isDeleting, setIsDeleting] = useState(false);

const [editModalOpen, setEditModalOpen] = useState(false);
const [optionToEdit, setOptionToEdit] = useState<DeliveryOption | null>(null);
const [isEditing, setIsEditing] = useState(false);

const [createModalOpen, setCreateModalOpen] = useState(false);
const [isCreating, setIsCreating] = useState(false);

const [searchInput, setSearchInput] = useState("");
const [localFilters, setLocalFilters] = useState<Record<string, any>>({});
const [page, setPage] = useState(1);
const [limit, setLimit] = useState(10);

// Fetch delivery options
useEffect(() => {
    dispatch(
        fetchDeliveryOptions({
            page,
            limit,
            filters: localFilters,
            searchFields: searchInput ? { title: searchInput } : {},
            sort: { createdAt: "desc" },
        }) as any
    );
}, [dispatch, page, limit, localFilters, searchInput]);

// Edit
const openEditModal = (option: DeliveryOption) => {
    setOptionToEdit(option);
    setEditModalOpen(true);
};
const closeEditModal = () => {
    setOptionToEdit(null);
    setEditModalOpen(false);
    setIsEditing(false);
};
const handleEditSubmit = async (
    id: string | null,
    data: { icon: string; title: string; sub_title: string }
) => {
    if (!id) return;
    setIsEditing(true);
    try {
        // Always include 'icon' as it is a string from the dropdown
        const payload: any = { id };
        if (data.title) payload.title = data.title;
        if (data.sub_title) payload.sub_title = data.sub_title;
        if (typeof data.icon === "string") {
            payload.icon = data.icon;
        }
        await dispatch(
            updateDeliveryOption(payload) as any
        ).unwrap();
        toast.success("Delivery option updated successfully");
        closeEditModal();
        dispatch(fetchDeliveryOptions({ page, limit }) as any);
    } catch (error: any) {
        toast.error(error?.message || "Failed to update");
    } finally {
        setIsEditing(false);
    }
};

// Create
const openCreateModal = () => setCreateModalOpen(true);
const closeCreateModal = () => {
    setCreateModalOpen(false);
    setIsCreating(false);
};
const handleCreateSubmit = async (
    _id: string | null,
    data: { icon: string; title: string; sub_title: string }
) => {
    setIsCreating(true);
    try {
        await dispatch(
            createDeliveryOption(data) as any
        ).unwrap();
        toast.success("Delivery option created successfully");
        closeCreateModal();
        dispatch(fetchDeliveryOptions({ page, limit }) as any);
    } catch (error: any) {
        toast.error(error?.message || "Failed to create");
    } finally {
        setIsCreating(false);
    }
};

// Delete
const openDeleteModal = (option: DeliveryOption) => {
    setOptionToDelete(option);
    setDeleteModalOpen(true);
};
const closeDeleteModal = () => {
    setOptionToDelete(null);
    setDeleteModalOpen(false);
    setIsDeleting(false);
};
const handleDeleteConfirm = async () => {
    if (!optionToDelete) return;
    setIsDeleting(true);
    try {
        await dispatch(deleteDeliveryOption(optionToDelete._id) as any).unwrap();
        toast.success("Delivery option deleted");
        closeDeleteModal();
        dispatch(fetchDeliveryOptions({ page, limit }) as any);
    } catch (error: any) {
        toast.error(error?.message || "Failed to delete");
    } finally {
        setIsDeleting(false);
    }
};

// Pagination
const totalPages = pagination?.totalPages || 1;
const generatePageNumbers = () => {
    const pages = [];
    const maxPages = 5;
    const start = Math.max(1, page - Math.floor(maxPages / 2));
    const end = Math.min(totalPages, start + maxPages - 1);
    if (start > 1) pages.push(1, "...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push("...", totalPages);
    return pages;
};

return (
    <div>
        <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Delivery Options</h1>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    <Plus className="w-4 h-4" />
                    Add Delivery Option
                </button>
            </div>
            {/* Search & Filter */}
            <div className="bg-white shadow p-4 rounded-md mb-6 dark:bg-gray-900">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            placeholder="Search by title..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm dark:text-gray-300">Show:</span>
                        <select
                            value={limit}
                            onChange={e => setLimit(Number(e.target.value))}
                            className="border border-gray-300 rounded-md px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </select>
                    </div>
                    <button
                        onClick={() => {
                            setSearchInput("");
                            setLocalFilters({});
                        }}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </button>
                </div>
            </div>
            {/* Error */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
            )}
            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center py-8">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
            )}
            {/* Table */}
            <div className="bg-white shadow rounded-lg overflow-x-auto dark:bg-gray-900">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">#</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Icon</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Sub Title</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
                        {options?.options?.map((opt: DeliveryOption, idx: number) => (
                            <tr key={opt._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                    {(page - 1) * limit + idx + 1}
                                </td>
                                <td className="px-6 py-4">
                                    <i className={`fa ${opt.icon} text-2xl`} />
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{opt.title}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{opt.sub_title}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button
                                        onClick={() => openEditModal(opt)}
                                        className="text-blue-500 hover:text-blue-700 transition-colors"
                                    >
                                        <Pencil className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(opt)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            <div className="flex justify-end gap-2 mt-4">
                <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                {generatePageNumbers().map((p, idx) =>
                    typeof p === "number" ? (
                        <button
                            key={idx}
                            onClick={() => setPage(p)}
                            className={`px-3 py-1 rounded ${
                                page === p
                                    ? "bg-indigo-500 text-white"
                                    : "bg-gray-100 dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                        >
                            {p}
                        </button>
                    ) : (
                        <span key={idx} className="px-2 text-gray-400 dark:text-gray-500">
                            {p}
                        </span>
                    )
                )}
                <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
        {/* Delete Modal */}
        <DeleteModal
            isOpen={deleteModalOpen}
            onClose={closeDeleteModal}
            onConfirm={handleDeleteConfirm}
            option={optionToDelete}
            isDeleting={isDeleting}
        />
        {/* Edit Modal */}
        <EditModal
            isOpen={editModalOpen}
            onClose={closeEditModal}
            onConfirm={handleEditSubmit}
            option={optionToEdit}
            isEditing={isEditing}
        />
        {/* Create Modal */}
        <EditModal
            isOpen={createModalOpen}
            onClose={closeCreateModal}
            onConfirm={handleCreateSubmit}
            option={null}
            isEditing={isCreating}
            isCreate
        />
    </div>
);
};

export default DeliveryOptionList;