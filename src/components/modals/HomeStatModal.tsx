import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

interface HomeStat {
    _id?: string;
    label: string;
    value: number;
    suffix: string;
    float: boolean;
    order: number;
    status: "active" | "inactive";
}

interface HomeStatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (id: string | undefined, data: any) => Promise<void>;
    stat: HomeStat | null;
    isProcessing: boolean;
}

const HomeStatModal: React.FC<HomeStatModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    stat,
    isProcessing
}) => {
    const [formData, setFormData] = useState<HomeStat>({
        label: "",
        value: 0,
        suffix: "+",
        float: false,
        order: 0,
        status: "active",
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (isOpen && stat) {
            setFormData({
                label: stat.label || "",
                value: stat.value || 0,
                suffix: stat.suffix || "+",
                float: !!stat.float,
                order: stat.order || 0,
                status: stat.status || "active",
            });
            setErrors({});
        } else if (!isOpen) {
            setFormData({
                label: "",
                value: 0,
                suffix: "+",
                float: false,
                order: 0,
                status: "active",
            });
            setErrors({});
        }
    }, [isOpen, stat]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: name === "value" || name === "order" ? Number(val) : val,
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.label.trim()) newErrors.label = "Label is required";
        if (formData.value === undefined || formData.value === null) newErrors.value = "Value is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        await onConfirm(stat?._id, formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300"
                onClick={onClose}
            ></div>

            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {stat ? "Edit Statistic" : "Add Statistic"}
                        </h3>
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Label *
                            </label>
                            <input
                                type="text"
                                name="label"
                                value={formData.label}
                                onChange={handleInputChange}
                                disabled={isProcessing}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${errors.label ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'}`}
                                placeholder="e.g., Years of craft"
                            />
                            {errors.label && (
                                <p className="text-sm text-red-600 mt-1">{errors.label}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Value *
                                </label>
                                <input
                                    type="number"
                                    name="value"
                                    step={formData.float ? "0.1" : "1"}
                                    value={formData.value}
                                    onChange={handleInputChange}
                                    disabled={isProcessing}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${errors.value ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'}`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Suffix
                                </label>
                                <input
                                    type="text"
                                    name="suffix"
                                    value={formData.suffix}
                                    onChange={handleInputChange}
                                    disabled={isProcessing}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="e.g., +"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-6 py-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="float"
                                    checked={formData.float}
                                    onChange={(e) => setFormData(prev => ({ ...prev, float: e.target.checked }))}
                                    disabled={isProcessing}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Is Decimal?</span>
                            </label>

                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Order</label>
                                <input
                                    type="number"
                                    name="order"
                                    value={formData.order}
                                    onChange={handleInputChange}
                                    disabled={isProcessing}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                disabled={isProcessing}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </form>

                    <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isProcessing}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center gap-2 transition-colors"
                        >
                            {isProcessing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                            {stat ? "Update Statistic" : "Save Statistic"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeStatModal;
