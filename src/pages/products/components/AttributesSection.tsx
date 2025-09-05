import React, { useEffect } from "react";
import { Plus, X, AlertTriangle } from "lucide-react";
import InputField from "./InputField ";
import axiosInstance from "../../../services/axiosConfig";

interface Variant {
  id: number;
  size: string;
  color: string;
  sku: string;
  price: string;
  stock: string;
  image: File | null;
}

interface InventorySectionProps {
  formData: {
    variants?: Variant[];
    lowStockThreshold?: string;
    manageStock?: string;
    [key: string]: any;
  };
  updateFormData: (field: string, value: any) => void;
}

const InventorySection: React.FC<InventorySectionProps> = ({
  formData,
  updateFormData,
}) => {
  const [colors, setColors] = React.useState<string[]>([]);
  const [sizes, setSizes] = React.useState<string[]>([]);
  const [attributes, setAttributes] = React.useState<string[]>([]);
  const [metalTypeResponse, setMetalTypeResponse] = React.useState<string[]>(
    []
  );

  const getData = async () => {
    try {
      const response = await axiosInstance("/api/colorcode");
      setColors(response.data.body.data.results);

      const sizeResponse = await axiosInstance("/api/size");
      setSizes(sizeResponse.data.body.data.result);

      // Fetch metal types using the new API endpoint with query param
      const metalTypeResponseApi = await axiosInstance(
        "/api/productattribute?id=686775563de5478c49e61e6c"
      );
      console.log("Fetched metal types:", metalTypeResponseApi);
      setMetalTypeResponse(metalTypeResponseApi?.data?.data?.terms || []);

      const attributeResponse = await axiosInstance("/api/productattribute");
      setAttributes(attributeResponse.data.data.data);
      console.log("Fetched attributes:", attributeResponse.data.data.data);

      console.log("Fetched colors:", response.data.body.data.result);
      console.log("Fetched sizes:", sizeResponse.data.body.data.result);
    } catch (error) {
      console.error("Error fetching attributes:", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);
  const addVariant = () => {
    const newVariants = [
      ...(formData.variants || []),
      {
        id: Date.now(),
        size: "",
        color: "",
        price: "",
        stock: "",
        // custom: [],
        image: null,
        additionalPrice: "",
        extraCost: "",
      },
    ];
    updateFormData("variants", newVariants);
  };

  const removeVariant = (id) => {
    const updatedVariants = formData.variants.filter(
      (variant) => variant.id !== id
    );
    updateFormData("variants", updatedVariants);
  };

  const updateVariant = (id, field, value) => {
    const updatedVariants = formData.variants.map((variant) =>
      variant.id === id ? { ...variant, [field]: value } : variant
    );
    updateFormData("variants", updatedVariants);
  };

  // const updateCustomAttribute = (variantId, index, field, value) => {
  //   const updatedVariants = formData.variants.map((variant) => {
  //     if (variant.id === variantId) {
  //       const updatedCustom = variant.custom.map((attr, idx) =>
  //         idx === index ? { ...attr, [field]: value } : attr
  //       );
  //       return { ...variant, custom: updatedCustom };
  //     }
  //     return variant;
  //   });
  //   updateFormData("variants", updatedVariants);
  // };

  const getTotalStock = () => {
    return (formData.variants || []).reduce((total, variant) => {
      return total + (parseInt(variant.stock) || 0);
    }, 0);
  };

  const getLowStockVariants = () => {
    const threshold = parseInt(formData.lowStockThreshold) || 5;
    return (formData.variants || []).filter(
      (variant) => parseInt(variant.stock) <= threshold
    );
  };

  return (
    <div className="max-w-6xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Variant Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage product variations and stock levels
          </p>
        </div>
        <button
          onClick={addVariant}
          className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Variant
        </button>
      </div>

      {/* Stock Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-1">
            Total Stock
          </h3>
          <p className="text-2xl font-bold text-blue-600">{getTotalStock()}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-900 mb-1">Variants</h3>
          <p className="text-2xl font-bold text-green-600">
            {(formData.variants || []).length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-900 mb-1">
            Low Stock
          </h3>
          <p className="text-2xl font-bold text-yellow-600">
            {getLowStockVariants().length}
          </p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {getLowStockVariants().length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">
              Low Stock Alert
            </h3>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            {getLowStockVariants().length} variant(s) are running low on stock
          </p>
        </div>
      )}

      {/* Product Variants */}
      <div className="space-y-6">
        {formData.variants && formData.variants.length > 0 ? (
          formData.variants.map((variant, index) => (
            <div key={variant.id} className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Variant #{index + 1}
                </h3>
                <button
                  onClick={() => removeVariant(variant.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove variant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="mb-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size
                  </label>
                  <select
                    value={variant.size}
                    onChange={(e) =>
                      updateVariant(variant.id, "size", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                  >
                    <option value="">Select Size</option>
                    {sizes?.map((size) => (
                      <option key={size._id} value={size._id}>
                        {size.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metal Type
                  </label>
                  <select
                    value={variant.color}
                    onChange={(e) =>
                      updateVariant(variant.id, "color", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                  >
                    <option value="">Select Metal Type</option>
                    {metalTypeResponse?.map((color) => (
                      <option key={color._id} value={color._id}>
                        {color.value}
                      </option>
                    ))}
                  </select>
                </div>

                <InputField
                  label="Additional Price"
                  placeholder="0.00"
                  type="number"
                  value={variant.price}
                  onChange={(e) =>
                    updateVariant(variant.id, "price", e.target.value)
                  }
                  className="mb-0"
                />
                <InputField
                  label="Stock Quantity"
                  placeholder="0"
                  type="number"
                  value={variant.stockCount}
                  onChange={(e) =>
                    updateVariant(variant.id, "stockCount", e.target.value)
                  }
                  className="mb-0"
                />

                <InputField
                  label="Extra Cost"
                  placeholder="0.00"
                  type="number"
                  value={variant.extraCost}
                  onChange={(e) =>
                    updateVariant(variant.id, "extraCost", e.target.value)
                  }
                  className="mb-0"
                />

                <div className="mb-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variant Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        updateVariant(variant.id, "image", file);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                  />
                </div>
              </div>
              {/* <div>
                <img
                  src={variant?.image || URL?.createObjectURL(variant?.image)}
                  alt="Variant"
                  className="mt-4 w-24 h-24 object-cover rounded-lg"
                />
              </div> */}

              {/* Stock Status Indicator */}
              {/* <div className="mt-4 flex items-center">
                <span className="text-sm text-gray-600 mr-2">
                  Stock Status:
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    parseInt(variant.stock) >
                    (parseInt(formData.lowStockThreshold) || 5)
                      ? "bg-green-100 text-green-800"
                      : parseInt(variant.stock) > 0
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {parseInt(variant.stock) >
                  (parseInt(formData.lowStockThreshold) || 5)
                    ? "In Stock"
                    : parseInt(variant.stock) > 0
                    ? "Low Stock"
                    : "Out of Stock"}
                </span>
              </div> */}
              {/* 
              <div>
                <div className="mt-6 mb-4 flex justify-between">
                  <h4 className="text-sm font-medium text-gray-700 mt-4 mb-2">
                    Custom Attributes
                  </h4>

                  <button
                    onClick={() => {
                      const customAttr = {
                        name: "",
                        value: "",
                      };
                      const updatedVariants = formData.variants.map((v) =>
                        v.id === variant.id
                          ? { ...v, custom: [...(v.custom || []), customAttr] }
                          : v
                      );
                      updateFormData("variants", updatedVariants);
                    }}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Add Custom Attribute
                  </button>
                </div>
                {variant.custom && variant.custom.length > 0 ? (
                  variant.custom.map((attr, idx) => (
                    <div className="w-full flex gap-6">
                      <div
                        key={idx}
                        className="w-full grid grid-cols-2 gap-6 mb-2"
                      >
                        <div className="mb-0">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Attribute Name
                          </label>
                          <select
                            value={attr.name}
                            onChange={(e) =>
                              updateCustomAttribute(
                                variant.id,
                                idx,
                                "name",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                          >
                            <option value="">Select Attribute</option>
                            {attributes?.map((attribute) => (
                              <option
                                key={attribute._id}
                                value={attribute.title}
                              >
                                {attribute.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-0">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Attribute Value
                          </label>
                          <select
                            value={attr.value}
                            onChange={(e) =>
                              updateCustomAttribute(
                                variant.id,
                                idx,
                                "value",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                          >
                            <option value="">Select Value</option>
                            {attributes
                              .find((a) => a.title === attr.name)
                              ?.terms?.map((value, index) => (
                                <option key={index} value={value?.value}>
                                  {value?.value}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const updatedVariants = formData.variants.map((v) =>
                            v.id === variant.id
                              ? {
                                  ...v,
                                  custom: v.custom.filter((_, i) => i !== idx),
                                }
                              : v
                          );
                          updateFormData("variants", updatedVariants);
                        }}
                        className="mt-7 px-4 w-fit h-12 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No custom attributes</p>
                )}
              </div> */}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium mb-2">No variants added yet</p>
            <p className="mb-4">
              Add product variants with different sizes, colors, or
              configurations
            </p>
            <button
              onClick={addVariant}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Add First Variant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventorySection;
