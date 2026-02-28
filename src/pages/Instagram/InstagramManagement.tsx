import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
    fetchInstagramData,
    addInstagramReel,
    updateInstagramReel,
    deleteInstagramReel,
} from "../../store/slices/instagramSlice";
import {
    Pencil,
    Trash2,
    CheckCircle,
    XCircle,
    Plus,
    AlertTriangle,
    Instagram,
} from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import toast from "react-hot-toast";
import InstagramReelModal from "./InstagramReelModal";
import InstagramHeaderEdit from "./InstagramHeaderEdit";

const InstagramManagement: React.FC = () => {
    const dispatch = useAppDispatch();
    const { reels, loading } = useAppSelector((state) => state.instagram);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedReel, setSelectedReel] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [reelToDelete, setReelToDelete] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchInstagramData());
    }, [dispatch]);

    const handleOpenModal = (reel: any = null) => {
        setSelectedReel(reel);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedReel(null);
        setModalOpen(false);
    };

    const handleSubmit = async (id: string | undefined, data: any) => {
        setIsProcessing(true);
        try {
            if (id) {
                await dispatch(updateInstagramReel({ id, data })).unwrap();
                toast.success("Reel updated successfully");
            } else {
                await dispatch(addInstagramReel(data)).unwrap();
                toast.success("Reel added successfully");
            }
            handleCloseModal();
        } catch (err: any) {
            toast.error(err || "An error occurred");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!reelToDelete) return;
        setIsProcessing(true);
        try {
            await dispatch(deleteInstagramReel(reelToDelete._id)).unwrap();
            toast.success("Reel deleted successfully");
            setDeleteConfirmOpen(false);
            setReelToDelete(null);
        } catch (err: any) {
            toast.error(err || "An error occurred");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <PageMeta title="Instagram Management | Admin" description="Manage Instagram reels and header content" />
            <PageBreadcrumb pageTitle="Instagram Management" />

            <div className="space-y-6">
                <InstagramHeaderEdit />

                <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Instagram Reels</h2>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Reel
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reel URL</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {reels.map((reel) => (
                                    <tr key={reel._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden">
                                                <img src={reel.image} alt="Reel Thumbnail" className="w-full h-full object-cover" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            <a href={reel.reelUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-600 hover:underline">
                                                <Instagram className="w-4 h-4" /> View Reel
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {reel.order}
                                        </td>
                                        <td className="px-6 py-4">
                                            {reel.status === "active" ? (
                                                <CheckCircle className="text-green-500 w-5 h-5" />
                                            ) : (
                                                <XCircle className="text-red-500 w-5 h-5" />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button onClick={() => handleOpenModal(reel)} className="text-blue-500 hover:text-blue-700">
                                                <Pencil className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => { setReelToDelete(reel); setDeleteConfirmOpen(true); }} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {reels.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                            No reels found. Add one to get started!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <InstagramReelModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onConfirm={handleSubmit}
                reel={selectedReel}
                isProcessing={isProcessing}
            />

            {/* Delete Confirmation */}
            {deleteConfirmOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setDeleteConfirmOpen(false)}></div>
                    <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="text-red-500 w-6 h-6" />
                            <h3 className="text-lg font-semibold">Confirm Delete</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this reel? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteConfirmOpen(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                            <button onClick={handleDelete} disabled={isProcessing} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2">
                                {isProcessing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default InstagramManagement;
