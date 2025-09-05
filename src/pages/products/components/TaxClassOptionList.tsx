import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import toast from "react-hot-toast";

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
import { useNavigate } from "react-router";
import { deleteOrder, fetchOrders } from "../../../store/slices/order";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { setProductSearchQuery } from "../../../store/slices/product";
import {
  deleteTax,
  fetchTaxes,
  updateTax,
} from "../../../store/slices/taxClass";
import {
  deleteTaxClassOption,
  fetchTaxClassOptions,
} from "../../../store/slices/taxClassOption";

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

const TaxOptionsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { options, loading, error, pagination, searchQuery, filters } =
    useAppSelector((state) => state.taxClassOption);
  const navigate = useNavigate();
  console.log("Tax Options List Rendered", options);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taxToEdit, setTaxToEdit] = useState<Tax | null>(null);
  const [taxToDelete, setTaxToDelete] = useState<Tax | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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
      fetchTaxClassOptions({
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
        fetchTaxClassOptions({
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
      fetchTaxClassOptions({
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
    // dispatch(setTaxFilters(updated));
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setLocalFilters({});
    // dispatch(resetTaxFilters());
  };

  const openEditModal = (product: Product) => {
    // setProductToEdit(product);
    // setEditModalOpen(true);
    navigate(`/taxes/options/edit/${product._id}`);
  };

  const closeEditModal = () => {
    setTaxToEdit(null);
    // setEditModalOpen(false);
    setIsUpdating(false);
  };

  const handleEditSubmit = async (updatedData: Partial<Tax>) => {
    if (taxToEdit) {
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
          updateTax({
            taxId: taxToEdit._id,
            formData,
          })
        ).unwrap();
        toast.success(`Order "${updatedData.name}" updated successfully`, {
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
          fetchTaxClassOptions({
            page: pagination.page,
            limit: pagination.limit,
            filters: activeFilters,
            searchFields: searchQuery ? { name: searchQuery } : {},
            sort: { createdAt: "desc" },
          })
        );
      } catch (error: any) {
        setIsUpdating(false);
        toast.error("Failed to update product", {
          position: "top-right",
          duration: 3000,
          style: { background: "#EF4444", color: "#fff" },
        });
      }
    }
  };

  const openDeleteModal = (tax: Tax) => {
    setTaxToDelete(tax);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setTaxToDelete(null);
    setDeleteModalOpen(false);
    setIsDeleting(false);
  };

  const handleDeleteConfirm = async () => {
    if (taxToDelete) {
      setIsDeleting(true);
      console.log("Deleting tax:", taxToDelete);
      try {
        await dispatch(
          deleteTaxClassOption({
            optionId: taxToDelete._id,
          })
        ).unwrap();
        toast.success(`Tax "${taxToDelete.name}" deleted successfully`, {
          position: "top-right",
          duration: 3000,
          style: { background: "#10B981", color: "#fff" },
        });
        closeDeleteModal();
        const activeFilters = {
          ...(localFilters.status ? { status: localFilters.status } : {}),
          ...(localFilters.category ? { category: localFilters.category } : {}),
        };
        dispatch(
          fetchTaxes({
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

  return (
    <div>
      <PageMeta
        title="Order List | TailAdmin"
        description="List of all orders in TailAdmin"
      />
      <PageBreadcrumb pageTitle="Order List" />
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
                  name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Rate
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
              {options?.map((tax: Tax, idx: number) => (
                <tr
                  key={tax._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {(pagination.page - 1) * pagination.limit + idx + 1}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {tax.tax_name}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {tax.class_id.name}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {tax.rate}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(tax.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(tax)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(tax)}
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
      {/* <EditModal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        onSubmit={handleEditSubmit}
        product={orderToEdit}
        isUpdating={isUpdating}
      /> */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        product={taxToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default TaxOptionsList;
