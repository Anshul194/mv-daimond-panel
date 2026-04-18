import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import toast from "react-hot-toast";
import {
  fetchProducts,
  deleteproduct,
  updateProduct,
  setProductSearchQuery,
  setProductFilters,
  resetProductFilters,
  setProductApproval,
} from "../../store/slices/product";
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
  Save,
} from "lucide-react";
// confirmation modal implemented below; no external import
import { useNavigate } from "react-router-dom";
import useUserRole from "../../hooks/useUserRole";

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  category: {
    _id: string;
    name: string;
  };
}

const buildImageUrl = (raw: string | null | undefined) => {
  if (!raw) return null;
  const str = String(raw).trim();
  if (!str || str === '/' ) return null;
  if (str.startsWith('http') || str.startsWith('data:')) return str;
  const base = (import.meta.env.VITE_IMAGE_URL || import.meta.env.VITE_BASE_URL || '').toString();
  const trimmedBase = base.replace(/\/$/, '');
  if (!trimmedBase) return str.startsWith('/') ? str : `/${str}`;
  if (str.startsWith('/')) return `${trimmedBase}${str}`;
  return `${trimmedBase}/${str}`;
};

// Edit Modal Component
const ProductEditModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedProduct: Partial<Product>) => void;
  product: Product | null;
  isUpdating: boolean;
}> = ({ isOpen, onClose, onSubmit, product, isUpdating }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    status: "active" as "active" | "inactive",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        status: product.status,
      });
      setErrors({});
    }
  }, [product]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.price.trim() || isNaN(Number(formData.price)))
      newErrors.price = "Valid price required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        name: formData.name.trim(),
        price: Number(formData.price),
        status: formData.status,
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-transparent backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Pencil className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Edit Product
              </h3>
            </div>
            <button
              onClick={onClose}
              disabled={isUpdating}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter product name"
                  disabled={isUpdating}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Price *
                </label>
                <input
                  type="number"
                  id="price"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.price ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter price"
                  disabled={isUpdating}
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.price}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Status *
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  disabled={isUpdating}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Category:</strong> {product.category?.name}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: Product | null;
  isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, product, isDeleting }) => {
  if (!isOpen || !product) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-transparent backdrop-blur-xs transition-opacity"
        onClick={onClose}
      ></div>
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Product
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
              Are you sure you want to delete the product{" "}
              <strong className="text-gray-900 dark:text-white">
                "{product.name}"
              </strong>
              ?
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

// Approval Confirmation Modal
const ApprovalModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: Product | null;
  isProcessing: boolean;
}> = ({ isOpen, onClose, onConfirm, product, isProcessing }) => {
  if (!isOpen || !product) return null;
  const activating = product.status !== 'active';

  const getProductImage = (p: any) => {
    const rawCandidates: any[] = [];
    
    // Priority 1: Main product's own images array
    if (p.image && Array.isArray(p.image) && p.image.length) rawCandidates.push(p.image[0]);
    if (p.images && Array.isArray(p.images) && p.images.length > 0) rawCandidates.push(p.images[0]);
    
    // Priority 2: Variant's standard 'image' field (User: "images rary one")
    try {
      const invDetails = p.inventory?.inventory_details;
      if (Array.isArray(invDetails) && invDetails.length > 0) {
        const vImg = invDetails[0].image;
        if (vImg) {
          rawCandidates.push(Array.isArray(vImg) ? vImg[0] : vImg);
        }
      }
    } catch (e) {}

    // Priority 3: Fallbacks
    if (p.image && !Array.isArray(p.image)) rawCandidates.push(p.image);
    if (p.thumbnail) rawCandidates.push(p.thumbnail);
    if (p.imageUrl) rawCandidates.push(p.imageUrl);
    if (p.media && p.media.length) rawCandidates.push(p.media[0]?.url);
    if (p.photos && p.photos.length) rawCandidates.push(p.photos[0]);
    
    // Last Priority: Ring images
    try {
      const invDetails = p.inventory?.inventory_details;
      if (Array.isArray(invDetails) && invDetails.length > 0) {
        if (invDetails[0].ringImages?.[0]) rawCandidates.push(invDetails[0].ringImages[0]);
      }
    } catch (e) {}

    for (const c of rawCandidates) {
      if (c === null || c === undefined || c === "null" || c === "") continue;
      // Handle nested arrays like [["url"]]
      const singleValue = Array.isArray(c) ? (Array.isArray(c[0]) ? c[0][0] : c[0]) : c;
      if (!singleValue || singleValue === "null" || singleValue === "") continue;
      
      const url = buildImageUrl(singleValue);
      if (url) return url;
    }

    return `${import.meta.env.BASE_URL || ""}/images/product-placeholder.svg`;
  };

  const img = getProductImage(product as any);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 dark:border-gray-800">
          <div className="flex items-start gap-4 p-6">
            <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {img ? (
                <img src={img} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className={`p-3 rounded-lg ${activating ? 'bg-green-50 dark:bg-green-900/10' : 'bg-yellow-50 dark:bg-yellow-900/10'}`}>
                  {activating ? (
                    <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-7 h-7 text-yellow-600 dark:text-yellow-400" />
                  )}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {activating ? 'Activate this product?' : 'Deactivate this product?'}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {activating
                  ? 'This will make the product visible and available on the storefront.'
                  : 'This will make the product unavailable on the storefront and hide it from customers.'}
              </p>
              <div className="mt-3 text-sm text-gray-800 dark:text-gray-200">
                <strong>{product.name}</strong>
                {product.sku ? <span className="ml-2 text-gray-500">• SKU: {product.sku}</span> : null}
              </div>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {activating
                  ? 'Are you sure you want to activate this product? Customers will be able to see and purchase it.'
                  : 'Are you sure you want to deactivate this product? Orders for this product will be prevented until reactivated.'}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 p-4 border-t border-gray-100 dark:border-gray-800">
            <button onClick={onClose} disabled={isProcessing} className="px-4 py-2 rounded-md text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={isProcessing} className={`px-4 py-2 rounded-md text-sm font-medium text-white flex items-center gap-2 ${activating ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'}`}>
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {activating ? 'Activating...' : 'Deactivating...'}
                </>
              ) : (
                <>{activating ? 'Yes, activate product' : 'Yes, deactivate product'}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, loading, error, pagination, searchQuery, filters } =
    useAppSelector((state) => state.product);
  const navigate = useNavigate();
  console.log("Product List Rendered", products);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalTarget, setApprovalTarget] = useState<Product | null>(null);
  const [approvalAction, setApprovalAction] = useState<'activate' | 'deactivate' | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  const userRole = useUserRole();

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        dispatch(setProductSearchQuery(searchInput));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery, dispatch]);

  useEffect(() => {
    const activeFilters = {
      ...(localFilters.status ? { status: localFilters.status } : {}),
      ...(localFilters.category ? { category: localFilters.category } : {}),
    };
    dispatch(
      fetchProducts({
        page: pagination?.page,
        limit: pagination?.limit,
        filters: activeFilters,
        searchFields: searchQuery ? { name: searchQuery } : {},
        sort: { createdAt: "desc" },
      })
    );
  }, [
    dispatch,
    pagination?.page,
    pagination?.limit,
    searchQuery,
    localFilters,
  ]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      dispatch(
        fetchProducts({
          page: newPage,
          limit: pagination.limit,
          filters: {
            ...(localFilters.status ? { status: localFilters.status } : {}),
            ...(localFilters.category
              ? { category: localFilters.category }
              : {}),
          },
          searchFields: searchQuery ? { name: searchQuery } : {},
          sort: { createdAt: "desc" },
        })
      );
    }
  };

  const handleLimitChange = (newLimit: number) => {
    dispatch(
      fetchProducts({
        page: 1,
        limit: newLimit,
        filters: {
          ...(localFilters.status ? { status: localFilters.status } : {}),
          ...(localFilters.category ? { category: localFilters.category } : {}),
        },
        searchFields: searchQuery ? { name: searchQuery } : {},
        sort: { createdAt: "desc" },
      })
    );
  };

  const handleFilterChange = (key: string, value: string) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    dispatch(setProductFilters(updated));
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setLocalFilters({});
    dispatch(resetProductFilters());
  };

  const openEditModal = (product: Product) => {
    // setProductToEdit(product);
    // setEditModalOpen(true);
    navigate(`/edit-product/${product._id}`);
  };

  const closeEditModal = () => {
    setProductToEdit(null);
    setEditModalOpen(false);
    setIsUpdating(false);
  };

  const handleEditSubmit = async (updatedData: Partial<Product>) => {
    if (productToEdit) {
      setIsUpdating(true);
      try {
        const formData = new FormData();
        if (updatedData.name !== undefined)
          formData.append("name", updatedData.name);
        if (updatedData.price !== undefined)
          formData.append("price", String(updatedData.price));
        if (updatedData.status !== undefined)
          formData.append("status", updatedData.status);
        await dispatch(
          updateProduct({
            productId: productToEdit._id,
            formData,
          })
        ).unwrap();
        toast.success(`Product "${updatedData.name}" updated successfully`, {
          position: "top-right",
          duration: 3000,
          style: { background: "#10B981", color: "#fff" },
        });
        closeEditModal();
        const activeFilters = {
          ...(localFilters.status ? { status: localFilters.status } : {}),
          ...(localFilters.category ? { category: localFilters.category } : {}),
        };
        dispatch(
          fetchProducts({
            page: pagination.page,
            limit: pagination.limit,
            filters: activeFilters,
            searchFields: searchQuery ? { name: searchQuery } : {},
            sort: { createdAt: "desc" },
          })
        );
      } catch (error: any) {
        setIsUpdating(false);
        const msg =
          (error && (error.message || error)) ||
          "Failed to update product";
        toast.error(String(msg), {
          position: "top-right",
          duration: 6000,
          style: { background: "#EF4444", color: "#fff" },
        });
      }
    }
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setProductToDelete(null);
    setDeleteModalOpen(false);
    setIsDeleting(false);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      setIsDeleting(true);
      console.log("Deleting product:", productToDelete);
      try {
        await dispatch(
          deleteproduct({
            productId: productToDelete._id,
          })
        ).unwrap();
        toast.success(
          `Product "${productToDelete.name}" deleted successfully`,
          {
            position: "top-right",
            duration: 3000,
            style: { background: "#10B981", color: "#fff" },
          }
        );
        closeDeleteModal();
        const activeFilters = {
          ...(localFilters.status ? { status: localFilters.status } : {}),
          ...(localFilters.category ? { category: localFilters.category } : {}),
        };
        dispatch(
          fetchProducts({
            page: pagination.page,
            limit: pagination.limit,
            filters: activeFilters,
            searchFields: searchQuery ? { name: searchQuery } : {},
            sort: { createdAt: "desc" },
          })
        );
      } catch (error: any) {
        setIsDeleting(false);
      }
    }
  };

  const handleConfirmApproval = async () => {
    if (!approvalTarget || !approvalAction) return;
    setIsApproving(true);
    setTogglingId(approvalTarget._id);
    try {
      const payload = approvalAction === 'activate' ? { is_approved: true, status: 'active' } : { is_approved: false, status: 'inactive' };
      console.log('Approval action:', approvalAction, 'productId:', approvalTarget._id, 'payload:', payload);
      toast.loading(approvalAction === 'activate' ? 'Activating product...' : 'Deactivating product...', { id: 'approval' });
      const result = await dispatch(setProductApproval({ productId: approvalTarget._id, ...payload }) as any).unwrap();
      console.log('Approval result:', result);
      toast.success(approvalAction === 'activate' ? 'Product activated' : 'Product deactivated', { id: 'approval' });
      dispatch(fetchProducts({ page: pagination.page, limit: pagination.limit, filters: localFilters, sort: { createdAt: 'desc' } }) as any);
    } catch (err: any) {
      console.error('Approval error:', err);
      const msg = err?.message || err?.payload || JSON.stringify(err) || 'Failed to update product';
      toast.error(msg, { id: 'approval' });
    } finally {
      setIsApproving(false);
      setTogglingId(null);
      setApprovalModalOpen(false);
      setApprovalTarget(null);
      setApprovalAction(null);
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    const totalPages = pagination?.totalPages;
    const current = pagination?.page;
    const maxPages = 5;
    const start = Math.max(1, current - Math.floor(maxPages / 2));
    const end = Math.min(totalPages, start + maxPages - 1);
    if (start > 1) pages.push(1, "...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push("...", totalPages);
    return pages;
  };

  const getProductImage = (p: any) => {
    const rawCandidates: any[] = [];
    
    // Priority 1: Main product's own images array
    if (p.image && Array.isArray(p.image) && p.image.length) rawCandidates.push(p.image[0]);
    if (p.images && Array.isArray(p.images) && p.images.length > 0) rawCandidates.push(p.images[0]);
    
    // Priority 2: Variant's standard 'image' field (User: "images rary one")
    try {
      const invDetails = p.inventory?.inventory_details;
      if (Array.isArray(invDetails) && invDetails.length > 0) {
        const vImg = invDetails[0].image;
        if (vImg) {
          rawCandidates.push(Array.isArray(vImg) ? vImg[0] : vImg);
        }
      }
    } catch (e) {}

    // Priority 3: Fallbacks
    if (p.image && !Array.isArray(p.image)) rawCandidates.push(p.image);
    if (p.thumbnail) rawCandidates.push(p.thumbnail);
    if (p.imageUrl) rawCandidates.push(p.imageUrl);
    if (p.media && p.media.length) rawCandidates.push(p.media[0]?.url);
    if (p.photos && p.photos.length) rawCandidates.push(p.photos[0]);
    
    // Last Priority: Ring images
    try {
      const invDetails = p.inventory?.inventory_details;
      if (Array.isArray(invDetails) && invDetails.length > 0) {
        if (invDetails[0].ringImages?.[0]) rawCandidates.push(invDetails[0].ringImages[0]);
      }
    } catch (e) {}

    for (const c of rawCandidates) {
      if (c === null || c === undefined || c === "null" || c === "") continue;
      // Handle nested arrays like [["url"]]
      const singleValue = Array.isArray(c) ? (Array.isArray(c[0]) ? c[0][0] : c[0]) : c;
      if (!singleValue || singleValue === "null" || singleValue === "") continue;
      
      const url = buildImageUrl(singleValue);
      if (url) return url;
    }

    return `${import.meta.env.BASE_URL || ""}/images/product-placeholder.svg`;
  };

  return (
    <div>
      <PageMeta
        title="Product List | TailAdmin"
        description="List of all products in TailAdmin"
      />
      <PageBreadcrumb pageTitle="Product List" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Products
          </h1>
          <span className="text-gray-500 text-sm dark:text-gray-400">
            Total: {pagination?.total}
          </span>
        </div>
        <div className="bg-white shadow p-4 rounded-md mb-6 dark:bg-gray-900">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={localFilters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm dark:text-gray-300">Show:</span>
              <select
                value={pagination?.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
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
        </div>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        )}
        <div className="bg-white shadow rounded-lg overflow-x-auto dark:bg-gray-900">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
              {products?.map((prod: Product, idx: number) => (
                <tr
                  key={prod._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {(pagination.page - 1) * pagination.limit + idx + 1}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center gap-3">
                      <button onClick={() => openEditModal(prod)} className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                        {(() => {
                          const img = getProductImage(prod as any);
                          return img ? (
                            <img src={img} alt={prod.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400"> 
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm2 3a1 1 0 112 0 1 1 0 01-2 0zm1 7a5 5 0 017 0H7z"/></svg>
                            </div>
                          );
                        })()}
                      </button>
                      <div>
                        <div className="truncate max-w-xs">{prod.name}</div>
                        {prod.sku && <div className="text-xs text-gray-500">SKU: {prod.sku}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {prod.category_id?.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {prod.price}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {prod.status === "active" ? (
                      <CheckCircle className="text-green-500 h-5 w-5" />
                    ) : (
                      <XCircle className="text-red-500 h-5 w-5" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(prod.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(prod)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(prod)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    {userRole !== 'vendor' && (
                      <>
                        {prod.status === 'active' ? (
                          <button
                            onClick={() => {
                              setApprovalTarget(prod);
                              setApprovalAction('deactivate');
                              setApprovalModalOpen(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-800 transition-colors"
                            title="Deactivate product"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setApprovalTarget(prod);
                              setApprovalAction('activate');
                              setApprovalModalOpen(true);
                            }}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Activate product"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination?.page === 1}
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
            onClick={() => handlePageChange(pagination?.page + 1)}
            disabled={pagination?.page === pagination?.totalPages}
            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <ProductEditModal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        onSubmit={handleEditSubmit}
        product={productToEdit}
        isUpdating={isUpdating}
      />
      <ApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        onConfirm={handleConfirmApproval}
        product={approvalTarget}
        isProcessing={isApproving}
      />
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        product={productToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ProductList;
