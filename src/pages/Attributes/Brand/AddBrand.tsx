import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { createBrand } from "../../../store/slices/brandslice";
import type { AppDispatch, RootState } from "../../../store/index";

export default function AddBrand() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.brand);

  const [brand, setBrand] = useState({
    name: "",
    title: "",
    description: "",
    logo: null as File | null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "logo" && files) {
      setBrand({ ...brand, logo: files[0] });
    } else {
      setBrand({ ...brand, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.name) {
      toast.error("Brand name is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }
    if (!brand.title) {
      toast.error("Brand title is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }
    if (!brand.logo) {
      toast.error("Brand logo is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }
    try {
      await dispatch(
        createBrand({
          name: brand.name,
          title: brand.title,
          description: brand.description,
          logo: brand.logo,
        })
      ).unwrap();
      toast.success("Brand created successfully! 🎉", {
        duration: 8000,
        position: "top-right",
      });
      setBrand({ name: "", title: "", description: "", logo: null });
    } catch (err: any) {
      console.log("Error creating brand:", err?.message);
      toast.error(err?.message || "Failed to create brand.", {
        duration: 8000,
        position: "top-right",
      });
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      <PageMeta
        title="Add Brand | TailAdmin"
        description="Add a new brand page for TailAdmin"
      />
      <PageBreadcrumb pageTitle="Add Brand" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full ">
          <h3 className="mb-6 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Add New Brand
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Brand Name */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Brand Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={brand.name}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Enter brand name"
                required
              />
            </div>
            {/* Brand Title */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Brand Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={brand.title}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Enter brand title"
                required
              />
            </div>
            {/* Brand Description */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                name="description"
                value={brand.description}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Enter brand description"
                rows={3}
              />
            </div>
            {/* Brand Logo */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Brand Logo <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="logo"
                accept="image/*"
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                required
              />
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="rounded bg-blue-600 px-6 py-2 text-white font-semibold hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Brand"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
