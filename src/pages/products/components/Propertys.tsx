import React from "react";

interface PropertiesSectionProps {
  formData: {
    regularPrice?: string | number;
    salePrice?: string | number;
    sku?: string;
    stockQuantity?: string | number;
    lowStockThreshold?: string | number;
    stockStatus?: string;
    category_id?: string;
    [key: string]: any;
  };
  propertys: { [key: string]: any };
  productAttributes: any[];
  updateFormData: (field: string, value: any) => void;
}

const PropertiesSection: React.FC<PropertiesSectionProps> = ({
  formData,
  propertys,
  productAttributes,
  updateFormData,
}) => {
  // Debug: log the productAttributes to check the data structure
  console.log("PropertiesSection productAttributes:", productAttributes);

  // Ensure productAttributes is always an array
  const attributesArray = Array.isArray(productAttributes)
    ? productAttributes
    : productAttributes
    ? [productAttributes]
    : [];

  return (
    <div className="max-w-4xl p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Properties Information
        </h1>
      </div>

      {formData.category_id ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {attributesArray && attributesArray.length > 0 ? (
            attributesArray.map((property) => {
              return (
                <div key={property._id} className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {property.title}
                  </label>
                  <select
                    value={propertys[property.title] || ""}
                    onChange={(e) => updateFormData(property.title, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none bg-white shadow-sm hover:border-emerald-300"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1.25rem"
                    }}
                  >
                    <option value="">Select {property.title}</option>
                    {property.terms?.map((term: any, i: number) => (
                      <option key={term._id || i} value={term.value || term.name || term}>
                        {term.value || term.name || term}
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
