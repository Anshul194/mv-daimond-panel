import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { updateProduct, fetchProductAttributes } from "../../store/slices/product";
import Sidebar from "./components/Sidebar";
import GeneralInfoSection from "./components/GeneralInfoSection";
import PriceSection from "./components/PriceSection";
import ImagesSection from "./components/ImagesSection";
import InventorySection from "./components/InventorySection";
import AttributesSection from "./components/AttributesSection";
import DeliverySection from "./components/DeliverySection";
import type { AppDispatch, RootState } from "../../store";
import axiosInstance from "../../services/axiosConfig";
import PropertiesSection from "./components/Propertys";
import { Variant, ImageType, Attribute, ProductFormData } from "./types";

const EditProductForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams();
  const productId = params.id; // Assuming the product ID is passed as a URL parameter
  const { loading, error, success, productAttributes, productAttributesLoading } = useSelector(
    (state: RootState) => state.product
  );

  const [activeSection, setActiveSection] = useState("general");
  // Types moved to types.ts

  const [formData, setFormData] = useState<ProductFormData>({
    category_id: "",
    subcategory_id: "",
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    regularPrice: "",
    salePrice: "",
    gender: "",
    sku: "",
    stockQuantity: "",
    lowStockThreshold: "5",
    stockStatus: "in_stock",
    manageStock: "yes",
    images: [],
    variants: [],
    attributes: [],
    categories: [],
    tax: "",
  });

  const [propertys, setProperties] = useState<Record<string, any>>({});

  const updateFormData = useCallback((field: string, value: any) => {
    console.log(`[DEBUG] updateFormData: field=${field}`, value);
    setFormData((prev) => {
      const newState = {
        ...prev,
        [field]: value,
      };
      console.log("[DEBUG] New state variants count:", (newState as any).variants?.length);
      return newState;
    });
  }, []);

  const updateProperties = useCallback((field: string, value: any) => {
    setProperties((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const getData = async () => {
    try {
      const response = await axiosInstance.get(`/api/product/${productId}?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache',
        },
      });

      const data = response.data?.body?.data || response.data?.data || response.data;
      console.log("Fetched product data:", data);
      console.log("Stock status from API:", data?.inventory?.stock_status, data?.stockStatus);
      const rawVariants = (data.variants && data.variants.length > 0) ? data.variants : (data.inventory?.inventory_details || []);
      console.log("Raw variants data to map:", rawVariants);

      const variantData = rawVariants.map((variant: any, index: number) => {
        // Handle shape and carat mapping from either root variant properties or attributes array
        // Use a case-insensitive search for attribute names
        const getAttrValue = (name: string) => {
          const attr = (variant.attributes || []).find((a: any) =>
            (a.attribute_name || a.name || "").toLowerCase() === name.toLowerCase()
          );
          return attr?.attribute_value || attr?.value || "";
        };

        const shape = variant.shape || getAttrValue("shape");
        const carat = variant.carat || getAttrValue("carat");


        const variantId = variant._id || variant.id || variant.inventoryDetailsId;
        console.log(`[DEBUG] Variant Index: ${index}, ID: ${variantId}, Shape: ${shape}, Carat: ${carat}`);

        return {
          id: variantId || `stable-${productId}-${index}`, // Stable ID based on product and index
          size: variant.size?._id || variant.size || "",
          color: variant.color?._id || variant.color || "",
          shape: shape,
          carat: carat,
          price: String(variant.price || variant.additional_price || variant.add_price || "0"),
          extraCost: String(variant.extra_cost || variant.add_cost || variant.extraCost || "0"),
          stockCount: String(variant.stock_count || variant.stockCount || variant.stock || "0"),
          sku: variant.sku || "",
          custom: (variant.attributes || [])
            .filter((attr: any) => {
              const name = (attr.attribute_name || attr.name || "").toLowerCase();
              return name !== "shape" && name !== "carat" && !name.includes("metal");
            })
            .map((attr: any) => ({
              name: attr.attribute_name || attr.name || "",
              value: attr.attribute_value || attr.value || "",
            })),
          image: variant.image || null,
          // CRITICAL: Ensure inventoryDetailsId is only set if it's a real DB ID (not stable- or new-)
          inventoryDetailsId: (variantId && !variantId.toString().startsWith("new-") && !variantId.toString().startsWith("stable-")) ? variantId : "",
        } as Variant;
      });

      setFormData({
        category_id: data.category_id?._id || data.category_id || "",
        subcategory_id: data.subCategory_id?._id || data.subCategory_id || data.subcategory_id || "",
        name: data.name || "",
        slug: data.slug || "",
        shortDescription: data.summary || data.shortDescription || "",
        description: data.description || "",
        regularPrice: data.price || "",
        salePrice: data.saleprice || data.salePrice || "",
        gender: data.gender || "",
        sku: data.sku || data?.inventory?.sku || "",
        stockQuantity: data.stock_count || data.stockCount || data?.inventory?.stock_count || "",
        lowStockThreshold: data.low_stock_threshold || data.lowStockThreshold || data?.inventory?.lowStockThreshold || "5",
        stockStatus: data.stock_status || data.stockStatus || data?.inventory?.stock_status || "in_stock",
        manageStock: data.manage_stock || data.manageStock || data?.inventory?.manage_stock || "yes",
        images: (data.image || data.images || []).map((imgUrl: string, idx: number) => ({
          id: `existing-${idx}-${Date.now()}`,
          preview: imgUrl,
          existingUrl: imgUrl,
          isFeatured: idx === 0,
        })),
        variants: variantData || [],
        attributes: data.attributes || [],
        categories: data.categories || [],
        tax: data.taxClass || data.tax || "",
      });
      console.log("Form data after fetching:", formData);
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  };

  useEffect(() => {
    getData();
  }, [productId]);

  // Fetch product attributes when category_id changes
  useEffect(() => {
    if (formData.category_id) {
      dispatch(fetchProductAttributes(formData.category_id));
    }
  }, [formData.category_id, dispatch]);

  useEffect(() => {
    if (productAttributes && Array.isArray(productAttributes)) {
      productAttributes.forEach((property: any) => {
        if (property.title && !property.title.toLowerCase().includes("metal")) {
          const title = property.title as string;
          if (propertys[title] === undefined) {
            setProperties((prev) => ({
              ...prev,
              [title]: prev[title] ?? "",
            }));
          }
        }
      });
    }
  }, [productAttributes]);

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();

      console.log("Submitting product with data:", formData);

      // Basic fields from GeneralInfoSection
      formDataToSend.append("name", formData.name || "");
      formDataToSend.append("slug", formData.slug || "");
      formDataToSend.append("summary", formData.shortDescription || "");
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append(
        "gender",
        formData.gender === "" ? "both" : formData.gender
      );
      // Category and Subcategory from GeneralInfoSection
      formDataToSend.append("category_id", formData.category_id || "");
      formDataToSend.append("subcategory_id", formData.subcategory_id || "");
      formDataToSend.append("subCategory_id", formData.subcategory_id || ""); // Backend compatibility

      // Optional: Include category and subcategory names if needed by backend
      // if (formData.categoryName) {
      //   formDataToSend.append("categoryName", formData.categoryName);
      // }
      // if (formData.subcategoryName) {
      //   formDataToSend.append("subcategoryName", formData.subcategoryName);
      // }

      // Price fields (if you have PriceSection)
      if (formData.regularPrice) {
        formDataToSend.append("price", formData.regularPrice);
      }
      if (formData.salePrice) {
        formDataToSend.append("saleprice", formData.salePrice);
      }

      // Inventory fields (if you have InventorySection)
      if (formData.sku) {
        formDataToSend.append("sku", formData.sku);
      }
      if (formData.stockQuantity) {
        formDataToSend.append("quantity", formData.stockQuantity);
      }
      if (formData.lowStockThreshold) {
        formDataToSend.append("lowStockThreshold", formData.lowStockThreshold);
      }
      // Always send stockStatus, even if it's empty or undefined
      formDataToSend.append("stockStatus", formData.stockStatus || "in_stock");
      if (formData.manageStock) {
        formDataToSend.append("manageStock", formData.manageStock);
      }
      // if (formData.tax && formData.tax !== "") {
      //   formDataToSend.append("taxClass", formData.tax);
      // }
      // if (formData.tax && formData.tax !== "") {
      //   formDataToSend.append("isTaxable", true);
      // }

      formDataToSend.append("isTaxable", "false");

      // Product attributes from AttributesSection
      if (formData.attributes && formData.attributes.length > 0) {
        formData.attributes.forEach((attr: Attribute, idx: number) => {
          formDataToSend.append(`attributes[${idx}][name]`, attr.name);
          formDataToSend.append(`attributes[${idx}][value]`, attr.value);
        });
      }

      // Variants (if you have variants functionality)
      if (formData.variants && formData.variants.length > 0) {
        console.log("Adding variants to FormData:", formData.variants);
        formData.variants.forEach((variant: Variant, idx: number) => {
          // Send all fields even if they are empty strings to ensure index sync with backend
          formDataToSend.append(`item_size[${idx}]`, variant.size || "");
          formDataToSend.append(`item_color[${idx}]`, variant.color || "");
          formDataToSend.append(`item_additional_price[${idx}]`, variant.price || "0");
          formDataToSend.append(`item_sku[${idx}]`, variant.sku || "");
          formDataToSend.append(`item_shape[${idx}]`, variant.shape || "");
          formDataToSend.append(`item_carat[${idx}]`, variant.carat || "");
          formDataToSend.append(`item_extra_cost[${idx}]`, variant.extraCost || "0");
          formDataToSend.append(`item_stock_count[${idx}]`, variant.stockCount || "0");
          formDataToSend.append(`inventoryDetailsId[${idx}]`, variant.inventoryDetailsId || "");

          console.log(`Appending variant ${idx} fields to FormData (for index sync)`);

          // Variant custom attributes - filter out Shape, Carat, and Metal Type
          if (variant.custom && variant.custom.length > 0) {
            variant.custom
              .filter((attr: any) => {
                const name = (attr.name || "").toLowerCase();
                return name !== "shape" && name !== "carat" && !name.includes("metal");
              })
              .forEach((attr, attrIdx) => {
                formDataToSend.append(
                  `item_attribute_name[${idx}][${attrIdx}]`,
                  attr.name
                );
                formDataToSend.append(
                  `item_attribute_value[${idx}][${attrIdx}]`,
                  attr.value
                );
              });
          }

          // Variant image - only send if it's a new file upload
          if (variant.image && variant.image instanceof File) {
            formDataToSend.append(`item_image[${idx}]`, variant.image);
          } else if (typeof variant.image === "string") {
            // If it's a string, it's an existing image URL, backend should handle it if passed
            formDataToSend.append(`item_image[${idx}]`, variant.image);
          }
        });
      }

      // Images from ImagesSection
      if (formData.images && formData.images.length > 0) {
        // Main/Featured image handling (handled via images array below)

        let hasExisting = false;

        let newImageIdx = 0;

        // All images
        formData.images.forEach((image) => {
          if (image.file) {
            formDataToSend.append(`images[${newImageIdx}]`, image.file);
            formDataToSend.append(
              `images_featured[${newImageIdx}]`,
              image.isFeatured ? "1" : "0"
            );
            newImageIdx++;
          } else if (image.existingUrl) {
            formDataToSend.append(`existingImages`, image.existingUrl);
            hasExisting = true;
          }
        });

        if (!hasExisting) {
          formDataToSend.append('existingImages', '[]');
        }
      } else {
        // All images removed
        formDataToSend.append('existingImages', '[]');
      }

      // Log FormData contents for debugging (optional)
      console.log("FormData contents:");
      console.log("Current formData.stockStatus:", formData.stockStatus);
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      const selectedProperties: Record<string, any> = {};

      Object.keys(propertys).forEach((key) => {
        if ((propertys as any)[key] !== "") {
          selectedProperties[key] = (propertys as any)[key];
        }
      });

      // Add properties to FormData
      if (Object.keys(selectedProperties).length > 0) {
        formDataToSend.append("properties", JSON.stringify(selectedProperties));
      }

      // Dispatch the action
      const updateResponse = await dispatch(
        updateProduct({ productId: productId, data: formDataToSend })
      ).unwrap();

      console.log("Update response:", updateResponse);

      // Small delay to ensure MongoDB write is fully committed
      await new Promise(resolve => setTimeout(resolve, 300));

      // Refetch the updated product data to sync UI with server
      await getData();

      alert("Product updated successfully!");
    } catch (error) {
      console.log("Error updating product:", error);
      console.error("Failed to update product:", error);
      alert("Failed to update product. Please try again.");
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return (
          <GeneralInfoSection
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case "price":
        return (
          <PriceSection formData={formData} updateFormData={updateFormData} />
        );
      case "images":
        return (
          <ImagesSection formData={formData} updateFormData={updateFormData} />
        );
      case "properties":
        return (
          <PropertiesSection
            formData={formData}
            propertys={propertys}
            productAttributes={productAttributes}
            updateFormData={updateProperties}
          />
        );
      case "inventory":
        return (
          <InventorySection
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case "attributes":
        return (
          <AttributesSection
            formData={formData as any}
            updateFormData={updateFormData}
          />
        );
      case "delivery":
        return (
          <DeliverySection
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      default:
        return (
          <GeneralInfoSection
            formData={formData}
            updateFormData={updateFormData}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <div className="flex-1 overflow-y-auto">
        {renderSection()}

        {/* Fixed Action Bar */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between ">
            <div className="flex items-center space-x-4">
              {error && <span className="text-red-600 text-sm">{error}</span>}
              {success && (
                <span className="text-blue-600 text-sm">
                  Product updated successfully!
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Save Draft
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Updating..." : "Update Product"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductForm;
