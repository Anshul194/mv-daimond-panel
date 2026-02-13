import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createProduct, updateProduct, fetchProductAttributes } from "../../store/slices/product";
import Sidebar from "./components/Sidebar";
import GeneralInfoSection from "./components/GeneralInfoSection";
import PriceSection from "./components/PriceSection";
import ImagesSection from "./components/ImagesSection";
import InventorySection from "./components/InventorySection";
import AttributesSection from "./components/AttributesSection";
import type { AppDispatch, RootState } from "../../store"; // <-- import your types
import DeliverySection from "./components/DeliverySection";
import { useParams } from "react-router";
import axiosInstance from "../../services/axiosConfig";
import PropertiesSection from "./components/Propertys";

const EditProductForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams();
  const productId = params.id; // Assuming the product ID is passed as a URL parameter
  const { loading, error, success, productAttributes, productAttributesLoading } = useSelector(
    (state: RootState) => state.product
  );

  const [activeSection, setActiveSection] = useState("general");
  type Attribute = {
    name: string;
    value: string;
  };

  type Variant = {
    sizeId?: string;
    colorId?: string;
    additionalPrice?: string;
    extraCost?: string;
    stockCount?: string;
    attributes?: Attribute[];
    image?: File;
  };

  type Image = {
    file: File;
    [key: string]: any;
  };

  type ProductFormData = {
    category_id: string;
    subcategory_id: string;
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
    regularPrice: string;
    salePrice: string;
    sku: string;
    stockQuantity: string;
    lowStockThreshold: string;
    stockStatus: string;
    manageStock: string;
    images: Image[];
    variants: Variant[];
    attributes: Attribute[];
    categories: string[];
  };

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    regularPrice: "",
    salePrice: "",
    sku: "",
    gender: "",
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

  const [propertys, setProperties] = useState<any[]>({});

  const updateFormData = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const updateProperties = useCallback((field, value) => {
    setProperties((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const getData = async () => {
    try {
      const response = await axiosInstance(`/api/product/${productId}`);

      const data = response.data?.body?.data || response.data?.data || response.data;
      console.log("Fetched product data:", data);
      console.log("Stock status from API:", data?.inventory?.stock_status, data?.stockStatus);
      const variantData = data.inventory?.inventory_details.map((variant) => {
        return {
          size: variant.size || "",
          color: variant.color || "",
          price: variant.additional_price || "",
          extraCost: variant.add_cost || "",
          stockCount: variant.stock_count || "",
          custom: variant.attributes.map((attr) => ({
            name: attr.attribute_name || "",
            value: attr.attribute_value || "",
          })),
          image: variant.image || [],
          inventoryDetailsId: variant._id || "",
        };
      });

      setFormData({
        name: data.name || "",
        slug: data.slug || "",
        shortDescription: data.summary || "",
        description: data.description || "",
        regularPrice: data.price || "",
        gender: data.gender || "",
        salePrice: data.saleprice || "",
        sku: data?.inventory?.sku || "",
        stockQuantity: data?.inventory?.stock_count || "",
        lowStockThreshold: data?.inventory?.lowStockThreshold || "5",
        stockStatus: data?.inventory?.stock_status || data?.stockStatus || "in_stock",
        manageStock: data?.inventory?.manage_stock || data?.manageStock || "yes",
        images: data.image || [],
        variants: variantData || [],
        attributes: data.attributes || [],
        category_id: data.category_id._id,
        subcategory_id: data.subCategory_id?._id || "",
        tax: data.taxClass || "",
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
      productAttributes.forEach((property) => {
        if (property.title && !property.title.toLowerCase().includes("metal")) {
          setProperties((prev) => ({
            ...prev,
            [property.title]: prev[property.title] ?? "",
          }));
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
      formDataToSend.append("subCategory_id", formData.subcategory_id || ""); // Fixed: was subCategory_id

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
        formDataToSend.append("stockQuantity", formData.stockQuantity);
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

      formDataToSend.append("isTaxable", false);

      // Product attributes from AttributesSection
      if (formData.attributes && formData.attributes.length > 0) {
        formData.attributes.forEach((attr, idx) => {
          formDataToSend.append(`attributes[${idx}][name]`, attr.name);
          formDataToSend.append(`attributes[${idx}][value]`, attr.value);
        });
      }

      // Variants (if you have variants functionality)
      if (formData.variants && formData.variants.length > 0) {
        formData.variants.forEach((variant, idx) => {
          if (variant.size) {
            formDataToSend.append(`item_size[${idx}]`, variant.size);
          }
          if (variant.color) {
            formDataToSend.append(`item_color[${idx}]`, variant.color);
          }
          if (variant.additionalPrice) {
            formDataToSend.append(
              `item_additional_price[${idx}]`,
              variant.additionalPrice
            );
          }
          if (variant.sku) {
            formDataToSend.append(`item_sku[${idx}]`, variant.sku);
          }
          if (variant.image) {
            formDataToSend.append(`item_image[${idx}]`, variant.image);
          }
          console.log("Variant data being sent:", variant);
          if (variant.extraCost) {
            formDataToSend.append(`item_extra_cost[${idx}]`, variant.extraCost);
          }
          if (variant.stockCount) {
            formDataToSend.append(`item_stock_count[${idx}]`, variant.stock);
          }
          if (variant.inventoryDetailsId) {
            formDataToSend.append(
              `inventoryDetailsId[${idx}]`,
              variant.inventoryDetailsId
            );
          }

          // // Variant attributes
          // if (variant.custom && variant.custom.length > 0) {
          //   variant.custom.forEach((attr, attrIdx) => {
          //     formDataToSend.append(
          //       `item_attribute_name[${idx}][${attrIdx}]`,
          //       attr.name
          //     );
          //     formDataToSend.append(
          //       `item_attribute_value[${idx}][${attrIdx}]`,
          //       attr.value
          //     );
          //   });
          // }

          // Variant image
          if (variant.image) {
            formDataToSend.append(`item_image[${idx}]`, variant.image);
          }
        });
      }

      // Images from ImagesSection
      if (formData.images && formData.images.length > 0) {
        // Main/Featured image (first image or the one marked as featured)
        const featuredImage =
          formData.images.find((img) => img.isFeatured) || formData.images[0];
        if (featuredImage?.file) {
          formDataToSend.append("image", featuredImage.file);
        }

        // All images (optional - if backend supports multiple images)
        formData.images.forEach((image, idx) => {
          if (image.file) {
            formDataToSend.append(`images[${idx}]`, image.file);
            formDataToSend.append(
              `images_featured[${idx}]`,
              image.isFeatured ? "1" : "0"
            );
          }
        });
      }

      // Log FormData contents for debugging (optional)
      console.log("FormData contents:");
      console.log("Current formData.stockStatus:", formData.stockStatus);
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      const selectedProperties = {};

      Object.keys(propertys).forEach((key) => {
        if (propertys[key] !== "") {
          selectedProperties[key] = propertys[key];
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
            formData={formData}
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
        forEdit={true}
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
                  Product created successfully!
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
