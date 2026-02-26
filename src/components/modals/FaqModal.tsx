import React, { useEffect, useState } from "react";
import { X, AlertCircle } from "lucide-react";

interface Faq {
    _id?: string;
    title: string;
    description: string;
    status: "active" | "inactive";
}

interface FaqModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (id: string | undefined, data: any) => Promise<void>;
    faq: Faq | null;
    isProcessing: boolean;
}

const FaqModal: React.FC<FaqModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    faq,
    isProcessing
}) => {
    const [formData, setFormData] = useState<Faq>({
        title: "",
        description: "",
        status: "active",
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (isOpen && faq) {
            setFormData({
                title: faq.title || "",
                description: faq.description || "",
                status: faq.status || "active",
            });
            setErrors({});
        } else if (!isOpen) {
            setFormData({
                title: "",
                description: "",
                status: "active",
            });
            setErrors({});
        }
    }, [isOpen, faq]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
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
        if (!formData.title.trim()) newErrors.title = "Question is required";
        if (!formData.description.trim()) newErrors.description = "Answer is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        await onConfirm(faq?._id, formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 overflow-y-auto">
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300"
                onClick={onClose}
            ></div>

            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-xl w-full">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {faq ? "Edit FAQ" : "Add FAQ"}
                        </h3>
                        <button
                            onClick={onClose}
                            disabled={isProcessing}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Question *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                disabled={isProcessing}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${errors.title ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                placeholder="Enter question"
                            />
                            {errors.title && (
                                <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Answer *
                            </label>
                            <textarea
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleInputChange}
                                disabled={isProcessing}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white ${errors.description ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                                    }`}
                                placeholder="Enter answer"
                            />
                            {errors.description && (
                                <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                            )}
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
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isProcessing}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center gap-2"
                        >
                            {isProcessing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                            {faq ? "Update FAQ" : "Save FAQ"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaqModal;
