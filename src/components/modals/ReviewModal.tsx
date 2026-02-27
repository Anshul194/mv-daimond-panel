import React, { useState, useEffect } from "react";
import { X, Upload, Star } from "lucide-react";
import { useAppDispatch } from "../../hooks/redux";
import { createReview, updateReview } from "../../store/slices/reviewSlice";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review?: any;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  review,
}) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    rating: 5,
    comment: "",
    targetType: "website" as "product" | "website",
    product: "",
    isWebsiteReview: true,
    reviewerName: "",
    reviewerRelation: "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (review) {
      setFormData({
        rating: review.rating || 5,
        comment: review.comment || "",
        targetType: review.targetType || (review.product ? "product" : "website"),
        product: review.product?._id || review.product || "",
        isWebsiteReview: review.isWebsiteReview ?? !review.product,
        reviewerName: review.reviewerName || "",
        reviewerRelation: review.reviewerRelation || "",
      });
      setPreviews(review.images || []);
      setImageFiles([]);
    } else {
      setFormData({
        rating: 5,
        comment: "",
        targetType: "website",
        product: "",
        isWebsiteReview: true,
        reviewerName: "",
        reviewerRelation: "",
      });
      setPreviews([]);
      setImageFiles([]);
    }
  }, [review, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "targetType") {
      setFormData(prev => ({
        ...prev,
        targetType: value as "product" | "website",
        isWebsiteReview: value === "website"
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removePreview = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const data = new FormData();
      data.append("rating", formData.rating.toString());
      data.append("comment", formData.comment);
      data.append("targetType", formData.targetType);
      data.append("isWebsiteReview", formData.isWebsiteReview.toString());
      data.append("reviewerName", formData.reviewerName);
      data.append("reviewerRelation", formData.reviewerRelation);
      if (formData.product) data.append("product", formData.product);
      
      imageFiles.forEach(file => {
        data.append("images", file);
      });

      if (review) {
        await dispatch(updateReview({ id: review._id, formData: data }));
      } else {
        await dispatch(createReview(data));
      }
      onClose();
    } catch (error) {
      console.error("Failed to save review:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">{review ? "Edit" : "Add"} Review</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Reviewer Name</label>
                <input
                  type="text"
                  name="reviewerName"
                  value={formData.reviewerName || ""}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Rating (1-5)</label>
                <div className="flex items-center gap-1 h-[42px]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                      className="focus:outline-none"
                    >
                      <Star 
                        className={`w-6 h-6 ${star <= formData.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Target Type</label>
                <select
                  name="targetType"
                  value={formData.targetType}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                >
                  <option value="website">Website Review</option>
                  <option value="product">Product Review</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Relation (Optional)</label>
                <input
                  type="text"
                  name="reviewerRelation"
                  value={formData.reviewerRelation || ""}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  placeholder="e.g. Verified Customer"
                />
              </div>
            </div>

            {formData.targetType === "product" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Product ID *</label>
                <input
                  type="text"
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  required={formData.targetType === "product"}
                  placeholder="Enter Product ObjectId"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Comment *</label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                rows={4}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                required
                placeholder="Share your experience..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Images</label>
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  {previews.map((src, idx) => (
                    <div key={idx} className="relative group aspect-square">
                      <img src={src} alt="Preview" className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-600" />
                      <button 
                        type="button"
                        onClick={() => removePreview(idx)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="review-images"
                    accept="image/*"
                    multiple
                  />
                  <label 
                    htmlFor="review-images" 
                    className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Add more images...
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm flex items-center gap-2"
                disabled={isProcessing}
              >
                {isProcessing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                {review ? "Update Review" : "Save Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
