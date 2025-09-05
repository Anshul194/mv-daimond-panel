import React, { useState, useEffect } from "react";
import { Save, AlertCircle, Check } from "lucide-react";
import { useDispatch } from "react-redux";
import {
  createTaxClassOption,
  getTaxClassOptionById,
  updateTaxClassOption,
} from "../../../store/slices/taxClassOption";
import { useAppSelector } from "../../../hooks/redux";
import { fetchTaxes } from "../../../store/slices/taxClass";
import axiosInstance from "../../../services/axiosConfig";
import { useParams } from "react-router";

const EditTaxOption = () => {
  const [formData, setFormData] = useState({
    class_id: "",
    tax_name: "",
    country_id: "685cebaca3b0966edc86a2fd",
    state_id: "",
    city_id: "",
    postal_code: "",
    priority: "",
    is_compound: false,
    is_shipping: false,
    rate: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const params = useParams();
  const taxId = params.id; // Assuming the tax ID is passed as a URL parameter
  const dispatch = useDispatch();

  // Mock data - replace with actual API calls
  const [taxClasses, setTaxClasses] = useState([]);
  const [countries, setCountries] = useState([
    {
      id: "685cebaca3b0966edc86a2fd",
      name: "india",
    },
  ]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const { taxes, loading, error, pagination, searchQuery, filters } =
    useAppSelector((state) => state.taxClass);

  useEffect(() => {
    if (!taxes || taxes.length === 0) {
      dispatch(fetchTaxes());
    }
    const getStates = async () => {
      const response = await axiosInstance.get(`/api/state`, {
        params: { countryId: formData.country_id },
      });
      const data = await response.data;
      console.log("States data:", data);
      setStates(data);
    };
    getStates();
  }, []);

  const getCities = async (id) => {
    const response = await axiosInstance.get(`/api/city`, {
      params: { stateId: formData.state_id || id },
    });
    const data = await response.data;
    console.log("Cities data:", data);
    setCities(data);
  };
  useEffect(() => {
    getCities();
  }, [formData.state_id]);

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

    // Reset dependent fields when parent changes
    if (name === "country_id") {
      setFormData((prev) => ({ ...prev, state_id: "", city_id: "" }));
    }
    if (name === "state_id") {
      setFormData((prev) => ({ ...prev, city_id: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.class_id) {
      newErrors.class_id = "Tax class is required";
    }

    if (!formData.tax_name.trim()) {
      newErrors.tax_name = "Tax name is required";
    } else if (formData.tax_name.trim().length < 2) {
      newErrors.tax_name = "Tax name must be at least 2 characters";
    }

    if (!formData.country_id) {
      newErrors.country_id = "Country is required";
    }

    if (!formData.priority) {
      newErrors.priority = "Priority is required";
    } else if (formData.priority < 1 || formData.priority > 100) {
      newErrors.priority = "Priority must be between 1 and 100";
    }

    if (!formData.rate) {
      newErrors.rate = "Tax rate is required";
    } else if (formData.rate < 0 || formData.rate > 100) {
      newErrors.rate = "Tax rate must be between 0 and 100";
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
      // Convert empty strings to null for optional fields
      const submitData = {
        ...formData,
        city_id: formData.city_id || null,
        postal_code: formData.postal_code || null,
        priority: parseInt(formData.priority),
        rate: parseFloat(formData.rate),
      };

      await dispatch(
        updateTaxClassOption({ data: submitData, optionId: taxId })
      );

      setShowSuccess(true);
      setFormData({
        class_id: "",
        tax_name: "",
        country_id: "",
        state_id: "",
        city_id: "",
        postal_code: "",
        priority: "",
        is_compound: false,
        is_shipping: false,
        rate: "",
      });
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error creating tax option:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await dispatch(
          getTaxClassOptionById({ optionId: taxId })
        );
        console.log("Fetched Tax Option Data:", response);
        const data = response.payload.data;
        await getCities(data.state_id);

        setFormData({
          class_id: data.class_id._id || "",
          tax_name: data.tax_name || "",
          country_id: "685cebaca3b0966edc86a2fd",
          state_id: data.state_id || "",
          city_id: data.city_id || "",
          postal_code: data.postal_code || "",
          priority: data.priority || "",
          is_compound: data.is_compound || false,
          is_shipping: data.is_shipping || false,
          rate: data.rate || "",
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    getData();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Update Tax Option
          </h1>
          <p className="text-gray-600 mt-2">
            Update the tax option in your store. Configure tax rates based on
            location and other parameters.
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <Check className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-green-800">
              Tax option added successfully!
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
                    htmlFor="class_id"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tax Class *
                  </label>
                  <select
                    id="class_id"
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.class_id
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select tax class</option>
                    {taxes.map((taxClass) => (
                      <option key={taxClass.id} value={taxClass._id}>
                        {taxClass.name}
                      </option>
                    ))}
                  </select>
                  {errors.class_id && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.class_id}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="tax_name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tax Name *
                  </label>
                  <input
                    type="text"
                    id="tax_name"
                    name="tax_name"
                    value={formData.tax_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.tax_name
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter tax name"
                  />
                  {errors.tax_name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.tax_name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Location Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="country_id"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Country *
                  </label>
                  <select
                    id="country_id"
                    name="country_id"
                    value={formData.country_id}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.country_id
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select country</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {errors.country_id && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.country_id}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="state_id"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    State / Province
                  </label>
                  <select
                    id="state_id"
                    name="state_id"
                    value={formData.state_id}
                    onChange={handleInputChange}
                    disabled={!formData.country_id}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select state</option>
                    {states.map((state) => (
                      <option key={state._id} value={state._id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="city_id"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    City
                  </label>
                  <select
                    id="city_id"
                    name="city_id"
                    value={formData.city_id}
                    onChange={handleInputChange}
                    disabled={!formData.state_id}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select city</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="postal_code"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
            </div>

            {/* Tax Configuration */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Tax Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Priority *
                  </label>
                  <input
                    type="number"
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.priority
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter priority (1-100)"
                  />
                  {errors.priority && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.priority}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="rate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tax Rate (%) *
                  </label>
                  <input
                    type="number"
                    id="rate"
                    name="rate"
                    value={formData.rate}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.rate
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter tax rate"
                  />
                  {errors.rate && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.rate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Additional Options
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_compound"
                    name="is_compound"
                    checked={formData.is_compound}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="is_compound"
                    className="ml-3 text-sm font-medium text-gray-700"
                  >
                    Compound Tax
                  </label>
                  <p className="ml-2 text-sm text-gray-500">
                    (Apply this tax on top of other taxes)
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_shipping"
                    name="is_shipping"
                    checked={formData.is_shipping}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="is_shipping"
                    className="ml-3 text-sm font-medium text-gray-700"
                  >
                    Apply to Shipping
                  </label>
                  <p className="ml-2 text-sm text-gray-500">
                    (Include shipping costs in tax calculation)
                  </p>
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
                {isLoading ? "Updating..." : "Update Tax Option"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTaxOption;
