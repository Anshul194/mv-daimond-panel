import React from "react";
import { ChevronRight } from "lucide-react";
import InputField from "./InputField ";
import TextareaField from "./TextareaField ";
import RichTextEditor from "./RichTextEditor";
import CategorySubcategoryDropdowns from "../../../components/CategorySubcategoryDropdowns"; // Adjust the import path to the actual component

interface GeneralInfoSectionProps {
  formData: {
    name?: string;
    slug?: string;
    shortDescription?: string;
    description?: string;
    category_id?: string;
    categoryName?: string;
    subcategory_id?: string;
    subcategoryName?: string;
    [key: string]: any;
  };
  updateFormData: (field: string, value: any) => void;
}

const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({
  formData,
  updateFormData,
}) => {
  const handleCategoryChange = (categoryId: string, categoryName: string) => {
    updateFormData("category_id", categoryId);
    updateFormData("categoryName", categoryName);
    // Reset subcategory when category changes
    updateFormData("subcategory_id", "");
    updateFormData("subcategoryName", "");
  };

  const handleSubcategoryChange = (
    subcategoryId: string,
    subcategoryName: string
  ) => {
    updateFormData("subcategory_id", subcategoryId);
    updateFormData("subcategoryName", subcategoryName);
  };

  return (
    <div className="max-w-4xl p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          General Information
        </h1>
        <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Category & Subcategory Dropdowns */}
        <CategorySubcategoryDropdowns
          selectedCategoryId={formData.category_id || ""}
          selectedSubcategoryId={formData.subcategory_id || ""}
          onCategoryChange={handleCategoryChange}
          onSubcategoryChange={handleSubcategoryChange}
        />

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender || ""}
            onChange={(e) => updateFormData("gender", e.target.value)}
            className="w-full px-4 py-3 opacity-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
          >
            <option value="">Select Gender</option>
            <option value="man">Man</option>
            <option value="woman">Woman</option>
            <option value="both">Both</option>
          </select>
        </div>
        <InputField
          label="Name"
          placeholder="Write product Name..."
          value={formData.name || ""}
          onChange={(e) => updateFormData("name", e.target.value)}
          required
        />

        <InputField
          label="Slug"
          placeholder="Write product slug..."
          value={formData.slug || ""}
          onChange={(e) => updateFormData("slug", e.target.value)}
        />

        <TextareaField
          label="Short Description"
          placeholder="Write Short Description"
          value={formData.shortDescription || ""}
          onChange={(e) => updateFormData("shortDescription", e.target.value)}
          rows={3}
        />

        <RichTextEditor
          label="Description"
          placeholder="Write detailed product description..."
          value={formData.description || ""}
          onChange={(e) => updateFormData("description", e.target.value)}
        />
      </div>
    </div>
  );
};

export default GeneralInfoSection;
