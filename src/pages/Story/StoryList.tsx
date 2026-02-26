import React, { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Video } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchStories, deleteStory, createStory as apiCreateStory, updateStory as apiUpdateStory } from "../../store/slices/storySlice";
import StoryModal from "../../components/modals/StoryModal";


const StoryList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { stories, loading } = useSelector((state: RootState) => state.stories);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStory, setSelectedStory] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        dispatch(fetchStories());
    }, [dispatch]);

    const handleAdd = () => {
        setSelectedStory(null);
        setIsModalOpen(true);
    };

    const handleEdit = (story: any) => {
        setSelectedStory(story);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this story? You won't be able to revert this!");

        if (confirmed) {
            dispatch(deleteStory(id));
        }
    };

    const handleConfirm = async (id: string | undefined, data: FormData) => {
        setIsProcessing(true);
        try {
            if (id) {
                await dispatch(apiUpdateStory({ id, formData: data })).unwrap();
            } else {
                await dispatch(apiCreateStory(data)).unwrap();
            }
            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Story operation failed:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Story Management</h2>
                <button
                    onClick={handleAdd}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
                >
                    <Plus className="w-4 h-4" /> Add Story
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-sm">
                        <tr>
                            <th className="p-4 font-semibold">Media</th>
                            <th className="p-4 font-semibold">Title</th>
                            <th className="p-4 font-semibold">Type</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
                        ) : stories.length === 0 ? (
                            <tr><td colSpan={5} className="p-4 text-center">No stories found</td></tr>
                        ) : (
                            stories.map((story) => (
                                <tr key={story._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-4">
                                        <div className="w-20 h-12 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                                            {story.mediaType === 'video' ? (
                                                <div className="flex flex-col items-center">
                                                    <Video className="w-4 h-4 text-gray-400" />
                                                    <span className="text-[8px] text-gray-400 uppercase">Video</span>
                                                </div>
                                            ) : (
                                                <img src={story.mediaUrl} className="w-full h-full object-cover" alt="" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">{story.title}</td>
                                    <td className="p-4 capitalize">{story.mediaType}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${story.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {story.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(story)} className="p-1 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(story._id!)} className="p-1 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <StoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirm}
                story={selectedStory}
                isProcessing={isProcessing}
            />
        </div>
    );
};

export default StoryList;
