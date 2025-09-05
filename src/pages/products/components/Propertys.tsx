import React, { useEffect } from "react";

import axiosInstance from "../../../services/axiosConfig";

interface PropertiesSection {
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

const PropertiesSection: React.FC<PriceSectionProps> = ({
  formData,
  propertys,
  updateFormData,
}) => {
  const [data, setData] = React.useState<any[]>([]);
  useEffect(() => {
    const getData = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/productattribute/${formData.category_id}`
        );

        console.log("Fetched Taxes:", res.data.data);
        setData(res.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    getData();
  }, []);
  console.log("formData", formData);
  return (
    <div className="max-w-4xl p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Properties Information
        </h1>
      </div>

      {formData.category_id ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data && data.length > 0 ? (
            data?.map((property) => {
              if (property.title.toLowerCase().includes("metal")) {
                return null; // Skip rendering if the title includes "metal"
              }
              return (
                <div key={property._id} className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {property.title}
                  </label>
                  <select
                    value={propertys[property.title] || ""}
                    onChange={(e) =>
                      updateFormData(property.title, e.target.value)
                    }
                    className="w-full px-4 py-3 opacity-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                  >
                    <option value="">Select {property.title}</option>
                    {property.terms?.map((tax) => (
                      <option key={tax._id} value={tax.value}>
                        {tax.value}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-red-500">
                Please select a category to view properties.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-red-500">
            Please select a category to view properties.
          </p>
        </div>
      )}
    </div>
  );
};

export default PropertiesSection;
