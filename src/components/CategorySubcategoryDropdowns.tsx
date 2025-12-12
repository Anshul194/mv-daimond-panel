import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchCourseCategories,fetchsubCategoriesByCategory } from "../store/slices/courseCategorySlice";

interface SubCategory {
    _id: string;
    name: string;
    slug: string;
    categoryId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    isDeleted?: boolean;
}

interface CategorySubcategoryDropdownsProps {
    onCategoryChange?: (categoryId: string, categoryName: string) => void;
    onSubcategoryChange?: (subcategoryId: string, subcategoryName: string) => void;
    selectedCategoryId?: string;
    selectedSubcategoryId?: string;
    disabled?: boolean;
}

export default function CategorySubcategoryDropdowns({
    onCategoryChange,
    onSubcategoryChange,
    selectedCategoryId = "",
    selectedSubcategoryId = "",
    disabled = false
}: CategorySubcategoryDropdownsProps) {
    const dispatch = useAppDispatch();
    const { categories, loading: categoriesLoading, error } = useAppSelector((state) => state.courseCategory);
    const { subCategories, loading: subCategoriesLoading, error: subCategoriesError } = useAppSelector((state) => state.courseCategory);


    // Fetch categories on mount
    useEffect(() => {
        dispatch(fetchCourseCategories({
            page: 1,
            limit: 100,
            filters: {
                status: 'active'
            }
        }));
    }, [dispatch]);

    // Fetch subCategories when category changes
    useEffect(() => {
        if (selectedCategoryId) {
            dispatch(fetchsubCategoriesByCategory(selectedCategoryId));
        }
    }, [dispatch, selectedCategoryId]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const categoryId = e.target.value;
        const categoryName = categories.find(cat => cat._id === categoryId)?.name || '';

        // Reset subcategory when category changes
        if (onSubcategoryChange) {
            onSubcategoryChange('', '');
        }

        if (onCategoryChange) {
            onCategoryChange(categoryId, categoryName);
        }
    };

    const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const subcategoryId = e.target.value;
        const subcategoryName = subCategories.find(subcat => subcat._id === subcategoryId)?.name || '';

        if (onSubcategoryChange) {
            onSubcategoryChange(subcategoryId, subcategoryName);
        }
    };

    return (
        <div className="space-y-4">
            {/* Category Dropdown */}
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category <span className="text-red-500">*</span>
                </label>
                <select
                    value={selectedCategoryId}
                    onChange={handleCategoryChange}
                    disabled={disabled || categoriesLoading}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800"
                    required
                >
                    <option value="">
                        {categoriesLoading ? 'Loading categories...' : 'Select a category'}
                    </option>
                    {categories?.map((category) => (
                        <option key={category._id} value={category._id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        Error loading categories: {error}
                    </p>
                )}
            </div>

            {/* Subcategory Dropdown */}
            <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subcategory <span className="text-red-500">*</span>
                </label>
                <select
                    value={selectedSubcategoryId}
                    onChange={handleSubcategoryChange}
                    disabled={disabled || !selectedCategoryId || subCategoriesLoading}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800"
                    required
                >
                    <option value="">
                        {!selectedCategoryId 
                            ? 'Please select a category first' 
                            : subCategoriesLoading 
                            ? 'Loading subCategories...' 
                            : subCategories.length === 0 
                            ? 'No subCategories available'
                            : 'Select a subcategory'
                        }
                    </option>
                    {Array.isArray(subCategories) && subCategories?.length > 0 && subCategories.map((subcategory) => (
                        subcategory && subcategory._id && (
                            <option key={subcategory._id} value={subcategory._id}>
                                {subcategory.name ?? 'Unnamed Subcategory'}
                            </option>
                        )
                    ))}
                </select>
                {subCategoriesError && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        Error loading subCategories: {subCategoriesError}
                    </p>
                )}
            </div>
        </div>
    );
}
