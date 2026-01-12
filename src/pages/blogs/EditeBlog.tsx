import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import toast, { Toaster } from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import {
  createBlogCategory,
  fetchBlogCategories,
} from "../../store/slices/blogCategorySlice";
import { createBlog, updateBlog } from "../../store/slices/blog";
import CustomEditor from "../../components/CustomEditor";
import axiosInstance from "../../services/axiosConfig";
import { useParams, useNavigate } from "react-router";

export default function EditBlog() {
  const navigate = useNavigate();
  const [blog, setBlog] = useState({
    title: "",
    description: "",
    blogCategory: "",
    subCategory: "",
    date: "",
    content: "",
    thumbnailImage: null as File | null,
    coverImage: null as File | null,
  });

  const dispatch = useDispatch();
  const loading = useSelector((state: RootState) => state.blog.loading);
  const { categories } = useSelector((state) => state.blogCategory);
  const [subCategory, setSubCategory] = useState([]);
  const params = useParams();
  const blogId = params.id;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setBlog({ ...blog, [e.target.name]: e.target.value });
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isCover: boolean
  ) => {
    if (e.target.files && e.target.files[0]) {
      if (isCover) {
        setBlog({ ...blog, coverImage: e.target.files[0] });
      } else {
        setBlog({ ...blog, thumbnailImage: e.target.files[0] });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!blog.title || blog.title.trim() === "") {
      toast.error("Blog title is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }
    if (!blog.content || blog.content.trim() === "") {
      toast.error("Blog content is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }
    if (!blog.blogCategory || blog.blogCategory === "") {
      toast.error("Blog category is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }
    if (!blog.subCategory || blog.subCategory === "") {
      toast.error("Blog sub-category is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }
    if (!blog.thumbnailImage && !blog.coverImage) {
      toast.error("At least one image is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }
    if (!blog.coverImage && blog.coverImage) {
      toast.error("Cover image is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", blog.title);
    formData.append("content", blog.content);

    formData.append("description", blog.description);
    formData.append("BlogCategory", blog.blogCategory);
    formData.append("BlogSubCategory", blog.subCategory);
    if (blog.thumbnailImage) {
      formData.append("thumbnailImage", blog.thumbnailImage);
    }
    if (blog.coverImage) {
      formData.append("coverImage", blog.coverImage);
    }

    formData.append("date", new Date().toISOString());
    try {
      await dispatch(
        updateBlog({ id: blogId, blogData: formData }) as any
      ).unwrap();
      toast.success("Blog updated successfully! 🎉", {
        duration: 8000,
        position: "top-right",
      });
      navigate("/blog/list");
      setBlog({
        title: "",
        description: "",
        blogCategory: "",
        subCategory: "",
        date: "",
        content: "",
        thumbnailImage: null as File | null,
        coverImage: null as File | null,
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to create blog.", {
        duration: 8000,
        position: "top-right",
      });
    }
  };

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const response = await axiosInstance.get(`/api/blog/${blogId}`);
        const blogData = response.data.body.data;
        console.log("Fetched blog data:", blogData);
        setBlog({
          title: blogData.title,
          description: blogData.description,
          blogCategory: blogData.BlogCategory._id,
          subCategory: blogData.BlogSubCategory._id,
          date: blogData.date,
          content: blogData.content,
          thumbnailImage: blogData.thumbnailImage || null, // Reset to null for new upload
          coverImage: blogData.coverImage || null, // Reset to null for new upload
        });
      } catch (error) {
        console.error("Error fetching blog data:", error);
        toast.error("Failed to fetch blog data.", {
          duration: 8000,
          position: "top-right",
        });
      }
    };

    fetchBlogData();

    if (!categories || categories.length === 0) {
      dispatch(fetchBlogCategories());
    }
  }, []);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/blog-subcategory/by-category/${blog.blogCategory}`
        );
        setSubCategory(response.data.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to fetch categories.", {
          duration: 8000,
          position: "top-right",
        });
      }
    };
    getData();
  }, [blog.blogCategory]);
  return (
    <div>
      <Toaster position="top-right" />
      <PageMeta
        title="Edit Blog | TailAdmin"
        description="Edit an existing blog page for TailAdmin"
      />
      <PageBreadcrumb pageTitle="Edit Blog" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full ">
          <h3 className="mb-6 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Edit Blog
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Fields */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Blog Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={blog.title}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Enter blog title"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Blog Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                name="description"
                value={blog.description}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Enter blog description"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Blog Content <span className="text-red-500">*</span>
              </label>
              <CustomEditor
                value={blog.content}
                onChange={(value) => setBlog({ ...blog, content: value })}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="blogCategory"
                value={blog.blogCategory}
                onChange={(e) => {
                  setBlog({
                    ...blog,
                    blogCategory: e.target.value,
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
                Sub Category <span className="text-red-500">*</span>
              </label>
              <select
                name="subCategory"
                value={blog.subCategory}
                onChange={(e) => {
                  setBlog({
                    ...blog,
                    subCategory: e.target.value,
                  });
                }}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Enter category name"
                required
              >
                <option value="">Select a Sub Category</option>
                {subCategory &&
                  subCategory.length > 0 &&
                  subCategory.map((cat, index) => (
                    <option key={index} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Thumbnail
              </label>
              <input
                type="file"
                name="image"
                onChange={(e) => handleImageChange(e, false)}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {blog.thumbnailImage &&
                typeof blog.thumbnailImage !== "string" && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(blog.thumbnailImage)}
                      alt="Blog Preview"
                      className="max-w-xs h-auto rounded"
                    />
                  </div>
                )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Cover
              </label>
              <input
                type="file"
                name="image"
                onChange={(e) => handleImageChange(e, true)}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {blog.coverImage && typeof blog.coverImage !== "string" && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(blog.coverImage)}
                    alt="Blog Preview"
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
              {loading ? "Updating..." : "Update Blog"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
