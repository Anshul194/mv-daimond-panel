import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { createSize } from "../../../store/slices/sizeSlice";
import type { AppDispatch, RootState } from "../../../store/index";

export default function AddSize() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.size);

  const [size, setSize] = useState({
    name: "",
    size_code: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSize({ ...size, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!size.name) {
      toast.error("Size name is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }
    if (!size.size_code) {
      toast.error("Size code is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }
    try {
      await dispatch(createSize(size)).unwrap();
      toast.success("Size created successfully! 🎉", {
        duration: 8000,
        position: "top-right",
      });
      setSize({ name: "", size_code: "" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to create size.", {
        duration: 8000,
        position: "top-right",
      });
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      <PageMeta
        title="Add Size | TailAdmin"
        description="Add a new size page for TailAdmin"
      />
      <PageBreadcrumb pageTitle="Add Size" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full ">
          <h3 className="mb-6 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Add New Size
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Size Name */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Size Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={size.name}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Enter size name"
                required
              />
            </div>
            {/* Size Code */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Size Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="size_code"
                value={size.size_code}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Enter size code"
                required
              />
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="rounded bg-blue-600 px-6 py-2 text-white font-semibold hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Size"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
