import React, { useState } from "react";
import { Save, AlertCircle, Check, X, AlertTriangle } from "lucide-react";
import { useDispatch } from "react-redux";
import { createTax } from "../../../store/slices/taxClass";

const AddTaxClass = () => {
  const [formData, setFormData] = useState({
    name: "",
    isActivated: false
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showActivationPopup, setShowActivationPopup] = useState(false);
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // If trying to activate, show popup first
    if (name === "isActivated" && checked) {
      setShowActivationPopup(true);
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleActivationConfirm = () => {
    setFormData((prev) => ({
      ...prev,
      isActivated: true,
    }));
    setShowActivationPopup(false);
  };

  const handleActivationCancel = () => {
    setShowActivationPopup(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tax class name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Tax class name must be at least 2 characters";
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
      await dispatch(createTax(formData));

      setShowSuccess(true);
      setFormData({
        name: "",
        isActivated: false
      });
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error creating tax class:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Tax Class</h1>
          <p className="text-gray-600 mt-2">
            Add New Tax Class to your store. Fill in the details below to create
            a new tax class.
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <Check className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-green-800">
              Tax class added successfully!
            </span>
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
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isActivated"
                    className="ml-2 block text-sm font-medium text-gray-700"
                  >
                    Activate Tax Class
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
                {isLoading ? "Adding..." : "Add Tax Class"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activation Confirmation Popup */}
      {showActivationPopup && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Activation
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Activating this tax class will automatically deactivate the currently active tax class. Only one tax class can be active at a time.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleActivationCancel}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleActivationConfirm}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Confirm Activation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTaxClass;