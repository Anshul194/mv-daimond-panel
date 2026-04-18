import { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createProduct, fetchProductAttributes } from "../../store/slices/product";
import Sidebar from "./components/Sidebar";
import GeneralInfoSection from "./components/GeneralInfoSection";
import PriceSection from "./components/PriceSection";
import ImagesSection from "./components/ImagesSection";
import InventorySection from "./components/InventorySection";
import AttributesSection from "./components/AttributesSection";
import type { AppDispatch, RootState } from "../../store"; // <-- import your types
import DeliverySection from "./components/DeliverySection";
import PropertiesSection from "./components/Propertys";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Variant, ProductFormData } from "./types";

const ProductForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, success, productAttributes, productAttributesLoading } = useSelector(
    (state: RootState) => state.product
  );

  const [activeSection, setActiveSection] = useState("general");


  const [formData, setFormData] = useState<ProductFormData>({
    category_id: "",
    subcategory_id: "",
    name: "",
    slug: "",
    shortDescription: "",
    gender: "",
    description: "",
    regularPrice: "",
    salePrice: "",
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
    featured: "false",
  });

  const [propertys, setProperties] = useState<Record<string, any>>({});

  const updateFormData = useCallback((field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const updateProperties = useCallback((field: string, value: any) => {
    setProperties((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    if (formData.category_id) {
      dispatch(fetchProductAttributes(formData.category_id));
    }
  }, [formData.category_id, dispatch]);

  useEffect(() => {
    if (productAttributes && Array.isArray(productAttributes)) {
      productAttributes.forEach((property) => {
        if (property.title) {
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
      formDataToSend.append("subcategory_id", formData.subcategory_id || "");
      formDataToSend.append("subCategory_id", formData.subcategory_id || "");

      // Optional: Include category and subcategory names if needed by backend
      if (formData.categoryName) {
        formDataToSend.append("categoryName", formData.categoryName);
      }
      if (formData.subcategoryName) {
        formDataToSend.append("subcategoryName", formData.subcategoryName);
      }

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
      if (formData.stockStatus) {
        formDataToSend.append("stockStatus", formData.stockStatus);
      }
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

      // If vendor, set status to inactive
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user && (user.role === 'vendor' || user.type === 'vendor')) {
        formDataToSend.append('status', 'inactive');
      }

      // Featured flag
      formDataToSend.append("featured", formData.featured ? String(formData.featured) : "false");

      // Product attributes from AttributesSection
      if (formData.attributes && formData.attributes.length > 0) {
        formData.attributes.forEach((attr, idx) => {
          formDataToSend.append(`attributes[${idx}][name]`, attr.name);
          formDataToSend.append(`attributes[${idx}][value]`, attr.value);
        });
      }

      // Variants (if you have variants functionality)
      if (formData.variants && formData.variants.length > 0) {
        console.log("Adding variants to FormData:", formData.variants);
        formData.variants.forEach((variant: Variant, idx) => {
          formDataToSend.append(`item_size[${idx}]`, variant.size || "");
          formDataToSend.append(`item_color[${idx}]`, variant.color || "");
          formDataToSend.append(`item_shape[${idx}]`, variant.shape || "");
          formDataToSend.append(`item_carat[${idx}]`, variant.carat || "");
          // Stone and Stone Color
          formDataToSend.append(`item_stone[${idx}]`, (variant as any).stone || "");
          formDataToSend.append(`item_stone_color[${idx}]`, (variant as any).stoneColor || "");
          formDataToSend.append(`item_setting_style[${idx}]`, variant.settingStyle || "");
          formDataToSend.append(`item_setting_profile[${idx}]`, variant.settingProfile || "");
          formDataToSend.append(`item_band_type[${idx}]`, variant.bandType || "");
          formDataToSend.append(`item_additional_price[${idx}]`, variant.price || "0");
          formDataToSend.append(`item_sku[${idx}]`, variant.sku || "");
          formDataToSend.append(`item_extra_cost[${idx}]`, variant.extraCost || "0");
          formDataToSend.append(`item_stock_count[${idx}]`, variant.stockCount || "0");

          // Variant attributes
          if (variant.custom && variant.custom.length > 0) {
            variant.custom.forEach((attr: any, attrIdx: number) => {
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

          // Variant image
          if (variant.image) {
            formDataToSend.append(`item_image[${idx}]`, variant.image);
          }
          // Variant extended media
          if (variant.ringImages && variant.ringImages.length > 0) {
            variant.ringImages.forEach((img, imgIdx) => {
              if (img) formDataToSend.append(`item_ring_images[${idx}][${imgIdx}]`, img);
            });
          }
          if (variant.ringVideo360) {
            formDataToSend.append(`item_ring_video_360[${idx}]`, variant.ringVideo360);
          }
          if (variant.modelImage) {
            formDataToSend.append(`item_model_image[${idx}]`, variant.modelImage);
          }
          if (variant.modelVideo) {
            formDataToSend.append(`item_model_video[${idx}]`, variant.modelVideo);
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

      // Log FormData contents for debugging (optional)
      // FormData built below; variants are included when present.

      // Dispatch the action
      const res: any = await dispatch(createProduct(formDataToSend) as any).unwrap();

      // Show success message from API if present
      const successMessage =
        res?.body?.message || res?.message || res?.data?.message || (res?.data?.name ? `${res.data.name} created successfully!` : "Product created successfully!");
      toast.success(successMessage, { duration: 8000, position: "top-right" });

      // Reset form data after successful submission
      setFormData({
        name: "",
        slug: "",
        shortDescription: "",
        gender: "",
        description: "",
        category_id: "",
        categoryName: "",
        subcategory_id: "",
        subcategoryName: "",
        regularPrice: "",
        salePrice: "",
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
        featured: "false",
      });

      console.log("Product created, navigating to list...");
      setTimeout(() => navigate("/products/all", { replace: true }), 700);
    } catch (error) {
      console.error("Failed to create product:", error);
      const errMsg = typeof error === 'string' ? error : error?.message || error?.data?.message || "Failed to create product. Please try again.";
      toast.error(errMsg, { duration: 8000, position: "top-right" });
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
                {loading ? "Creating..." : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default ProductForm;
