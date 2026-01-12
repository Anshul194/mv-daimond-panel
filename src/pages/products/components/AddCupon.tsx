import React, { useState, useEffect } from "react";
import { Save, ArrowLeft, AlertCircle, Check } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { createCoupon } from "../../../store/slices/Coupon";
import toast, { Toaster } from "react-hot-toast";

const UpdateCouponPage = () => {
  const [formData, setFormData] = useState({
    code: "",
    type: "flat",
    value: 0,
    minOrderAmount: 0,
    maxDiscount: null,
    usageLimit: 0,
    validFrom: "",
    validTo: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = "Coupon code is required";
    }

    if (!formData.value) {
      newErrors.value = "Value is required";
    } else if (formData.value <= 0) {
      newErrors.value = "Value must be greater than 0";
    } else if (formData.type === "percentage" && formData.value > 100) {
      newErrors.value = "Percentage cannot exceed 100%";
    }

    if (formData.minOrderAmount && formData.minOrderAmount < 0) {
      newErrors.minOrderAmount = "Minimum order amount cannot be negative";
    }

    if (
      formData.type === "percentage" &&
      formData.maxDiscount &&
      formData.maxDiscount <= 0
    ) {
      newErrors.maxDiscount = "Maximum discount must be greater than 0";
    }

    if (!formData.usageLimit) {
      newErrors.usageLimit = "Usage limit is required";
    } else if (formData.usageLimit <= 0) {
      newErrors.usageLimit = "Usage limit must be greater than 0";
    }

    if (!formData.validFrom) {
      newErrors.validFrom = "Valid from date is required";
    }

    if (!formData.validTo) {
      newErrors.validTo = "Valid to date is required";
    }

    if (
      formData.validFrom &&
      formData.validTo &&
      new Date(formData.validFrom) >= new Date(formData.validTo)
    ) {
      newErrors.validTo = "Valid to date must be after valid from date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create coupon
      await dispatch(createCoupon(formData)).unwrap();

      // Show success message
      setShowSuccess(true);
      toast.success("Coupon created successfully! 🎉", {
        duration: 4000,
        position: "top-right",
        style: {
          background: '#10B981',
          color: '#fff',
          zIndex: 9999,
          minWidth: '300px',
          fontSize: '14px',
          padding: '16px',
        },
      });

      // Reset form
      setFormData({
        code: "",
        type: "flat",
        value: 0,
        minOrderAmount: 0,
        maxDiscount: null,
        usageLimit: 0,
        validFrom: "",
        validTo: "",
        isActive: true,
      });

      // Redirect to list page after 1.5 seconds
      setTimeout(() => {
        navigate("/coupons/all");
      }, 1500);
    } catch (error: any) {
      console.error("Error creating coupon:", error);
      toast.error(error?.message || "Failed to create coupon.", {
        duration: 4000,
        position: "top-right",
        style: {
          background: '#EF4444',
          color: '#fff',
          zIndex: 9999,
          minWidth: '300px',
          fontSize: '14px',
          padding: '16px',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster 
        position="top-right"
        containerStyle={{
          top: 80,
          zIndex: 9999,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#10B981',
            color: '#fff',
            zIndex: 9999,
            minWidth: '300px',
            fontSize: '14px',
            padding: '16px',
          },
          success: {
            duration: 4000,
            style: {
              background: '#10B981',
              color: '#fff',
              zIndex: 9999,
              minWidth: '300px',
              fontSize: '14px',
              padding: '16px',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#EF4444',
              color: '#fff',
              zIndex: 9999,
              minWidth: '300px',
              fontSize: '14px',
              padding: '16px',
            },
          },
        }}
      />
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Coupon</h1>
          <p className="text-gray-600 mt-2">
            Add New Coupon to your store. Fill in the details below to create a
            new coupon.
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <Check className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-green-800">Coupon added successfully!</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow-lg rounded-xl p-8">
          <div className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.code
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter coupon code"
                  />
                  {errors.code && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.code}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Discount Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="flat">Flat Amount</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Discount Settings */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Discount Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label
                    htmlFor="value"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {formData.type === "flat"
                      ? "Discount Amount *"
                      : "Discount Percentage *"}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="value"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      min="0"
                      max={formData.type === "percentage" ? "100" : undefined}
                      step={formData.type === "percentage" ? "0.01" : "1"}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.value
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder={formData.type === "flat" ? "0" : "0"}
                    />
                    {formData.type === "percentage" && (
                      <span className="absolute right-3 top-3 text-gray-500">
                        %
                      </span>
                    )}
                  </div>
                  {errors.value && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.value}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="minOrderAmount"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Minimum Order Amount
                  </label>
                  <input
                    type="number"
                    id="minOrderAmount"
                    name="minOrderAmount"
                    value={formData.minOrderAmount}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.minOrderAmount
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="0"
                  />
                  {errors.minOrderAmount && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.minOrderAmount}
                    </p>
                  )}
                </div>

                {formData.type === "percentage" && (
                  <div>
                    <label
                      htmlFor="maxDiscount"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Maximum Discount
                    </label>
                    <input
                      type="number"
                      id="maxDiscount"
                      name="maxDiscount"
                      value={formData.maxDiscount}
                      onChange={handleInputChange}
                      min="0"
                      step="1"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.maxDiscount
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Optional"
                    />
                    {errors.maxDiscount && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.maxDiscount}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Usage Settings */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Usage Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="usageLimit"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Usage Limit *
                  </label>
                  <input
                    type="number"
                    id="usageLimit"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    min="1"
                    step="1"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.usageLimit
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="1"
                  />
                  {errors.usageLimit && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.usageLimit}
                    </p>
                  )}
                </div>

                {/* <div>
                  <label
                    htmlFor="usedCount"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Used Count
                  </label>
                  <input
                    type="number"
                    id="usedCount"
                    name="usedCount"
                    value={formData.usedCount}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="0"
                  />
                </div> */}
              </div>
            </div>

            {/* Validity Period */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Validity Period
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="validFrom"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Valid From *
                  </label>
                  <input
                    type="date"
                    id="validFrom"
                    name="validFrom"
                    value={formData.validFrom}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.validFrom
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.validFrom && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.validFrom}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="validTo"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Valid To *
                  </label>
                  <input
                    type="date"
                    id="validTo"
                    name="validTo"
                    value={formData.validTo}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.validTo
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.validTo && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.validTo}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Status
              </h2>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label
                  htmlFor="isActive"
                  className="ml-3 text-sm font-medium text-gray-700"
                >
                  Active (Coupon can be used)
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                {isLoading ? "Adding..." : "Add Coupon"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateCouponPage;
