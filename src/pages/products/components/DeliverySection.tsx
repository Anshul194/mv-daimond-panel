import React from "react";
import { Plus, X, AlertTriangle } from "lucide-react";
import InputField from "./InputField ";

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

const DeliverySection: React.FC<InventorySectionProps> = ({
  formData,
  updateFormData,
}) => {
  const addVariant = () => {
    const newVariants = [
      ...(formData.variants || []),
      {
        id: Date.now(),
        size: "",
        color: "",
        sku: "",
        price: "",
        stock: "",
        image: null,
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
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-1">Manage product stock levels</p>
        </div>
        {/* <button
          onClick={addVariant}
          className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Variant
        </button> */}
      </div>

      {/* Stock Summary */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
      </div> */}

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

      {/* Inventory Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <InputField
          label="Stock Quantity"
          placeholder="0"
          type="number"
          value={formData.stockQuantity || ""}
          onChange={(e) => updateFormData("stockQuantity", e.target.value)}
        />

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stock Status
          </label>
          <select
            value={formData.stockStatus || "in_stock"}
            onChange={(e) => updateFormData("stockStatus", e.target.value)}
            className="w-full px-4 py-3  border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
          >
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stock Management
          </label>
          <select
            value={formData.manageStock || "yes"}
            onChange={(e) => updateFormData("manageStock", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
          >
            <option value="yes">Track stock quantity</option>
            <option value="no">Don't track stock</option>
          </select>
        </div>
      </div>

      {/* Product Variants */}
      {/* <div className="space-y-6">
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
                <InputField
                  label="Size"
                  placeholder="e.g., XL, Medium, 42"
                  value={variant.size}
                  onChange={(e) =>
                    updateVariant(variant.id, "size", e.target.value)
                  }
                  className="mb-0"
                />
                <InputField
                  label="Color"
                  placeholder="e.g., Red, Blue, Black"
                  value={variant.color}
                  onChange={(e) =>
                    updateVariant(variant.id, "color", e.target.value)
                  }
                  className="mb-0"
                />
                <InputField
                  label="SKU"
                  placeholder="Unique identifier"
                  value={variant.sku}
                  onChange={(e) =>
                    updateVariant(variant.id, "sku", e.target.value)
                  }
                  className="mb-0"
                />
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
                  value={variant.stock}
                  onChange={(e) =>
                    updateVariant(variant.id, "stock", e.target.value)
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

              <div className="mt-4 flex items-center">
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
              </div>
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
      </div> */}
    </div>
  );
};

export default DeliverySection;
