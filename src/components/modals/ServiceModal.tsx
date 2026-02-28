import React, { useEffect, useState } from "react";
import { X, Upload } from "lucide-react";

interface ServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (id: string | undefined, data: any) => Promise<void>;
    service: any;
    isProcessing: boolean;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, onConfirm, service, isProcessing }) => {
    const [formData, setFormData] = useState({
        title: "",
        alt: "",
        link: "",
        status: "active",
        order: 0,
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");

    const BASE_URL = import.meta.env.VITE_IMAGE_URL || "http://localhost:3000";

    useEffect(() => {
        if (isOpen && service) {
            setFormData({
                title: service.title || "",
                alt: service.alt || "",
                link: service.link || "",
                status: service.status || "active",
                order: service.order || 0,
            });
            setImagePreview(service.image ? `${BASE_URL}${service.image}` : "");
            setImageFile(null);
        } else if (!isOpen) {
            setFormData({ title: "", alt: "", link: "", status: "active", order: 0 });
            setImagePreview("");
            setImageFile(null);
        }
    }, [isOpen, service]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageFile(file);
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, String(value));
        });
        if (imageFile) data.append("image", imageFile);
        onConfirm(service?._id, data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
            <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">{service ? "Edit Service" : "Add Service"}</h3>
                        <button onClick={onClose}><X /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm mb-1 font-medium">Title *</label>
                            <input name="title" value={formData.title} onChange={handleChange} required className="w-full p-2 border rounded dark:bg-gray-700" placeholder="e.g. SHOWROOMS" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1 font-medium">Image Alt Text</label>
                            <input name="alt" value={formData.alt} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" placeholder="Descriptive alt text for the image" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1 font-medium">Link URL</label>
                            <input name="link" value={formData.link} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" placeholder="/meet" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm mb-1 font-medium">Order</label>
                                <input type="number" name="order" value={formData.order} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" />
                            </div>
                            <div>
                                <label className="block text-sm mb-1 font-medium">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm mb-1 font-medium">Service Image {!service && "*"}</label>
                            <div className="flex flex-col gap-2">
                                {imagePreview && <img src={imagePreview} className="w-full h-40 object-cover rounded border" alt="preview" />}
                                <div className="relative">
                                    <input type="file" onChange={handleFileChange} className="hidden" id="service-image" accept="image/*" />
                                    <label htmlFor="service-image" className="flex items-center justify-center gap-2 w-full p-2 border border-dashed rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <Upload className="w-4 h-4" /> {imageFile ? imageFile.name : "Select Image"}
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
                            <button type="submit" disabled={isProcessing} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">
                                {isProcessing ? "Saving..." : "Save Service"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ServiceModal;
