import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import {
  createSubCategory,
  fetchCourseCategories,
} from "../store/slices/courseCategorySlice";
import type { AppDispatch, RootState } from "../store";

export default function AddSubCategory() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading } = useSelector(
    (state: RootState) => state.courseCategory
  );

  const [subCategory, setSubCategory] = useState({
    name: "",
    description: "",
    status: "active",
    categoryId: "",
    image: null as File | null,
  });

  useEffect(() => {
    dispatch(fetchCourseCategories({}));
  }, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setSubCategory({ ...subCategory, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubCategory({ ...subCategory, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCategory.name) {
      toast.error("Subcategory name is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }
    if (!subCategory.description) {
      toast.error("Description is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }
    if (!subCategory.categoryId) {
      toast.error("Parent category is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    // Prepare FormData for image upload
    const formData = new FormData();
    formData.append("name", subCategory.name);
    formData.append("description", subCategory.description);
    formData.append("status", subCategory.status);
    formData.append("category", subCategory.categoryId);
    if (subCategory.image) {
      formData.append("image", subCategory.image);
    }

    try {
      await dispatch(createSubCategory(formData as any)).unwrap();
      toast.success("Subcategory created successfully! 🎉", {
        duration: 8000,
        position: "top-right",
      });
      setSubCategory({
        name: "",
        description: "",
        status: "active",
        categoryId: "",
        image: null,
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to create subcategory.", {
        duration: 8000,
        position: "top-right",
      });
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      <PageMeta
        title="Add SubCategory | TailAdmin"
        description="Add a new subcategory page for TailAdmin"
      />
      <PageBreadcrumb pageTitle="Add SubCategory" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full ">
          <h3 className="mb-6 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Add New SubCategory
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Parent Category Dropdown */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Parent Category <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={subCategory.categoryId}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                required
              >
                <option value="">Select Parent Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            {/* SubCategory Name */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                SubCategory Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={subCategory.name}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Enter subcategory name"
                required
              />
            </div>
            {/* Description */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={subCategory.description}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Enter subcategory description"
                required
                rows={4}
              />
            </div>
            {/* Status */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                name="status"
                value={subCategory.status}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {/* Image */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Image
              </label>
              <input
                type="file"
                name="image"
                onChange={handleImageChange}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {subCategory.image && typeof subCategory.image !== "string" && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(subCategory.image)}
                    alt="SubCategory Preview"
                    className="max-w-xs h-auto rounded"
                  />
                </div>
              )}
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="rounded bg-blue-600 px-6 py-2 text-white font-semibold hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add SubCategory"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
