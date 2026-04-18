import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, X, AlertTriangle } from "lucide-react";
import InputField from "./InputField ";
import axiosInstance, { axiosPublic } from "../../../services/axiosConfig";

import { Variant, ProductFormData } from "../types";

const buildImageUrl = (raw: string | null | undefined) => {
  if (!raw) return null;
  const str = String(raw).trim();
  if (!str || str === "/" || str === "null") return null;
  if (str.startsWith("http") || str.startsWith("data:")) return str;
  const base = (import.meta.env.VITE_IMAGE_URL || import.meta.env.VITE_BASE_URL || "").toString();
  const trimmedBase = base.replace(/\/$/, "");
  if (!trimmedBase) return str.startsWith("/") ? str : `/${str}`;
  if (str.startsWith("/")) return `${trimmedBase}${str}`;
  return `${trimmedBase}/${str}`;
};

const MediaPreview: React.FC<{ file: File | string | null; type: "image" | "video" }> = ({ file, type }) => {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }

    if (typeof file === "string") {
      setUrl(buildImageUrl(file));
      return;
    }

    if (file instanceof Blob || file instanceof File) {
      const objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]);

  if (!url) return null;

  return (
    <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-black flex items-center justify-center group relative">
      {type === "image" ? (
        <img src={url} alt="Preview" className="w-full h-full object-cover" />
      ) : (
        <video src={url} className="w-full h-full object-cover" controls playsInline muted />
      )}
    </div>
  );
};

interface InventorySectionProps {
  formData: ProductFormData;
  updateFormData: (field: string, value: any) => void;
}

const AttributesSection: React.FC<InventorySectionProps> = ({
  formData,
  updateFormData,
}) => {
  const [sizes, setSizes] = React.useState<any[]>([]);
  const [metalTypeResponse, setMetalTypeResponse] = React.useState<any[]>(
    []
  );
  const [shapeResponse, setShapeResponse] = React.useState<any[]>([]);
  const [caratResponse, setCaratResponse] = React.useState<any[]>([]);
  const [stoneResponse, setStoneResponse] = React.useState<any[]>([]);
  const [stoneColorResponse, setStoneColorResponse] = React.useState<any[]>([]);

  const getData = async () => {
    try {
      // Fetch sizes (remains a separate endpoint)
      const sizeResponse = await axiosPublic("/api/size");
      setSizes(sizeResponse.data.body.data?.result || sizeResponse.data.body.data?.results || []);

      // Fetch all product attributes in a single call
      const attributeResponse = await axiosPublic("/api/productattribute");
      const allAttributes = attributeResponse.data?.data?.data ||
        attributeResponse.data?.body?.data?.data ||
        attributeResponse.data?.data || [];

      // Extract terms for each attribute type
      const findTerms = (titleCheck) => {
        const attr = allAttributes.find((a) => (a.title || "").toLowerCase().includes(titleCheck));
        return attr?.terms || [];
      };

      const metalTerms = findTerms("metal");
      const shapeTerms = findTerms("shape");
      const caratTerms = findTerms("carat");
      const stoneTerms = findTerms("stone");
      // For stone color, ensure both 'stone' and 'color' in title
      const stoneColorAttr = allAttributes.find((a) => (a.title || "").toLowerCase().includes("stone") && (a.title || "").toLowerCase().includes("color"));
      const stoneColorTerms = stoneColorAttr?.terms || [];

      setMetalTypeResponse(metalTerms);
      setShapeResponse(shapeTerms);
      setCaratResponse(caratTerms);
      setStoneResponse(stoneTerms);
      setStoneColorResponse(stoneColorTerms);

      console.log("Attributes loaded successfully (optimized):", {
        metalTerms: metalTerms.length,
        shapeTerms: shapeTerms.length,
        caratTerms: caratTerms.length,
        stoneTerms: stoneTerms.length,
        stoneColorTerms: stoneColorTerms.length,
        metalOptions: metalTerms.map((t) => t.value),
        shapeOptions: shapeTerms.map((t) => t.value),
        caratOptions: caratTerms.map((t) => t.value)
      });
    } catch (error) {
      console.error("Error in getData (optimized):", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);
  const addVariant = () => {
    console.log("[DEBUG] addVariant called. Current variants:", formData.variants);
    const newVariants: Variant[] = [
      ...(formData.variants || []),
      {
        id: `new-${Date.now()}-${(formData.variants || []).length}`,
        size: "",
        color: "",
        shape: "",
        carat: "",
        sku: "",
        price: "",
        stockCount: "0",
        extraCost: "",
        image: null,
      },
    ];
    console.log("[DEBUG] New variants array:", newVariants);
    updateFormData("variants", newVariants);
  };

  const removeVariant = (id: string | number) => {
    if (!formData.variants) return;
    const updatedVariants = formData.variants.filter(
      (variant) => variant.id !== id
    );
    updateFormData("variants", updatedVariants);
  };

  const updateVariant = (id: string | number, field: string, value: any) => {
    if (!formData.variants) return;
    const updatedVariants = formData.variants.map((variant) =>
      variant.id === id ? { ...variant, [field]: value } : variant
    );
    // show a small toast when gemstone fields change for immediate feedback
    if (field === "stone" || field === "stoneColor") {
      const label = field === "stone" ? "Stone" : "Stone Color";
      toast.success(`${label} set to ${value || "(cleared)"}`, { duration: 1200 });
    }
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
    return (formData.variants || []).reduce((total: number, variant: any) => {
      return total + (parseInt(variant.stockCount) || 0);
    }, 0);
  };

  const getLowStockVariants = () => {
    const threshold = parseInt(formData.lowStockThreshold || "5") || 5;
    return (formData.variants || []).filter(
      (variant: any) => (parseInt(variant.stockCount) || 0) <= threshold
    );
  };

  console.log("[DEBUG] Rendering AttributesSection. Variants count:", formData.variants?.length || 0);
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

      {/* Debug: show current variants state so selections can be verified */}
      {/* <div className="mb-6 p-4 bg-gray-100 rounded">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Debug: Variants state</h4>
        <pre className="text-xs text-gray-700 overflow-auto max-h-48">
          {JSON.stringify(formData.variants || [], null, 2)}
        </pre>
      </div> */}

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
            <div key={variant.id?.toString() || index} className="bg-gray-50 p-6 rounded-lg">
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
                    value={variant.color || ""}
                    onChange={(e) => updateVariant(variant.id, "color", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                  >
                    <option value="">Select Metal Type</option>
                    {Array.isArray(metalTypeResponse) && metalTypeResponse.length > 0 ? (
                      metalTypeResponse.map((m: any) => (
                        <option key={m._id || m.id || m.value || m.name} value={m.value || m.name || m}>
                          {m.value || m.name || m}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No metal options available</option>
                    )}
                  </select>
                </div>
                <div className="mb-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shape
                  </label>
                  <select
                    value={variant.shape || ""}
                    onChange={(e) => updateVariant(variant.id, "shape", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                  >
                    <option value="">Select Shape</option>
                    {Array.isArray(shapeResponse) && shapeResponse.length > 0 ? (
                      shapeResponse.map((s: any) => (
                        <option key={s._id || s.id || s.value || s.name} value={s.value || s.name || s}>
                          {s.value || s.name || s}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No shape options available</option>
                    )}
                  </select>
                </div>
                <div className="mb-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stone
                  </label>
                  <select
                    value={variant.stone || ""}
                    onChange={(e) => {
                      console.log(`[TRACE] stone select id=${variant.id} value=`, e.target.value);
                      updateVariant(variant.id, "stone", e.target.value);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                  >
                    <option value="">Select Stone</option>
                    {Array.isArray(stoneResponse) && stoneResponse.length > 0 ? (
                      stoneResponse.map((s: any) => (
                        <option key={s._id || s.id || s.value || s.name} value={s.value || s.name || s}>
                          {s.value || s.name || s}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No stone options available</option>
                    )}
                  </select>
                </div>

                <div className="mb-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stone Color
                  </label>
                  <select
                    value={variant.stoneColor || ""}
                    onChange={(e) => {
                      console.log(`[TRACE] stoneColor select id=${variant.id} value=`, e.target.value);
                      updateVariant(variant.id, "stoneColor", e.target.value);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                  >
                    <option value="">Select Stone Color</option>
                    {Array.isArray(stoneColorResponse) && stoneColorResponse.length > 0 ? (
                      stoneColorResponse.map((s: any) => (
                        <option key={s._id || s.id || s.value || s.name} value={s.value || s.name || s}>
                          {s.value || s.name || s}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No stone color options available</option>
                    )}
                  </select>
                </div>
                <div className="mb-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carat
                  </label>
                  <select
                    value={variant.carat || ""}
                    onChange={(e) =>
                      updateVariant(variant.id, "carat", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                  >
                    <option value="">Select Carat</option>
                    {Array.isArray(caratResponse) && caratResponse.length > 0 ? (
                      caratResponse.map((carat) => (
                        <option key={carat._id || carat.id || carat.value} value={carat.value || carat.name || carat}>
                          {carat.value || carat.name || carat}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No carat options available</option>
                    )}
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
                  value={variant.stockCount || ""}
                  onChange={(e) =>
                    updateVariant(variant.id, "stockCount", e.target.value)
                  }
                  className="mb-0"
                />

                <InputField
                  label="Extra Cost"
                  placeholder="0.00"
                  type="number"
                  value={variant.extraCost || ""}
                  onChange={(e) =>
                    updateVariant(variant.id, "extraCost", e.target.value)
                  }
                  className="mb-0"
                />

                <div className="mb-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variant Image (Main)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        updateVariant(variant.id, "image", file);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                  />
                  <MediaPreview file={variant.image} type="image" />
                </div>
              </div>
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">
                  Extended Media
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((num) => (
                    <div key={`ring-angle-${variant.id}-${num}`} className="mb-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ring Angle {num}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const newRingImages = [...(variant.ringImages || [])];
                            newRingImages[num - 1] = file;
                            updateVariant(variant.id, "ringImages", newRingImages);
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-colors"
                      />
                      <MediaPreview file={variant.ringImages?.[num - 1]} type="image" />
                    </div>
                  ))}
                  <div className="mb-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ring 360 Video
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) updateVariant(variant.id, "ringVideo360", file);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-colors"
                    />
                    <MediaPreview file={variant.ringVideo360} type="video" />
                  </div>
                  <div className="mb-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) updateVariant(variant.id, "modelImage", file);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-colors"
                    />
                    <MediaPreview file={variant.modelImage} type="image" />
                  </div>
                  <div className="mb-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model Video
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) updateVariant(variant.id, "modelVideo", file);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-colors"
                    />
                    <MediaPreview file={variant.modelVideo} type="video" />
                  </div>
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

export default AttributesSection;
