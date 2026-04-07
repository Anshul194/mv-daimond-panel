import React, { useEffect } from "react";
import { Plus, X, AlertTriangle } from "lucide-react";
import InputField from "./InputField ";
import axiosInstance from "../../../services/axiosConfig";

import { Variant, ProductFormData } from "../types";

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
  const [settingStyleResponse, setSettingStyleResponse] = React.useState<any[]>([]);
  const [settingProfileResponse, setSettingProfileResponse] = React.useState<any[]>([]);
  const [bandTypeResponse, setBandTypeResponse] = React.useState<any[]>([]);

  const getData = async () => {
    try {
      const sizeResponse = await axiosInstance("/api/size");
      setSizes(sizeResponse.data.body.data?.result || sizeResponse.data.body.data?.results || []);

      let metalTerms = [];
      let shapeTerms = [];

      // 1. Fetch Metal Types by Title
      try {
        const metalResponseApi = await axiosInstance(
          "/api/productattribute?filters=" + encodeURIComponent(JSON.stringify({ title: "METAL TYPE" }))
        );
        const results = metalResponseApi?.data?.data?.data || metalResponseApi?.data?.body?.data || [];
        const metalAttr = Array.isArray(results) ? results.find((a: any) => (a.title || "").toLowerCase().includes("metal")) : null;
        metalTerms = metalAttr?.terms || [];
      } catch (error) {
        console.error("Error fetching metal types:", error);
      }

      // 2. Fetch Shapes by Title
      try {
        const shapeResponseApi = await axiosInstance(
          "/api/productattribute?filters=" + encodeURIComponent(JSON.stringify({ title: "Shape" }))
        );
        const results = shapeResponseApi?.data?.data?.data || shapeResponseApi?.data?.body?.data || [];
        const shapeAttr = Array.isArray(results) ? results.find((a: any) => (a.title || "").toLowerCase().includes("shape")) : null;
        shapeTerms = shapeAttr?.terms || [];
      } catch (error) {
        console.error("Error fetching shapes:", error);
      }

      // 2.1 Fetch Carats by Title
      let caratTerms = [];
      try {
        const caratResponseApi = await axiosInstance(
          "/api/productattribute?filters=" + encodeURIComponent(JSON.stringify({ title: "carat" }))
        );
        const results = caratResponseApi?.data?.data?.data || caratResponseApi?.data?.body?.data || [];
        const caratAttr = Array.isArray(results) ? results.find((a: any) => (a.title || "").toLowerCase().includes("carat")) : null;
        caratTerms = caratAttr?.terms || [];
      } catch (error) {
        console.error("Error fetching carats:", error);
      }

      // 3. Fetch All Attributes for Fallbacks
      const attributeResponse = await axiosInstance("/api/productattribute");
      const allAttributes = attributeResponse.data?.data?.data ||
        attributeResponse.data?.body?.data?.data ||
        attributeResponse.data?.data || [];
      // setAttributes(allAttributes);

      // 4. Apply Fallbacks if specific fetches failed
      if (allAttributes.length > 0) {
        if (shapeTerms.length === 0) {
          const shapeAttr = allAttributes.find(
            (attr: any) => attr.title?.toLowerCase() === "shape" || attr.title?.toLowerCase()?.includes("shape")
          );
          if (shapeAttr?.terms) shapeTerms = shapeAttr.terms;
        }

        if (metalTerms.length === 0) {
          const metalAttr = allAttributes.find(
            (attr: any) => attr.title?.toLowerCase() === "metal type" ||
              attr.title?.toLowerCase()?.includes("metal") ||
              attr.title?.toLowerCase()?.includes("color")
          );
          if (metalAttr?.terms) metalTerms = metalAttr.terms;
        }

        if (caratTerms.length === 0) {
          const caratAttr = allAttributes.find(
            (attr: any) => attr.title?.toLowerCase() === "carat" ||
              attr.title?.toLowerCase()?.includes("carat")
          );
          if (caratAttr?.terms) caratTerms = caratAttr.terms;
        }
      }

      // 5. Fetch Setting Style & Setting Profile
      let settingStyleTerms = [];
      let settingProfileTerms = [];
      let bandTypeTerms = [];
      try {
        // User requested to filter by "Setting" for setting style
        const styleRes = await axiosInstance("/api/productattribute?filters=" + encodeURIComponent(JSON.stringify({ title: "Setting" })));
        const styleResults = styleRes?.data?.data?.data || styleRes?.data?.body?.data || [];
        const styleAttr = Array.isArray(styleResults) ? styleResults.find((a: any) => (a.title || "").toLowerCase().includes("setting")) : null;
        settingStyleTerms = styleAttr?.terms || [];
      } catch(e) { console.error("Error fetching style:", e); }

      try {
        const profileRes = await axiosInstance("/api/productattribute?filters=" + encodeURIComponent(JSON.stringify({ title: "Setting Profile" })));
        const profileResults = profileRes?.data?.data?.data || profileRes?.data?.body?.data || [];
        const profileAttr = Array.isArray(profileResults) ? profileResults.find((a: any) => (a.title || "").toLowerCase().includes("setting profile")) : null;
        settingProfileTerms = profileAttr?.terms || [];
      } catch(e) { console.error("Error fetching profile:", e); }

      try {
        const bandRes = await axiosInstance("/api/productattribute?filters=" + encodeURIComponent(JSON.stringify({ title: "Band Type" })));
        const bandResults = bandRes?.data?.data?.data || bandRes?.data?.body?.data || [];
        const bandAttr = Array.isArray(bandResults) ? bandResults.find((a: any) => (a.title || "").toLowerCase().includes("band")) : null;
        bandTypeTerms = bandAttr?.terms || [];
      } catch(e) { console.error("Error fetching band type:", e); }

      // 6. Update state once
      setMetalTypeResponse(metalTerms);
      setShapeResponse(shapeTerms);
      setCaratResponse(caratTerms);
      setSettingStyleResponse(settingStyleTerms);
      setSettingProfileResponse(settingProfileTerms);
      setBandTypeResponse(bandTypeTerms);

      console.log("Attributes loaded successfully:", {
        metalTerms: metalTerms.length,
        shapeTerms: shapeTerms.length,
        caratTerms: caratTerms.length,
        metalOptions: metalTerms.map((t: any) => t.value),
        shapeOptions: shapeTerms.map((t: any) => t.value),
        caratOptions: caratTerms.map((t: any) => t.value)
      });
    } catch (error) {
      console.error("Error in getData:", error);
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
        carat: "",
        settingStyle: "",
        settingProfile: "",
        bandType: "",
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none bg-white shadow-sm hover:border-emerald-300"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1.25rem"
                    }}
                  >
                    <option value="">Select Metal Type</option>
                    {metalTypeResponse?.map((m, i) => (
                      <option key={m._id || i} value={m.value || m.name || m}>
                        {m.value || m.name || m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shape
                  </label>
                  <select
                    value={variant.shape || ""}
                    onChange={(e) => updateVariant(variant.id, "shape", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none bg-white shadow-sm hover:border-emerald-300"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1.25rem"
                    }}
                  >
                    <option value="">Select Shape</option>
                    {shapeResponse?.map((s, i) => (
                      <option key={s._id || i} value={s.value || s.name || s}>
                        {s.value || s.name || s}
                      </option>
                    ))}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none bg-white shadow-sm hover:border-emerald-300"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1.25rem"
                    }}
                  >
                    <option value="">Select Carat</option>
                    {Array.isArray(caratResponse) && caratResponse.length > 0 ? (
                      caratResponse.map((carat, i) => (
                        <option key={carat._id || carat.id || i} value={carat.value || carat.name || carat}>
                          {carat.value || carat.name || carat}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No carat options available</option>
                    )}
                  </select>
                </div>

                <div className="mb-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Setting Style
                  </label>
                  <select
                    value={variant.settingStyle || ""}
                    onChange={(e) => updateVariant(variant.id, "settingStyle", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none bg-white shadow-sm hover:border-emerald-300"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1.25rem"
                    }}
                  >
                    <option value="">Select Setting Style</option>
                    {settingStyleResponse?.map((s, i) => (
                      <option key={s._id || i} value={s.value || s.name || s}>
                        {s.value || s.name || s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Setting Profile
                  </label>
                  <select
                    value={variant.settingProfile || ""}
                    onChange={(e) => updateVariant(variant.id, "settingProfile", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none bg-white shadow-sm hover:border-emerald-300"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1.25rem"
                    }}
                  >
                    <option value="">Select Setting Profile</option>
                    {settingProfileResponse?.map((p, i) => (
                      <option key={p._id || i} value={p.value || p.name || p}>
                        {p.value || p.name || p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Band Type
                  </label>
                  <select
                    value={variant.bandType || ""}
                    onChange={(e) => updateVariant(variant.id, "bandType", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none bg-white shadow-sm hover:border-emerald-300"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1.25rem"
                    }}
                  >
                    <option value="">Select Band Type</option>
                    {bandTypeResponse?.map((b, i) => (
                      <option key={b._id || i} value={b.value || b.name || b}>
                        {b.value || b.name || b}
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
                    Variant Image
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
