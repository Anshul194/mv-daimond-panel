import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";

import {
  Pencil,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router";
import {
  fetchOrders,
  setOrderSearchQuery,
  setOrderFilters,
  resetOrderFilters,
  updateOrder,
} from "../../../store/slices/order";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";

interface Order {
  _id: string;
  payment_track: string;
  payment_gateway: string;
  transaction_id: string;
  orderSessionId: string;
  order_status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "canceled"
    | "returned";
  payment_status: "paid" | "unpaid";
  invoice_number: number;
  user_id: string;
  type: string;
  tax_id: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  invoice_url?: string;
  order_number?: string;
  order_address?: Record<string, unknown> | null;
  sub_orders?: Record<string, unknown>[];
  order_track?: Record<string, unknown>[];
  order_payment_meta?: Record<string, unknown> | null;
}

const ORDER_STATUS_OPTIONS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "canceled",
  "returned",
];

const OrderList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, loading, error, pagination, searchQuery } =
    useAppSelector((state) => state.order);
  const navigate = useNavigate();
  console.log("Order List Rendered", orders);

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [localFilters, setLocalFilters] = useState<Record<string, string>>({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState<Order["order_status"]>("pending");
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        dispatch(setOrderSearchQuery(searchInput));
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
      fetchOrders({
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
        fetchOrders({
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
      fetchOrders({
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
    dispatch(setOrderFilters(updated));
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setLocalFilters({});
    dispatch(resetOrderFilters());
  };

  const openEditModal = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.order_status);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    setEditLoading(true);
    try {
      await dispatch(
        updateOrder({
          orderId: selectedOrder._id,
          updateData: { order_status: editStatus },
        })
      ).unwrap();
      setEditModalOpen(false);
      setSelectedOrder(null);
      // Refresh orders
      dispatch(
        fetchOrders({
          page: pagination.page,
          limit: pagination.limit,
          filters: {
            ...(localFilters.status ? { status: localFilters.status } : {}),
            ...(localFilters.category ? { category: localFilters.category } : {}),
          },
          searchFields: searchQuery ? { name: searchQuery } : {},
          sort: { createdAt: "desc" },
        })
      );
    } catch (e) {
      // Optionally handle error
    } finally {
      setEditLoading(false);
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
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-4 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Orders
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Payment Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                 Transaction ID
                </th>

                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
              {orders?.map((order: Order, idx: number) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {(pagination.page - 1) * pagination.limit + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    {order._id}
                  </td>

                  <td className="px-4 py-3 text-sm">
                    {order.order_status === "pending" && (
                      <div className="text-orange-500 w-fit px-4  capitalize  bg-orange-500/10 rounded-full">
                        {order.order_status}
                      </div>
                    )}
                    {order.order_status === "processing" && (
                      <div className="text-gray-500 w-fit px-4  capitalize  bg-green-500/10 rounded-full">
                        {order.order_status}
                      </div>
                    )}
                    {order.order_status === "shipped" && (
                      <div className="text-blue-500 w-fit px-4  capitalize  bg-blue-500/10 rounded-full">
                        {order.order_status}
                      </div>
                    )}
                    {order.order_status === "delivered" && (
                      <div className="text-green-500 w-fit px-4  capitalize  bg-green-500/10 rounded-full">
                        {order.order_status}
                      </div>
                    )}
                    {order.order_status === "canceled" && (
                      <div className="text-red-500 w-fit px-4  capitalize  bg-red-500/10 rounded-full">
                        {order.order_status}
                      </div>
                    )}
                    {order.order_status === "returned" && (
                      <div className="text-yellow-500 w-fit px-4  capitalize  bg-yellow-500/10 rounded-full">
                        {order.order_status}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-sm">
                    {order.payment_status === "paid" ? (
                      <div className="text-green-500 w-fit px-4  capitalize  bg-green-500/10 rounded-full">
                        {order.payment_status}
                      </div>
                    ) : (
                      <div className="text-red-500 w-fit px-4  capitalize  bg-red-500/10 rounded-full">
                        {order.payment_status}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 break-words whitespace-normal max-w-[200px]">
                    {order?.transaction_id || "N/A"}
                  </td>



                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(order)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    {/* <button
                      onClick={() => openDeleteModal(order)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button> */}
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

      {/* Edit Status Modal */}
      {editModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Update Order Status
            </h2>
            <div className="mb-4">
              <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={editStatus}
                onChange={(e) =>
                  setEditStatus(e.target.value as Order["order_status"])
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                disabled={editLoading}
              >
                {editLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
