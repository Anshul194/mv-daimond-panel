import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { useAppDispatch } from "../../hooks/redux";
import { createCollection, updateCollection } from "../../store/slices/collectionSlice";

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection?: any;
}

const CollectionModal: React.FC<CollectionModalProps> = ({
  isOpen,
  onClose,
  collection,
}) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    name: "",
    status: "active",
    order: 0,
    image: null as File | null,
  });
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (collection) {
      setFormData({
        name: collection.name || "",
        status: collection.status || "active",
        order: collection.order || 0,
        image: null,
      });
      setPreview(collection.image || null);
    } else {
      setFormData({
        name: "",
        status: "active",
        order: 0,
        image: null,
      });
      setPreview(null);
    }
  }, [collection, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("status", formData.status);
    data.append("order", formData.order.toString());
    if (formData.image) {
      data.append("image", formData.image);
    }

    if (collection) {
      await dispatch(updateCollection({ id: collection._id, formData: data }));
    } else {
      await dispatch(createCollection(data));
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">{collection ? "Edit" : "Add"} Collection</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Collection Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                required
                placeholder="e.g. READY-TO-SHIP"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Display Image *</label>
              <div className="space-y-3">
                {preview && (
                  <div className="relative group">
                    <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-600" />
                  </div>
                )}
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="collection-image"
                    accept="image/*"
                    required={!collection}
                  />
                  <label 
                    htmlFor="collection-image" 
                    className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.image ? formData.image.name : "Choose an image..."}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Order</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
              >
                {collection ? "Update Collection" : "Save Collection"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CollectionModal;
