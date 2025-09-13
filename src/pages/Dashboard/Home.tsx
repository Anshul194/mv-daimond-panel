import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDashboard, resetDashboard } from "../../store/slices/dashboardSlice";
import { 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp, 
  TrendingDown,
  Store,
  Clock,
  Eye,
  PieChart,
  IndianRupee // add this import
} from "lucide-react";

// MetricCard Component
const MetricCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    red: "bg-red-50 text-red-600 border-red-200"
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ml-1 ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

// RecentVendors Component
const RecentVendors = ({ vendors }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Vendors</h3>
    <div className="space-y-4">
      {vendors.map((vendor) => (
        <div key={vendor._id} className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Store className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{vendor.storeName}</p>
              <p className="text-xs text-gray-500">{vendor.username}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              vendor.isActive 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {vendor.isActive ? "Active" : "Inactive"}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(vendor.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// OrderStatus Component
const OrderStatus = ({ orders }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
    {orders.ordersByStatus.length > 0 ? (
      <div className="space-y-3">
        {orders.ordersByStatus.map((status) => (
          <div key={status._id} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700 capitalize">
                {status._id}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{status.count}</span>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 text-sm">No orders found</p>
    )}
  </div>
);

// MonthlyRevenue Component
const MonthlyRevenue = ({ revenue }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
    {revenue.monthlyRevenue.length > 0 ? (
      <div className="space-y-3">
        {revenue.monthlyRevenue.map((month) => (
          <div key={`${month._id.year}-${month._id.month}`} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
              })}
            </span>
            <span className="text-sm font-semibold text-gray-900">
              ₹{month.revenue.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 text-sm">No revenue data available</p>
    )}
  </div>
);

// TopVendors Component (updated to use storeName and vendorId)
const TopVendors = ({ topVendors }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Vendors</h3>
    {topVendors.length > 0 ? (
      <div className="space-y-3">
        {topVendors.map((vendor, index) => (
          <div key={vendor.vendorId || vendor.storeName} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gold-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-gold-600">#{index + 1}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">{vendor.storeName}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{vendor.totalOrders} orders</span>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 text-sm">No vendor data available</p>
    )}
  </div>
);

// VendorStatsTable Component (new)
const VendorStatsTable = ({ vendorStats }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm overflow-x-auto">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Stats</h3>
    <table className="min-w-full text-sm">
      <thead>
        <tr>
          <th className="text-left py-2 px-3 font-medium text-gray-700">Store Name</th>
          <th className="text-left py-2 px-3 font-medium text-gray-700">User Name</th>

          <th className="text-left py-2 px-3 font-medium text-gray-700"> Products</th>
          <th className="text-left py-2 px-3 font-medium text-gray-700"> Orders</th>
          <th className="text-left py-2 px-3 font-medium text-gray-700">Revenue</th>
        </tr>
      </thead>
      <tbody>
        {vendorStats.map((stat) => (
          <tr key={stat._id}>
            <td className="py-2 px-3">{stat.storeName}</td>
            <td className="py-2 px-3">{stat.username}</td>
            <td className="py-2 px-3">{stat.totalProducts}</td>
            <td className="py-2 px-3">{stat.totalOrders}</td>
            <td className="py-2 px-3">₹{stat.revenue?.toFixed(2) || "0.00"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Main Dashboard Component
export default function EcommerceDashboard() {
  const dispatch = useDispatch();
  const { loading, error, data } = useSelector((state: any) => state.dashboard);

  // Get user role from localStorage (or your auth state)
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null;
  const userRole = user?.role || "vendor";

  useEffect(() => {
    dispatch(fetchDashboard());
    return () => {
      dispatch(resetDashboard());
    };
  }, [dispatch, userRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {userRole === "superadmin" ? "Super Admin Dashboard" : "Vendor Dashboard"}
            </h1>
            <p className="text-gray-600 mt-1">
              {userRole === "superadmin" 
                ? "Monitor and manage your entire e-commerce platform" 
                : "Track your store's performance and sales"}
            </p>
          </div>
        </div>
      </div>

      {userRole === "superadmin" ? (
        <>
          {/* Super Admin Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Vendors"
              value={data.vendors?.totalVendors || 0}
              icon={Store}
              color="blue"
            />
            <MetricCard
              title="Total Users"
              value={data.users?.totalUsers || 0}
              icon={Users}
              color="green"
            />
            <MetricCard
              title="Total Products"
              value={data.products?.totalProducts || 0}
              icon={Package}
              color="purple"
            />
            <MetricCard
              title="Total Orders"
              value={data.orders?.totalOrders || 0}
              icon={ShoppingCart}
              color="orange"
            />
          </div>

          {/* Vendor Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard
              title="Active Vendors"
              value={data.vendors?.activeVendors || 0}
              icon={TrendingUp}
              color="green"
            />
            <MetricCard
              title="Inactive Vendors"
              value={data.vendors?.inactiveVendors || 0}
              icon={TrendingDown}
              color="red"
            />
            <MetricCard
              title="Total Revenue"
              value={`₹${data.revenue?.totalRevenue?.toFixed(2) || "0.00"}`}
              icon={IndianRupee}
              color="green"
            />
          </div>

          {/* Product Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard
              title="Active Products"
              value={data.products?.activeProducts || 0}
              icon={Package}
              color="green"
            />
            <MetricCard
              title="Inactive Products"
              value={data.products?.inactiveProducts || 0}
              icon={Package}
              color="red"
            />
            <MetricCard
              title="Product Ratio"
              value={
                data.products?.totalProducts
                  ? `${((data.products.activeProducts / data.products.totalProducts) * 100).toFixed(1)}%`
                  : "0%"
              }
              icon={PieChart}
              color="blue"
            />
          </div>

          {/* Detailed Views */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <RecentVendors vendors={data.vendors?.recentVendors || []} />
            <OrderStatus orders={data.orders || { ordersByStatus: [] }} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <MonthlyRevenue revenue={data.revenue || { monthlyRevenue: [] }} />
            <TopVendors topVendors={data.topVendors?.map(v => ({
              ...v,
              storeName: v.storeName || v.vendor // fallback for old API
            })) || []} />
          </div>
          <div className="grid grid-cols-1 gap-6">
            <VendorStatsTable vendorStats={data.vendors?.vendorStats || []} />
          </div>
        </>
      ) : (
        <>
          {/* Vendor Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard
              title="My Products"
              value={data.products?.totalProducts || 0}
              icon={Package}
              color="blue"
            />
            <MetricCard
              title="My Orders"
              value={data.orders?.totalOrders || 0}
              icon={ShoppingCart}
              color="green"
            />
            <MetricCard
              title="My Revenue"
              value={`₹${data.revenue?.totalRevenue?.toFixed(2) || "0.00"}`}
              icon={IndianRupee}
              color="purple"
            />
          </div>

          {/* Product Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <MetricCard
              title="Active Products"
              value={data.products?.activeProducts || 0}
              icon={Eye}
              color="green"
            />
            <MetricCard
              title="Inactive Products"
              value={data.products?.inactiveProducts || 0}
              icon={Clock}
              color="red"
            />
          </div>

          {/* Vendor-specific views */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OrderStatus orders={data.orders || { ordersByStatus: [] }} />
            <MonthlyRevenue revenue={data.revenue || { monthlyRevenue: [] }} />
          </div>
        </>
      )}
    </div>
  );
}