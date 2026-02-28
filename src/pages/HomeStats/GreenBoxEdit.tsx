import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
    fetchGreenBoxContent,
    updateGreenBoxContent,
    resetHomePageState,
} from "../../store/slices/homePageSlice";
import toast from "react-hot-toast";
import { Save } from "lucide-react";

const GreenBoxEdit: React.FC = () => {
    const dispatch = useAppDispatch();
    const { content, loading, success } = useAppSelector((state) => state.homePage);
    const [formData, setFormData] = useState({
        eyebrow: "",
        headlineLine1: "",
        headlineLine2: "",
        description: "",
    });
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        dispatch(fetchGreenBoxContent());
    }, [dispatch]);

    useEffect(() => {
        if (content) {
            setFormData({
                eyebrow: content.eyebrow || "",
                headlineLine1: content.headlineLine1 || "",
                headlineLine2: content.headlineLine2 || "",
                description: content.description || "",
            });
        }
    }, [content]);

    useEffect(() => {
        if (success) {
            dispatch(resetHomePageState());
            setIsUpdating(false);
        }
    }, [success, dispatch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsUpdating(true);
        try {
            await dispatch(updateGreenBoxContent(formData)).unwrap();
            toast.success("Green Box content updated successfully");
        } catch (err: any) {
            toast.error(err || "Failed to update content");
            setIsUpdating(false);
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Green Box Section Content</h2>
                <button
                    onClick={handleSave}
                    disabled={isUpdating || loading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    {isUpdating ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Eyebrow Text</label>
                    <input
                        type="text"
                        name="eyebrow"
                        value={formData.eyebrow}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 dark:bg-gray-900 border-gray-700"
                        placeholder="e.g., Est. Since"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Headline Line 1</label>
                    <input
                        type="text"
                        name="headlineLine1"
                        value={formData.headlineLine1}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 dark:bg-gray-900 border-gray-700"
                        placeholder="e.g., Fine jewellery to feel good about,"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Headline Line 2 (Italic/Gold)</label>
                    <input
                        type="text"
                        name="headlineLine2"
                        value={formData.headlineLine2}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 dark:bg-gray-900 border-gray-700"
                        placeholder="e.g., made to love for a lifetime."
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 dark:bg-gray-900 border-gray-700"
                        placeholder="Enter the section description..."
                    />
                </div>
            </div>
        </div>
    );
};

export default GreenBoxEdit;
