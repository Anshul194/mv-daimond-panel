import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
    updateInstagramHeader,
} from "../../store/slices/instagramSlice";
import toast from "react-hot-toast";
import { Save } from "lucide-react";

const InstagramHeaderEdit: React.FC = () => {
    const dispatch = useAppDispatch();
    const { header, loading } = useAppSelector((state) => state.instagram);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
    });
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (header) {
            setFormData({
                title: header.title || "",
                description: header.description || "",
            });
        }
    }, [header]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsUpdating(true);
        try {
            await dispatch(updateInstagramHeader(formData)).unwrap();
            toast.success("Instagram header updated successfully");
        } catch (err: any) {
            toast.error(err || "Failed to update header");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Instagram Section Header</h2>
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

            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Section Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 dark:bg-gray-900 border-gray-700"
                        placeholder="e.g., Instagram"
                    />
                </div>
                <div>
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

export default InstagramHeaderEdit;
