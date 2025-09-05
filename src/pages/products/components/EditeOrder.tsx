import React, { useEffect, useState } from "react";
import {
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Hash,
  DollarSign,
} from "lucide-react";
import { useParams } from "react-router";
import { useDispatch } from "react-redux";
import { fetchOrderById } from "../../../store/slices/order";
import axiosInstance from "../../../services/axiosConfig";

const OrderDetailsPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [orderData, setOrderData] = useState([]);
  const params = useParams();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const orderId = params.id; // Assuming the URL is like /orders/:orderId
  const [nextStep, setNextStep] = useState("");
  const steps = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "canceled",
    "returned",
  ];
  const fetchOrderDetails = async () => {
    try {
      const response = await dispatch(fetchOrderById(orderId));
      console.log("Fetching order details for ID:", orderId);
      console.log("Order details response:", response.payload.data);
      setOrderData(response.payload.data);

      const currentStatusIndex = steps.indexOf(
        response.payload.data.order_status
      );
      if (currentStatusIndex !== -1 && currentStatusIndex < steps.length - 1) {
        setNextStep(steps[currentStatusIndex + 1]);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  useEffect(() => {
    // Fetch order details using the orderId
    fetchOrderDetails();
  }, [orderId]);

  const handleNextStep = async () => {
    try {
      if (nextStep) {
        setLoading(true);
        const response = await axiosInstance.put(
          "api/order_update/" + orderId,
          {
            order_status: nextStep,
            note: "Updated manually by admin",
          }
        );
        await fetchOrderDetails();
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error updating order status:", error);
    }
  };

  //   const orderData = {
  //     _id: "686385781381d2fb552bb812",
  //     coupon: "SUMMER10",
  //     payment_track: "pi_1Rfy2OJAJfZb9HEBAywzvarZ",
  //     payment_gateway: "stripe",
  //     transaction_id:
  //       "cs_test_a153uIFUamQ7jAHrzNMDt6ksRfKpGSHtJLzReKbr3vebUUHqqMBL1sEJv7",
  //     order_status: "delivered",
  //     payment_status: "paid",
  //     invoice_number: 202507019372,
  //     order_number: "ORD-1751352696992-b812",
  //     note: "Updated manually by admin",
  //     createdAt: "2025-07-01T06:51:36.826Z",
  //     updatedAt: "2025-07-02T05:39:46.074Z",
  //     user_id: {
  //       name: "sanket Doe",
  //       email: "dhrumitpanchal789@gmail.com",
  //     },
  //     order_address: {
  //       name: "Nathaniel Hubbard",
  //       email: "lafapam@mailinator.com",
  //       phone: "+1 (709) 617-6637",
  //       city: "685cebaca3b0966edc86b436",
  //       address: "Eaque quibusdam unde",
  //       zipcode: "36332",
  //     },
  //     order_payment_meta: {
  //       sub_total: 0,
  //       coupon_amount: 0,
  //       shipping_cost: 96.8,
  //       tax_amount: 0,
  //       total_amount: 96.8,
  //     },
  //     order_track: [
  //       { name: "ordered", created_at: "2025-07-01T06:51:37.091Z" },
  //       { name: "delivered", created_at: "2025-07-02T05:13:07.129Z" },
  //       { name: "delivered", created_at: "2025-07-02T05:15:37.194Z" },
  //       { name: "pending", created_at: "2025-07-02T05:17:59.846Z" },
  //       { name: "delivered", created_at: "2025-07-02T05:18:34.460Z" },
  //       { name: "shipped", created_at: "2025-07-02T05:21:18.941Z" },
  //       { name: "pending", created_at: "2025-07-02T05:21:42.780Z" },
  //       { name: "delivered", created_at: "2025-07-02T05:30:10.906Z" },
  //       { name: "canceled", created_at: "2025-07-02T05:37:02.237Z" },
  //       { name: "delivered", created_at: "2025-07-02T05:39:46.144Z" },
  //       { name: "delivered", created_at: "2025-07-02T05:41:40.796Z" },
  //     ],
  //   };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "text-green-600 bg-green-100";
      case "shipped":
        return "text-blue-600 bg-blue-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "canceled":
        return "text-red-600 bg-red-100";
      case "paid":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "canceled":
        return <XCircle className="w-4 h-4" />;
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return `$${amount?.toFixed(2)}`;
  };

  return (
    <>
      {orderData ? (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex gap-4 items-center mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Order Details
                    </h1>
                    <div
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        orderData.order_status
                      )}`}
                    >
                      {getStatusIcon(orderData.order_status)}
                      <span className="capitalize">
                        {orderData.order_status}
                      </span>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2">
                      <div
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          orderData.payment_status
                        )}`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span className="capitalize">
                          {orderData.payment_status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Hash className="w-4 h-4" />
                      <span className="font-medium">
                        {orderData.order_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(orderData.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div
                    className={`inline-flex items-center gap-1 px-6 cursor-pointer py-2 rounded-md text-sm font-medium text-white bg-blue-500`}
                  >
                    <span className="capitalize">Updating...</span>
                  </div>
                ) : (
                  <div
                    onClick={handleNextStep}
                    className={`inline-flex items-center gap-1 px-6 cursor-pointer py-2 rounded-md text-sm font-medium text-white ${
                      nextStep === "canceled" ? "bg-red-500" : "bg-blue-500"
                    }`}
                  >
                    {getStatusIcon(nextStep)}
                    <span className="capitalize">Move To {nextStep}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: "overview", label: "Overview", icon: Package },
                    { id: "tracking", label: "Order Tracking", icon: Truck },
                    {
                      id: "payment",
                      label: "Payment Details",
                      icon: CreditCard,
                    },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Customer Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">
                              Name:
                            </span>
                            <span className="ml-2">
                              {orderData?.user_id?.name}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Email:
                            </span>
                            <span className="ml-2">
                              {orderData?.user_id?.email}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          Shipping Address
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">
                              Name:
                            </span>
                            <span className="ml-2">
                              {orderData?.order_address?.name}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Email:
                            </span>
                            <span className="ml-2">
                              {orderData?.order_address?.email}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Phone:
                            </span>
                            <span className="ml-2">
                              {orderData?.order_address?.phone}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Address:
                            </span>
                            <span className="ml-2">
                              {orderData?.order_address?.address}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              ZIP Code:
                            </span>
                            <span className="ml-2">
                              {orderData?.order_address?.zipcode}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <DollarSign className="w-5 h-5" />
                          Order Summary
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-700">Subtotal:</span>
                            <span>
                              {formatCurrency(
                                orderData?.order_payment_meta?.sub_total
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Shipping:</span>
                            <span>
                              {formatCurrency(
                                orderData?.order_payment_meta?.shipping_cost
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700">Tax:</span>
                            <span>
                              {formatCurrency(
                                orderData?.order_payment_meta?.tax_amount
                              )}
                            </span>
                          </div>
                          {orderData?.coupon && (
                            <div className="flex justify-between text-green-600">
                              <span>Coupon ({orderData?.coupon}):</span>
                              <span>
                                -
                                {formatCurrency(
                                  orderData?.order_payment_meta?.coupon_amount
                                )}
                              </span>
                            </div>
                          )}
                          <hr className="my-2" />
                          <div className="flex justify-between font-semibold text-base">
                            <span>Total:</span>
                            <span>
                              {formatCurrency(
                                orderData?.order_payment_meta?.total_amount
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Additional Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">
                              Invoice Number:
                            </span>
                            <span className="ml-2">
                              {orderData?.invoice_number}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Payment Gateway:
                            </span>
                            <span className="ml-2 capitalize">
                              {orderData?.payment_gateway}
                            </span>
                          </div>
                          {orderData?.note && (
                            <div>
                              <span className="font-medium text-gray-700">
                                Note:
                              </span>
                              <span className="ml-2">{orderData?.note}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "tracking" && (
                  <div className="max-w-2xl">
                    <h3 className="font-semibold text-gray-900 mb-6">
                      Order Tracking History
                    </h3>
                    <div className="space-y-4">
                      {orderData.order_track.map((track, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${getStatusColor(
                              track.name
                            )}`}
                          >
                            {getStatusIcon(track.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900 capitalize">
                                {track.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(track.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "payment" && (
                  <div className="max-w-2xl">
                    <h3 className="font-semibold text-gray-900 mb-6">
                      Payment Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <div>
                        <span className="font-medium text-gray-700">
                          Payment Status:
                        </span>
                        <div
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ml-2 ${getStatusColor(
                            orderData.payment_status
                          )}`}
                        >
                          {getStatusIcon(orderData.payment_status)}
                          <span className="capitalize">
                            {orderData.payment_status}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Payment Gateway:
                        </span>
                        <span className="ml-2 capitalize">
                          {orderData.payment_gateway}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Transaction ID:
                        </span>
                        <span className="ml-2 font-mono text-xs break-all">
                          {orderData.transaction_id}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Payment Track ID:
                        </span>
                        <span className="ml-2 font-mono text-xs">
                          {orderData.payment_track}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Total Amount:
                        </span>
                        <span className="ml-2 font-semibold text-lg text-green-600">
                          {formatCurrency(
                            orderData.order_payment_meta.total_amount
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p>No order details available.</p>
        </div>
      )}
    </>
  );
};

export default OrderDetailsPage;
