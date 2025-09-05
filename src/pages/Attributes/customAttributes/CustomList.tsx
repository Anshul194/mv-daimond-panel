import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import toast from "react-hot-toast";
import {
  fetchCustomAttributes,
  deleteCustomAttribute,
  updateCustomAttribute,
} from "../../../store/slices/customAttributes";
import {
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Save,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  Grid3X3,
  List,
  Tag,
  Plus,
  Minus,
  MoreHorizontal,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  SortAsc,
  SortDesc,
} from "lucide-react";

interface Term {
  _id: string;
  value?: string;
  image: null ;
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
  lastModifiedBy: {
    id?: string | null;
    email: string;
    timestamp: string;
  };
}

// Enhanced Terms Display Component
interface DynamicTermsDisplayProps {
  terms: Term[];
  maxVisible?: number;
  className?: string;
}

const DynamicTermsDisplay: React.FC<DynamicTermsDisplayProps> = ({ terms, maxVisible = 4, className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState('compact');
  
  const visibleTerms = isExpanded ? terms : terms?.slice(0, maxVisible);
  const hiddenCount = terms?.length - maxVisible;
  const hasMore = terms?.length > maxVisible;

  const getTermDisplayCount = () => {
    if (terms?.length <= 3) return terms.length;
    if (terms.length <= 8) return Math.min(3, maxVisible);
    return Math.min(4, maxVisible);
  };

  const displayCount = getTermDisplayCount();

  const CompactView = () => (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 items-center">
        {visibleTerms?.slice(0, displayCount).map((term, index) => (
          <span 
            key={term._id} 
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 hover:scale-105 ${
              index % 4 === 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
              index % 4 === 1 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
              index % 4 === 2 ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
              'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${
              index % 4 === 0 ? 'bg-blue-400' :
              index % 4 === 1 ? 'bg-green-400' :
              index % 4 === 2 ? 'bg-purple-400' :
              'bg-orange-400'
            }`}></div>
            {term.value}
            {term.image && (
              <img src={`${import.meta.env.VITE_IMAGE_URL}${term.image}`} alt="" className="w-4 h-4 object-cover rounded-full border border-white shadow-sm" />
            )}
          </span>
        ))}
        
        {hasMore && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <Plus className="w-3 h-3" />
            {hiddenCount} more
          </button>
        )}
      </div>
      
      {isExpanded && hasMore && (
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {visibleTerms?.slice(displayCount).map((term) => (
              <span 
                key={term._id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-700 rounded-full hover:bg-gray-100 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                {term.value}
                {term.image && (
                  <img src={`${import.meta.env.VITE_IMAGE_URL}${term.image}`} alt="" className="w-4 h-4 object-cover rounded-full border border-white shadow-sm" />
                )}
              </span>
            ))}
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Minus className="w-3 h-3" />
            Show less
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={`space-y-3 ${className}`}>
      <CompactView />
    </div>
  );
};

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: { id: string; title: string; terms: { value: string; image: string | File }[] }) => void;
  attribute: CustomAttribute | null;
  isUpdating: boolean;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSubmit, attribute, isUpdating }) => {
  const [title, setTitle] = useState("");
  const [terms, setTerms] = useState<{ value: string; image: string | File }[]>([]);
  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    if (attribute) {
      setTitle(attribute.title);
      setTerms(
        attribute?.terms?.map((t) => ({
          value: t.value ?? "",
          image: t.image ?? "",
        }))
      );
      setErrors({});
    }
  }, [attribute]);

  const handleTermChange = (idx: number, field: string, value: string | File) => {
    setTerms((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t))
    );
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrors({ title: "Title is required" });
      return;
    }
    if (attribute) {
        console.log("Submitting attribute:", { id: attribute._id, title: title.trim(), terms });
      onSubmit({ id: attribute._id, title: title.trim(), terms });
    }
  };

  if (!isOpen || !attribute) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Pencil className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Edit Attribute
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Update attribute information
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isUpdating}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors({});
                }}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 transition-all ${
                  errors.title ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-gray-300"
                }`}
                placeholder="Enter attribute title"
                disabled={isUpdating}
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.title}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Terms ({terms.length})
              </label>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {terms.map((term, idx) => (
                  <div key={idx} className="flex gap-3 items-center bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={term.value}
                        onChange={(e) => handleTermChange(idx, "value", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                        placeholder="Term value"
                        disabled={isUpdating}
                      />
                    </div>
                   <input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0];
    handleTermChange(idx, "image", file || "");
  }}
  className="text-sm text-gray-500 dark:text-gray-400"
  disabled={isUpdating}
/>
                   {term.image && (
  <img
    src={
      term.image instanceof File 
        ? URL.createObjectURL(term.image)
        : `${import.meta.env.VITE_IMAGE_URL}${term.image}`
    }
    alt=""
    className="w-10 h-10 object-cover rounded-lg border-2 border-white shadow-sm"
  />
)}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={isUpdating}
                className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-500/20 disabled:opacity-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 border border-transparent rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg transition-all"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Attribute
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const DeleteModal = ({ isOpen, onClose, onConfirm, attribute, isDeleting }) => {
  if (!isOpen || !attribute) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Delete Attribute
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete the attribute{" "}
                <strong className="text-red-600 dark:text-red-400">"{attribute.title}"</strong>?
              </p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This will permanently remove the attribute and all its associated terms.
            </p>
          </div>
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-500/20 disabled:opacity-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 border border-transparent rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg transition-all"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Attribute
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomAttributeList = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error, page, limit, total, totalPages } = useAppSelector(
    (state) => state.customAttributes
  );

  // Enhanced filter states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [attributeToEdit, setAttributeToEdit] = useState<CustomAttribute | null>(null);
  const [attributeToDelete, setAttributeToDelete] = useState<CustomAttribute | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: { start: "", end: "" },
    minTerms: "",
    maxTerms: "",
    lastModifiedBy: "",
  });
  const [sortConfig, setSortConfig] = useState({
    field: "createdAt",
    direction: "desc"
  });

  // Calculate pagination values with fallbacks
  const currentPage = page || 1;
  const itemsPerPage = limit || 10;
  const totalItems = total || 0;
  const totalPagesCount = totalPages || Math.ceil(totalItems / itemsPerPage) || 1;

  useEffect(() => {
    const fetchParams = {
      page: currentPage,
      limit: itemsPerPage,
      searchFields: searchTerm ? { title: searchTerm } : {},
      filters: {
        ...((filters.dateRange.start || filters.dateRange.end) && {
          createdAt: {
            ...(filters.dateRange.start && { $gte: filters.dateRange.start }),
            ...(filters.dateRange.end && { $lte: filters.dateRange.end }),
          }
        }),
        ...(filters.minTerms && { 'terms.0': { $exists: true } }),
        ...(filters.lastModifiedBy && { 'lastModifiedBy.email': { $regex: filters.lastModifiedBy, $options: 'i' } }),
      },
      sort: { [sortConfig.field]: sortConfig.direction === 'desc' ? -1 : 1 },
    };

    dispatch(fetchCustomAttributes(fetchParams));
  }, [dispatch, currentPage, itemsPerPage, searchTerm, filters, sortConfig]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPagesCount) {
      const fetchParams = {
        page: newPage,
        limit: itemsPerPage,
        searchFields: searchTerm ? { title: searchTerm } : {},
        filters: {
          ...((filters.dateRange.start || filters.dateRange.end) && {
            createdAt: {
              ...(filters.dateRange.start && { $gte: filters.dateRange.start }),
              ...(filters.dateRange.end && { $lte: filters.dateRange.end }),
            }
          }),
          ...(filters.minTerms && { 'terms.0': { $exists: true } }),
          ...(filters.lastModifiedBy && { 'lastModifiedBy.email': { $regex: filters.lastModifiedBy, $options: 'i' } }),
        },
        sort: { [sortConfig.field]: sortConfig.direction === 'desc' ? -1 : 1 },
      };
      dispatch(fetchCustomAttributes(fetchParams));
    }
  };

  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: { start: "", end: "" },
      minTerms: "",
      maxTerms: "",
      lastModifiedBy: "",
    });
    setSearchTerm("");
    setSortConfig({ field: "createdAt", direction: "desc" });
  };

  const openEditModal = (attr: any) => {
    setAttributeToEdit(attr);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setAttributeToEdit(null);
    setEditModalOpen(false);
    setIsUpdating(false);
  };

 // Fixed handleEditSubmit function
const handleEditSubmit = async ({
  id,
  title,
  terms,
}: {
  id: string;
  title: string;
  terms: { value: string; image: string | File }[];
}) => {
  
  setIsUpdating(true);
  try {
    // Process all terms, filtering out empty values and handling images correctly
    const processedTerms = terms
      .filter((t) => t.value && t.value.trim()) // Only filter out terms without values
      .map((t) => {
        // Handle image field properly:
        // - If image is a File object (new upload), keep it as File
        // - If image is a string (existing image path), keep it as string  
        // - If image is empty string or null, set to null
        let processedImage;
        if (t.image instanceof File) {
          // New file upload
          processedImage = t.image;
        } else if (typeof t.image === 'string' && t.image.trim() !== '') {
          // Existing image path
          processedImage = t.image;
        } else {
          // No image or empty string
          processedImage = null;
        }

        return {
          value: t.value.trim(),
          image: processedImage
        };
      });

    console.log('Submitting processed terms:', processedTerms);

    await dispatch(
      updateCustomAttribute({
        id,
        title: title.trim(),
        terms: processedTerms,
      })
    ).unwrap();
    
    toast.success("Attribute updated successfully");
    closeEditModal();
    handlePageChange(currentPage);
  } catch (e) {
    console.error('Update error:', e);
    setIsUpdating(false);
    toast.error("Failed to update attribute");
  }
};

  const openDeleteModal = (attr: React.SetStateAction<CustomAttribute | null>) => {
    setAttributeToDelete(attr);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setAttributeToDelete(null);
    setDeleteModalOpen(false);
    setIsDeleting(false);
  };

  const handleDeleteConfirm = async () => {
    if (!attributeToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(
        deleteCustomAttribute({
          id: attributeToDelete._id,
          title: attributeToDelete.title,
          terms: [],
        })
      ).unwrap();
      toast.success("Attribute deleted successfully");
      closeDeleteModal();
      handlePageChange(currentPage);
    } catch (e) {
      setIsDeleting(false);
      toast.error("Failed to delete attribute");
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxPages = 5;
    const start = Math.max(1, currentPage - Math.floor(maxPages / 2));
    const end = Math.min(totalPagesCount, start + maxPages - 1);
    
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < totalPagesCount) {
      if (end < totalPagesCount - 1) pages.push("...");
      pages.push(totalPagesCount);
    }
    
    return pages;
  };

  // Calculate serial number with proper fallbacks
  const getSerialNumber = (index: number) => {
    const pageNumber = currentPage || 1;
    const limitNumber = itemsPerPage || 10;
    return (pageNumber - 1) * limitNumber + index + 1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Product Attributes
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your product attributes and terms
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-800">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Total: {totalItems} attributes
                </span>
              </div>
              <button
                onClick={() => handlePageChange(currentPage)}
                className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="mt-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search attributes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {(searchTerm || Object.values(filters).some(f => f && (typeof f === 'object' ? Object.values(f).some(v => v) : f))) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Created From
                    </label>
                    <input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
// Continuing from the cut-off point in the filters section:

                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Created To
                    </label>
                    <input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                  </div>

                  {/* Minimum Terms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Min Terms
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.minTerms}
                      onChange={(e) => handleFilterChange('minTerms', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                  </div>

                  {/* Last Modified By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Modified By
                    </label>
                    <input
                      type="text"
                      placeholder="Email..."
                      value={filters.lastModifiedBy}
                      onChange={(e) => handleFilterChange('lastModifiedBy', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Loading attributes...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-red-200 dark:border-red-800 p-8">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                  Error Loading Attributes
                </h3>
                <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
              </div>
              <button
                onClick={() => handlePageChange(currentPage)}
                className="ml-auto px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        {!loading && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Table Header */}
            <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Attributes List
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}</span>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {(!data || data.length === 0) ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Tag className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Attributes Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || Object.values(filters).some(f => f && (typeof f === 'object' ? Object.values(f).some(v => v) : f))
                    ? "Try adjusting your search or filter criteria."
                    : "Get started by creating your first attribute."}
                </p>
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('title')}
                            className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                          >
                            Title
                            {sortConfig.field === 'title' && (
                              sortConfig.direction === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Terms
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('createdAt')}
                            className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                          >
                            Created
                            {sortConfig.field === 'createdAt' && (
                              sortConfig.direction === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Last Modified
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {data.map((attribute, index) => (
                        <tr key={attribute._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {getSerialNumber(index)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                                <Tag className="w-5 h-5 text-white" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {attribute.title}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  ID: {attribute?._id?.slice(-8)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <DynamicTermsDisplay 
                              terms={attribute.terms} 
                              maxVisible={3}
                              className="max-w-md"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {new Date(attribute.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center text-xs font-semibold text-white">
                                  {attribute?.lastModifiedBy?.email?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span className="text-xs font-medium">
                                  {attribute?.lastModifiedBy?.email || 'Unknown'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-400">
                                {new Date(attribute?.lastModifiedBy?.timestamp).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEditModal(attribute)}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                title="Edit attribute"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(attribute)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                title="Delete attribute"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-8 py-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Showing <span className="font-semibold">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                      <span className="font-semibold">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                      <span className="font-semibold">{totalItems}</span> results
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {generatePageNumbers().map((pageNum, idx) => (
                          <button
                            key={idx}
                            onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
                            disabled={pageNum === "..."}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                              pageNum === currentPage
                                ? 'bg-blue-600 text-white shadow-lg'
                                : pageNum === "..."
                                ? 'text-gray-400 cursor-default'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPagesCount}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Modals */}
        <EditModal
          isOpen={editModalOpen}
          onClose={closeEditModal}
          onSubmit={handleEditSubmit}
          attribute={attributeToEdit}
          isUpdating={isUpdating}
        />

        <DeleteModal
          isOpen={deleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
          attribute={attributeToDelete}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
};

export default CustomAttributeList;