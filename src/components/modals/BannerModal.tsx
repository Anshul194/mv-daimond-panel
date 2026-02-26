import React, { useEffect, useState } from "react";
import { X, Upload } from "lucide-react";

interface BannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (id: string | undefined, data: any) => Promise<void>;
    banner: any;
    isProcessing: boolean;
}

const BannerModal: React.FC<BannerModalProps> = ({ isOpen, onClose, onConfirm, banner, isProcessing }) => {
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        label: "",
        buttonPrimaryText: "",
        buttonPrimaryLink: "",
        buttonSecondaryText: "",
        buttonSecondaryLink: "",
        status: "active",
        order: 0,
        mobileButton1Text: "",
        mobileButton1Link: "",
        mobileButton2Text: "",
        mobileButton2Link: "",
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [rightImageFile, setRightImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [rightImagePreview, setRightImagePreview] = useState<string>("");

    useEffect(() => {
        if (isOpen && banner) {
            setFormData({
                title: banner.title || "",
                subtitle: banner.subtitle || "",
                label: banner.label || "",
                buttonPrimaryText: banner.buttonPrimaryText || "",
                buttonPrimaryLink: banner.buttonPrimaryLink || "",
                buttonSecondaryText: banner.buttonSecondaryText || "",
                buttonSecondaryLink: banner.buttonSecondaryLink || "",
                status: banner.status || "active",
                order: banner.order || 0,
                mobileButton1Text: banner.mobileButton1Text || "",
                mobileButton1Link: banner.mobileButton1Link || "",
                mobileButton2Text: banner.mobileButton2Text || "",
                mobileButton2Link: banner.mobileButton2Link || "",
            });
            setImagePreview(banner.image || "");
            setRightImagePreview(banner.rightImage || "");
            setImageFile(null);
            setRightImageFile(null);
        } else if (!isOpen) {
            setFormData({
                title: "",
                subtitle: "",
                label: "",
                buttonPrimaryText: "",
                buttonPrimaryLink: "",
                buttonSecondaryText: "",
                buttonSecondaryLink: "",
                status: "active",
                order: 0,
                mobileButton1Text: "",
                mobileButton1Link: "",
                mobileButton2Text: "",
                mobileButton2Link: "",
            });
            setImagePreview("");
            setRightImagePreview("");
            setImageFile(null);
            setRightImageFile(null);
        }
    }, [isOpen, banner]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'rightImage') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (field === 'image') {
                    setImageFile(file);
                    setImagePreview(reader.result as string);
                } else {
                    setRightImageFile(file);
                    setRightImagePreview(reader.result as string);
                }
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
        if (imageFile) data.append('image', imageFile);
        if (rightImageFile) data.append('rightImage', rightImageFile);

        onConfirm(banner?._id, data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">{banner ? "Edit Banner" : "Add Banner"}</h3>
                        <button onClick={onClose}><X /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm mb-1">Title *</label>
                            <input name="title" value={formData.title} onChange={handleChange} required className="w-full p-2 border rounded dark:bg-gray-700" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm mb-1">Subtitle</label>
                            <textarea name="subtitle" value={formData.subtitle} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" rows={2} />
                        </div>

                        {/* Image Upload Fields */}
                        <div>
                            <label className="block text-sm mb-1">Left Background Image *</label>
                            <div className="flex flex-col gap-2">
                                {imagePreview && <img src={imagePreview} className="w-full h-32 object-cover rounded border" alt="preview" />}
                                <div className="relative">
                                    <input type="file" onChange={(e) => handleFileChange(e, 'image')} className="hidden" id="banner-image" accept="image/*" />
                                    <label htmlFor="banner-image" className="flex items-center justify-center gap-2 w-full p-2 border border-dashed rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <Upload className="w-4 h-4" /> {imageFile ? imageFile.name : "Select Image"}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm mb-1">Right Background Image</label>
                            <div className="flex flex-col gap-2">
                                {rightImagePreview && <img src={rightImagePreview} className="w-full h-32 object-cover rounded border" alt="preview" />}
                                <div className="relative">
                                    <input type="file" onChange={(e) => handleFileChange(e, 'rightImage')} className="hidden" id="right-banner-image" accept="image/*" />
                                    <label htmlFor="right-banner-image" className="flex items-center justify-center gap-2 w-full p-2 border border-dashed rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <Upload className="w-4 h-4" /> {rightImageFile ? rightImageFile.name : "Select Image"}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm mb-1">Label (Badge)</label>
                            <input name="label" value={formData.label} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" placeholder="9,642 Trusted Reviews" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Order</label>
                            <input type="number" name="order" value={formData.order} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Primary Button Text</label>
                            <input name="buttonPrimaryText" value={formData.buttonPrimaryText} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Primary Button Link</label>
                            <input name="buttonPrimaryLink" value={formData.buttonPrimaryLink} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Secondary Button Text</label>
                            <input name="buttonSecondaryText" value={formData.buttonSecondaryText} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Secondary Button Link</label>
                            <input name="buttonSecondaryLink" value={formData.buttonSecondaryLink} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="col-span-2 border-t pt-4 mt-2">
                            <h4 className="text-md font-semibold mb-3">Mobile Overlay Buttons</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">Mobile Button 1 Text</label>
                                    <input name="mobileButton1Text" value={formData.mobileButton1Text} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" placeholder="e.g. JEWELRY" />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Mobile Button 1 Link</label>
                                    <input name="mobileButton1Link" value={formData.mobileButton1Link} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" placeholder="/shop-all-jewelry" />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Mobile Button 2 Text</label>
                                    <input name="mobileButton2Text" value={formData.mobileButton2Text} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Mobile Button 2 Link</label>
                                    <input name="mobileButton2Link" value={formData.mobileButton2Link} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700" />
                                </div>
                            </div>
                        </div>
                        <div className="col-span-2 flex justify-end gap-3 mt-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
                            <button type="submit" disabled={isProcessing} className="px-4 py-2 bg-indigo-600 text-white rounded">
                                {isProcessing ? "Processing..." : "Save Banner"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BannerModal;
