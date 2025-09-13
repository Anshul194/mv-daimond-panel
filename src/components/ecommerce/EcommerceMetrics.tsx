import React from "react";

interface Props {
  products: any;
  orders: any;
  revenue: any;
  vendors?: any; // only for superadmin
  users?: any;   // only for superadmin
}

export default function EcommerceMetrics({
  products,
  orders,
  revenue,
  vendors,
  users,
}: Props) {
  return (
    <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Products */}
      <div className="p-4 bg-white shadow rounded-2xl">
        <h4 className="text-gray-500">Products</h4>
        <p className="text-xl font-bold">{products?.totalProducts || 0}</p>
      </div>

      {/* Orders */}
      <div className="p-4 bg-white shadow rounded-2xl">
        <h4 className="text-gray-500">Orders</h4>
        <p className="text-xl font-bold">{orders?.totalOrders || 0}</p>
      </div>

      {/* Revenue */}
      <div className="p-4 bg-white shadow rounded-2xl">
        <h4 className="text-gray-500">Revenue</h4>
        <p className="text-xl font-bold">₹{revenue?.totalRevenue || 0}</p>
      </div>

      {/* Vendors & Users (only superadmin) */}
      {vendors && (
        <div className="p-4 bg-white shadow rounded-2xl">
          <h4 className="text-gray-500">Vendors</h4>
          <p className="text-xl font-bold">{vendors?.totalVendors || 0}</p>
        </div>
      )}
      {users && (
        <div className="p-4 bg-white shadow rounded-2xl">
          <h4 className="text-gray-500">Users</h4>
          <p className="text-xl font-bold">{users?.totalUsers || 0}</p>
        </div>
      )}
    </div>
  );
}
