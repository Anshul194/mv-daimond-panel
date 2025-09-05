import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { createColorCode } from "../../../store/slices/colorSlice";
import type { AppDispatch, RootState } from "../../../store/index";

export default function AddColor() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.color);

  const [color, setColor] = useState({
    name: "",
    colorCode: "#000000",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor({ ...color, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!color.name) {
      toast.error("Color name is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }
    if (!color.colorCode) {
      toast.error("Color code is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }
    try {
      await dispatch(
        createColorCode({ name: color.name, colorCode: color.colorCode })
      ).unwrap();
      toast.success("Color created successfully! 🎉", {
        duration: 8000,
        position: "top-right",
      });
      setColor({ name: "", colorCode: "#000000" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to create color.", {
        duration: 8000,
        position: "top-right",
      });
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      <PageMeta
        title="Add Color | TailAdmin"
        description="Add a new color page for TailAdmin"
      />
      <PageBreadcrumb pageTitle="Add Color" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full ">
          <h3 className="mb-6 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Add New Color
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Color Name */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Color Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={color.name}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Enter color name"
                required
              />
            </div>
            {/* Color Picker */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Color Code <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="colorCode"
                  value={color.colorCode}
                  onChange={handleChange}
                  className="w-12 h-12 p-0 border-0 bg-transparent"
                  required
                />
                <input
                  type="text"
                  name="colorCode"
                  value={color.colorCode}
                  onChange={handleChange}
                  className="w-32 rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder="#000000"
                  required
                />
              </div>
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="rounded bg-blue-600 px-6 py-2 text-white font-semibold hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Color"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
