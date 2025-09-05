import React, { useEffect } from "react";
import InputField from "./InputField ";
import { useDispatch, useSelector } from "react-redux";
import { useAppSelector } from "../../../hooks/redux";
import { fetchTaxes } from "../../../store/slices/taxClass";

interface PriceSectionProps {
  formData: {
    regularPrice?: string | number;
    salePrice?: string | number;
    sku?: string;
    stockQuantity?: string | number;
    lowStockThreshold?: string | number;
    stockStatus?: string;
    [key: string]: any;
  };
  updateFormData: (field: string, value: any) => void;
}

const PriceSection: React.FC<PriceSectionProps> = ({
  formData,
  updateFormData,
}) => {
  const { taxes, loading, error, pagination, searchQuery, filters } =
    useAppSelector((state) => state.taxClass);
  const dispatch = useDispatch();

  useEffect(() => {
    if (taxes.length === 0) {
      dispatch(fetchTaxes());
    }
  }, []);
  return (
    <div className="max-w-4xl p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Pricing Information
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Regular Price"
          placeholder="0.00"
          type="number"
          value={formData.regularPrice || ""}
          onChange={(e) => updateFormData("regularPrice", e.target.value)}
          required
        />

        <InputField
          label="Sale Price"
          placeholder="0.00"
          type="number"
          value={formData.salePrice || ""}
          onChange={(e) => updateFormData("salePrice", e.target.value)}
        />

        {/* <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tax
          </label>
          <select
            value={formData.tax || ""}
            onChange={(e) => updateFormData("tax", e.target.value)}
            className="w-full px-4 py-3 opacity-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
          >
            <option value="">Select Tax Class</option>
            {taxes?.map((tax) => (
              <option key={tax._id} value={tax._id}>
                {tax.name}
              </option>
            ))}
          </select>
        </div> */}
      </div>
    </div>
  );
};

export default PriceSection;
