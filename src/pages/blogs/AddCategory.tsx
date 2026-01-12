import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import toast, { Toaster } from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { createBlogCategory } from "../../store/slices/blogCategorySlice";
import { useNavigate } from "react-router";

export default function AddBlogCategory() {
  const navigate = useNavigate();
  const [category, setCategory] = useState({
    name: "",
    image: null as File | null,
  });

  const dispatch = useDispatch();
  const loading = useSelector((state: RootState) => state.blogCategory.loading);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setCategory({ ...category, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCategory({ ...category, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category.name) {
      toast.error("Category name is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", category.name);

    if (category.image) {
      formData.append("image", category.image); // <-- fixed here
    }

    try {
      await dispatch(createBlogCategory(formData) as any).unwrap();
      toast.success("Category created successfully! 🎉", {
        duration: 8000,
        position: "top-right",
      });
      setCategory({ name: "", image: null });
      navigate("/blog/category/list");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create category.", {
        duration: 8000,
        position: "top-right",
      });
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      <PageMeta
        title="Add Blog Category | TailAdmin"
        description="Add a new category page for TailAdmin"
      />
      <PageBreadcrumb pageTitle="Add Blog Category" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full ">
          <h3 className="mb-6 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Add New Blog Category
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Fields */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={category.name}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Enter category name"
                required
              />
            </div>

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
              {category.image && typeof category.image !== "string" && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(category.image)}
                    alt="Category Preview"
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
              {loading ? "Adding..." : "Add Category"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
