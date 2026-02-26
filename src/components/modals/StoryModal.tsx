import React, { useEffect, useState } from "react";
import { X, Upload, Video, Image as ImageIcon } from "lucide-react";

interface StoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (id: string | undefined, data: FormData) => Promise<void>;
    story: any;
    isProcessing: boolean;
}

const StoryModal: React.FC<StoryModalProps> = ({ isOpen, onClose, onConfirm, story, isProcessing }) => {
    const [formData, setFormData] = useState({
        title: "Your story, our craft.",
        mediaType: "video",
        status: "active",
    });

    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string>("");

    useEffect(() => {
        if (isOpen && story) {
            setFormData({
                title: story.title || "",
                mediaType: story.mediaType || "video",
                status: story.status || "active",
            });
            setMediaPreview(story.mediaUrl || "");
            setMediaFile(null);
        } else if (!isOpen) {
            setFormData({
                title: "Your story, our craft.",
                mediaType: "video",
                status: "active",
            });
            setMediaPreview("");
            setMediaFile(null);
        }
    }, [isOpen, story]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMediaFile(file);
            if (formData.mediaType === 'image') {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setMediaPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setMediaPreview(""); // Video preview is complex, just show file name
            }
        }
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, String(value));
        });
        if (mediaFile) data.append('media', mediaFile);

        onConfirm(story?._id, data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">{story ? "Edit Story" : "Add Story"}</h3>
                        <button onClick={onClose}><X /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm mb-1">Title (can use html tags for styling)</label>
                            <input name="title" value={formData.title} onChange={handleChange} required className="w-full p-2 border rounded dark:bg-gray-700" />
                        </div>

                        <div>
                            <label className="block text-sm mb-1">Media Type</label>
                            <select name="mediaType" value={formData.mediaType} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700">
                                <option value="video">Video</option>
                                <option value="image">Image</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm mb-1">Select {formData.mediaType}</label>
                            <div className="flex flex-col gap-2">
                                {formData.mediaType === 'image' && mediaPreview && (
                                    <div className="w-full h-40 rounded bg-gray-100 overflow-hidden mb-2">
                                        <img src={mediaPreview} className="w-full h-full object-cover" alt="preview" />
                                    </div>
                                )}
                                <div className="relative">
                                    <input type="file" onChange={handleFileChange} className="hidden" id="story-media" accept={formData.mediaType === 'video' ? 'video/*' : 'image/*'} />
                                    <label htmlFor="story-media" className="flex items-center justify-center gap-2 w-full p-2 border border-dashed rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <Upload className="w-4 h-4" /> {mediaFile ? mediaFile.name : `Select ${formData.mediaType}`}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm mb-1">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
                            <button type="submit" disabled={isProcessing} className="px-4 py-2 bg-indigo-600 text-white rounded transition hover:bg-indigo-700">
                                {isProcessing ? "Processing..." : "Save Story"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StoryModal;
