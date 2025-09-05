import React, { useEffect, useState } from "react";
import { Save, AlertCircle, Check } from "lucide-react";
import { useDispatch } from "react-redux";
import {
  createTax,
  getTaxById,
  updateTax,
} from "../../../store/slices/taxClass";
import { useParams } from "react-router";

const UpdateTaxClass = () => {
  const [formData, setFormData] = useState({
    name: "",
    isActivated: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const params = useParams();
  const taxId = params.id; // Assuming the tax ID is passed as a URL parameter
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // If activating and not already activated, show extra warning
    if (name === "isActivated" && checked && !formData.isActivated) {
      setShowActivateWarning(true);
      setPendingSubmit(false);
    }
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

    if (!formData.name.trim()) {
      newErrors.name = "Tax class name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Tax class name must be at least 2 characters";
    }
    // No validation for isActivated

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    // If activating and not already activated, show extra warning
    if (formData.isActivated && !pendingSubmit) {
      setShowActivateWarning(true);
      setPendingSubmit(true);
      return;
    }
    // Show warning popup before updating
    setShowWarningPopup(true);
  };

  // Confirm update after warning
  const handleConfirmUpdate = async () => {
    setShowWarningPopup(false);
    setIsLoading(true);
    try {
      await dispatch(updateTax({ taxId, taxData: formData }));
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error creating tax class:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm activation warning
  const handleConfirmActivate = () => {
    setShowActivateWarning(false);
    if (pendingSubmit) {
      setShowWarningPopup(true);
    }
  };

  // Cancel activation warning
  const handleCancelActivate = () => {
    setShowActivateWarning(false);
    setPendingSubmit(false);
    setFormData((prev) => ({
      ...prev,
      isActivated: false,
    }));
  };

  useEffect(() => {
    const fetchTaxClass = async () => {
      try {
        const res = await dispatch(getTaxById({ taxId }));

        console.log("Fetched Tax Class Data:", res);
        if (res.payload) {
          setFormData({
            name: res.payload.data.name || "",
            isActivated: !!res.payload.data.isActivated,
          });
        }
      } catch (error) {
        console.error("Error fetching tax class:", error);
      }
    };

    if (taxId) {
      fetchTaxClass();
    }
  }, [taxId]); // You can use this effect to fetch existing tax class data if needed

  // Popup/modal state for warning
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [showActivateWarning, setShowActivateWarning] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Update Tax Class</h1>
          <p className="text-gray-600 mt-2">
            Update the details of the tax class below.
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <Check className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-green-800">
              Tax class updated successfully!
            </span>
          </div>
        )}

        {/* Activation Warning Popup */}
        {showActivateWarning && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
              <AlertCircle className="w-8 h-8 text-yellow-600 mb-2" />
              <span className="text-lg text-yellow-800 font-semibold mb-2 text-center">
                Activating this tax class will deactivate all other tax classes.
                <br />
                Do you want to continue?
              </span>
              <div className="flex gap-4 mt-4">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  onClick={handleCancelActivate}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleConfirmActivate}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Warning Confirmation Popup */}
        {showWarningPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center">
              <AlertCircle className="w-8 h-8 text-yellow-600 mb-2" />
              <span className="text-lg text-yellow-800 font-semibold mb-2">
                Are you sure you want to update this tax class?
              </span>
              <div className="flex gap-4 mt-4">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  onClick={() => setShowWarningPopup(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleConfirmUpdate}
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Confirm"}
                </button>
              </div>
            </div>
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
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tax Class Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.name
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter tax class name"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>
                <div className="flex items-center mt-8 md:mt-0">
                  <input
                    type="checkbox"
                    id="isActivated"
                    name="isActivated"
                    checked={formData.isActivated}
                    onChange={handleInputChange}
                    className="mr-2 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isActivated"
                    className="text-sm font-medium text-gray-700"
                  >
                    Activated
                  </label>
                </div>
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
                {isLoading ? "Updating..." : "Update Tax Class"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateTaxClass;
