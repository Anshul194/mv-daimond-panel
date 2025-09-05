import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import toast, { Toaster } from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import {
  createBlogCategory,
  fetchBlogCategories,
  getBlogCategoryById,
} from "../../store/slices/blogCategorySlice";
import { useParams } from "react-router";
import {
  getBlogSubcategoryById,
  updateBlogSubcategory,
} from "../../store/slices/blogSubcategorySlice";

const imageUrl = import.meta.env.VITE_IMAGE_URL;
export default function EditBlogSubCategory() {
  const [category, setCategory] = useState({
    name: "",
    mainCategory: "",
    image: null as File | null,
    status: "",
  });
  const { categories } = useSelector((state) => state.blogCategory);

  const params = useParams();
  const categoryId = params.id;
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

    if (category.image && category.image instanceof File) {
      formData.append("image", category.image); // <-- fixed here
    }
    formData.append("BlogCategory", category.mainCategory);
    formData.append("status", category.status || "active");

    try {
      await dispatch(
        updateBlogSubcategory({
          id: categoryId,
          subcategoryData: formData,
        }) as any
      ).unwrap();
      toast.success("Category created successfully! 🎉", {
        duration: 8000,
        position: "top-right",
      });
      setCategory({ name: "", image: null });
      window.location.href = "/blog/subcategory/list";
    } catch (err: any) {
      toast.error(err?.message || "Failed to create category.", {
        duration: 8000,
        position: "top-right",
      });
    }
  };
  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchBlogCategories());
    }
  }, []);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await dispatch(
          getBlogSubcategoryById({ id: categoryId }) as any
        ).unwrap();
        console.log("Fetched category data: ====>.data", response);
        setCategory({
          name: response.data.name,
          image: response.data.image,
          mainCategory: response.data.BlogCategory._id,
        });
      } catch (error) {
        console.error("Error fetching category data:", error);
      }
    };

    getData();
  }, [categories]);

  return (
    <div>
      <Toaster position="top-right" />
      <PageMeta
        title="Edit Blog Sub Category | TailAdmin"
        description="Edit an existing subcategory page for TailAdmin"
      />
      <PageBreadcrumb pageTitle="Edit Blog Sub Category" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full ">
          <h3 className="mb-6 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Edit Blog Sub Category
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
                Category Name <span className="text-red-500">*</span>
              </label>
              <select
                name="mainCategory"
                value={category.mainCategory}
                onChange={(e) => {
                  setCategory({
                    ...category,
                    mainCategory: e.target.value,
                  });
                }}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Enter category name"
                required
              >
                <option value="">Select a category</option>
                {categories &&
                  categories.length > 0 &&
                  categories.map((cat, index) => (
                    <option key={index} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
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
              {category.image && (
                <div className="mt-2">
                  <img
                    src={
                      typeof category.image === "string"
                        ? `${imageUrl}/${category.image}`
                        : category.image
                        ? URL.createObjectURL(category.image)
                        : undefined
                    }
                    alt="Category Preview"
                    className="max-w-xs h-auto rounded"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                name="status"
                value={category.status || "active"}
                onChange={(e) => {
                  setCategory({
                    ...category,
                    status: e.target.value,
                  });
                }}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="rounded bg-blue-600 px-6 py-2 text-white font-semibold hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Category"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
