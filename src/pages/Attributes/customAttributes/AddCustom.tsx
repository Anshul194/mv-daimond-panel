import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { createCustomAttribute } from "../../../store/slices/customAttributes";
import { fetchCourseCategories } from "../../../store/slices/courseCategorySlice";
import type { AppDispatch, RootState } from "../../../store/index";
import { useNavigate } from "react-router";

interface TermInput {
  value: string;
  image: File | null;
}

export default function AddCustomAttribute() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading: attributeLoading } = useSelector(
    (state: RootState) => state.customAttributes
  );
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state: RootState) => state.courseCategory);

  const [title, setTitle] = useState("");
  const [terms, setTerms] = useState<TermInput[]>([{ value: "", image: null }]);
  const [categoryId, setCategoryId] = useState("");

  // Fetch course categories on component mount
  useEffect(() => {
    dispatch(fetchCourseCategories({ page: 1, limit: 100 }));
  }, [dispatch]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryId(e.target.value);
  };

  const handleTermChange = (
    idx: number,
    field: "value" | "image",
    value: string | File | null
  ) => {
    setTerms((terms) =>
      terms.map((term, i) => (i === idx ? { ...term, [field]: value } : term))
    );
  };

  const addTerm = () => {
    setTerms([...terms, { value: "", image: null }]);
  };

  const removeTerm = (idx: number) => {
    setTerms((terms) => terms.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Attribute title is required.", {
        duration: 4000,
        position: "top-right",
        style: {
          background: '#EF4444',
          color: '#fff',
          zIndex: 9999,
          minWidth: '300px',
          fontSize: '14px',
          padding: '16px',
        },
      });
      return;
    }
    if (terms.some((term) => !term.value.trim())) {
      toast.error("All term values are required.", {
        duration: 4000,
        position: "top-right",
        style: {
          background: '#EF4444',
          color: '#fff',
          zIndex: 9999,
          minWidth: '300px',
          fontSize: '14px',
          padding: '16px',
        },
      });
      return;
    }
    if (terms.some((term) => !term.image)) {
      toast.error("All term images are required.", {
        duration: 4000,
        position: "top-right",
        style: {
          background: '#EF4444',
          color: '#fff',
          zIndex: 9999,
          minWidth: '300px',
          fontSize: '14px',
          padding: '16px',
        },
      });
      return;
    }
    try {
      await dispatch(
        createCustomAttribute({
          title,
          category_id: categoryId,
          terms: terms.map((term) => ({
            value: term.value,
            image: term.image as File,
          })),
        })
      ).unwrap();
      toast.success("Custom attribute created successfully! 🎉", {
        duration: 4000,
        position: "top-right",
        style: {
          background: '#10B981',
          color: '#fff',
          zIndex: 9999,
          fontSize: '14px',
          padding: '16px',
        },
      });
      setTitle("");
      setTerms([{ value: "", image: null }]);
      setCategoryId("");
      navigate("/attributes/customs/list");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create custom attribute.", {
        duration: 4000,
        position: "top-right",
        style: {
          background: '#EF4444',
          color: '#fff',
          zIndex: 9999,
          minWidth: '300px',
          fontSize: '14px',
          padding: '16px',
        },
      });
    }
  };

  // Show error toast if category fetch fails
  useEffect(() => {
    if (categoriesError) {
      toast.error(categoriesError, { 
        duration: 4000, 
        position: "top-right",
        style: {
          background: '#EF4444',
          color: '#fff',
          zIndex: 9999,
          minWidth: '300px',
          fontSize: '14px',
          padding: '16px',
        },
      });
    }
  }, [categoriesError]);

  return (
    <div>
      <Toaster 
        position="top-right"
        containerStyle={{
          top: 80,
          zIndex: 9999,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#10B981',
            color: '#fff',
            zIndex: 9999,
            minWidth: '300px',
            fontSize: '14px',
            padding: '16px',
          },
          success: {
            duration: 4000,
            style: {
              background: '#10B981',
              color: '#fff',
              zIndex: 9999,
              minWidth: '300px',
              fontSize: '14px',
              padding: '16px',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#EF4444',
              color: '#fff',
              zIndex: 9999,
              minWidth: '300px',
              fontSize: '14px',
              padding: '16px',
            },
          },
        }}
      />
      <PageMeta
        title="Add Custom Attribute | TailAdmin"
        description="Add a new custom attribute page for TailAdmin"
      />
      <PageBreadcrumb pageTitle="Add Custom Attribute" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full">
          <h3 className="mb-6 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Add New Custom Attribute
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Attribute Title */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Attribute Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={title}
                onChange={handleTitleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Enter attribute title"
                required
              />
            </div>
            {/* Category Dropdown */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Course Category
              </label>
              <select
                value={categoryId}
                onChange={handleCategoryChange}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                disabled={categoriesLoading}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categoriesLoading && (
                <p className="text-sm text-gray-500">Loading categories...</p>
              )}
            </div>
            {/* Terms */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Terms <span className="text-red-500">*</span>
              </label>
              {terms.map((term, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={term.value}
                    onChange={(e) =>
                      handleTermChange(idx, "value", e.target.value)
                    }
                    className="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="Term value"
                    required
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleTermChange(
                        idx,
                        "image",
                        e.target.files?.[0] || null
                      )
                    }
                    className="flex-1"
                    required
                  />
                  {terms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTerm(idx)}
                      className="text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTerm}
                className="mt-2 rounded bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                Add Term
              </button>
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="rounded bg-blue-600 px-6 py-2 text-white font-semibold hover:bg-blue-700 transition"
              disabled={attributeLoading || categoriesLoading}
            >
              {attributeLoading ? "Adding..." : "Add Attribute"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
