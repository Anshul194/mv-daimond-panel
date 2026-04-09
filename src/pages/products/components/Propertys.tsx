import React from "react";
import AttributeTiles from "./AttributeTiles";

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
                  <AttributeTiles
                    options={property.terms || []}
                    value={propertys[property.title] || ""}
                    onChange={(v) => updateFormData(property.title, v)}
                    type={property.title?.toLowerCase()?.includes("metal") ? "metal" : property.title?.toLowerCase()?.includes("shape") ? "shape" : undefined}
                  />
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
