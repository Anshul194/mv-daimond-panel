import React, { useEffect, useState } from "react";
import { X, Save } from "lucide-react";

interface InstagramReelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (id: string | undefined, data: any) => void;
    reel: any;
    isProcessing: boolean;
}

const InstagramReelModal: React.FC<InstagramReelModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    reel,
    isProcessing,
}) => {
    const [formData, setFormData] = useState({
        image: "",
        reelUrl: "",
        order: 0,
        status: "active",
    });

    useEffect(() => {
        if (reel) {
            setFormData({
                image: reel.image || "",
                reelUrl: reel.reelUrl || "",
                order: reel.order || 0,
                status: reel.status || "active",
            });
        } else {
            setFormData({
                image: "",
                reelUrl: "",
                order: 0,
                status: "active",
            });
        }
    }, [reel, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(reel?._id, formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg shadow-xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                    <h3 className="text-xl font-semibold">{reel ? "Edit Reel" : "Add New Reel"}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Image URL / Path</label>
                        <input
                            type="text"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-md dark:bg-gray-900 border-gray-700"
                            placeholder="/images/home-slide-one/one.webp"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Instagram Reel URL</label>
                        <input
                            type="text"
                            name="reelUrl"
                            value={formData.reelUrl}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-md dark:bg-gray-900 border-gray-700"
                            placeholder="https://www.instagram.com/reel/..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Display Order</label>
                            <input
                                type="number"
                                name="order"
                                value={formData.order}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md dark:bg-gray-900 border-gray-700"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-md dark:bg-gray-900 border-gray-700"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
                        >
                            {isProcessing ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {reel ? "Update Reel" : "Add Reel"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InstagramReelModal;
