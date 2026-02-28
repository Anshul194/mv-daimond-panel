import React, { useState, useCallback } from "react";
import { Upload, X, Star } from "lucide-react";

const baseUrl = import.meta.env.VITE_IMAGE_URL;
import { ProductFormData } from "../types";

interface ImagesSectionProps {
  formData: ProductFormData;
  updateFormData: (field: string, value: any) => void;
}

const ImagesSection: React.FC<ImagesSectionProps> = ({
  formData,
  updateFormData,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const newImages = Array.from(files).map((file: File) => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9),
        isFeatured: false,
      }));
      updateFormData("images", [...(formData.images || []), ...newImages]);
    },
    [formData.images, updateFormData]
  );

  const removeImage = useCallback(
    (imageId: string | number) => {
      const updatedImages = formData.images.filter((img) => img.id !== imageId);
      updateFormData("images", updatedImages);
    },
    [formData.images, updateFormData]
  );

  const setFeaturedImage = useCallback(
    (imageId: string | number) => {
      const updatedImages = formData.images.map((img) => ({
        ...img,
        isFeatured: img.id === imageId,
      }));
      updateFormData("images", updatedImages);
    },
    [formData.images, updateFormData]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const getUrlFromFile = (file: File): string => {
    console.log(`File URL: ${file}`);
    const fileUrl = URL.createObjectURL(file);
    return fileUrl;
  };

  const getFullImageUrl = (path: string): string => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    const cleanBase = baseUrl?.replace(/\/$/, '') || '';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  };

  return (
    <div className="max-w-4xl p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Product Images</h1>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
          ? "border-emerald-500 bg-emerald-50"
          : "border-gray-300 hover:border-gray-400"
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-600 mb-2">
          Drop images here or click to upload
        </p>
        <p className="text-gray-500 mb-4">
          Supports: JPG, PNG, WebP (Max 5MB each)
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 cursor-pointer transition-colors"
        >
          <Upload className="w-4 h-4 mr-2" />
          Choose Files
        </label>
      </div>

      {formData.images && formData.images.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Uploaded Images
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={
                    image?.file ? getUrlFromFile(image?.file) : (image?.existingUrl ? getFullImageUrl(image.existingUrl) : getFullImageUrl(image.preview))
                  }
                  alt="Product"
                  className="w-full z-99 h-32 object-cover rounded-lg border border-gray-200"
                />
                <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg">
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => setFeaturedImage(image.id)}
                      className={`p-1 rounded-full transition-opacity ${image.isFeatured
                        ? "bg-yellow-500 text-white opacity-100"
                        : "bg-white text-gray-600 opacity-0 group-hover:opacity-100"
                        }`}
                      title="Set as featured image"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeImage(image.id)}
                      className="p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {image.isFeatured && (
                  <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                    Featured
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagesSection;
