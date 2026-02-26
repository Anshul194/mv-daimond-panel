import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchBanners, createBanner, updateBanner, deleteBanner, resetState } from "../../store/slices/bannerSlice";
import { Pencil, Trash2, Plus, AlertTriangle } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import toast from "react-hot-toast";
import BannerModal from "../../components/modals/BannerModal";

const BannerList: React.FC = () => {
    const dispatch = useAppDispatch();
    const { banners, loading, success } = useAppSelector((state) => state.banner);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [bannerToDelete, setBannerToDelete] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchBanners());
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            dispatch(resetState());
            dispatch(fetchBanners());
        }
    }, [success, dispatch]);

    const handleOpenModal = (banner: any = null) => {
        setSelectedBanner(banner);
        setModalOpen(true);
    };

    const handleConfirm = async (id: string | undefined, data: any) => {
        setIsProcessing(true);
        try {
            if (id) {
                await dispatch(updateBanner({ id, data })).unwrap();
                toast.success("Banner updated successfully");
            } else {
                await dispatch(createBanner(data)).unwrap();
                toast.success("Banner created successfully");
            }
            setModalOpen(false);
        } catch (err: any) {
            toast.error(err || "An error occurred");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!bannerToDelete) return;
        setIsProcessing(true);
        try {
            await dispatch(deleteBanner(bannerToDelete._id)).unwrap();
            toast.success("Banner deleted successfully");
            setDeleteConfirmOpen(false);
        } catch (err: any) {
            toast.error(err || "An error occurred");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <PageMeta title="Banner Management | Admin" description="Manage homepage banners" />
            <PageBreadcrumb pageTitle="Banner Management" />

            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Banners</h2>
                    <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md">
                        <Plus className="w-4 h-4" /> Add Banner
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800">
                                <th className="px-6 py-3 text-left text-xs uppercase">Image</th>
                                <th className="px-6 py-3 text-left text-xs uppercase">Title</th>
                                <th className="px-6 py-3 text-left text-xs uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {banners.map((banner) => (
                                <tr key={banner._id}>
                                    <td className="px-6 py-4">
                                        <img src={banner.image} alt={banner.title} className="w-20 h-10 object-cover rounded" />
                                    </td>
                                    <td className="px-6 py-4 text-sm">{banner.title}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${banner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {banner.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button onClick={() => handleOpenModal(banner)} className="text-blue-500 hover:text-blue-700">
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => { setBannerToDelete(banner); setDeleteConfirmOpen(true); }} className="text-red-500 hover:text-red-700">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <BannerModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onConfirm={handleConfirm} banner={selectedBanner} isProcessing={isProcessing} />

            {deleteConfirmOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteConfirmOpen(false)}></div>
                    <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="text-red-500" />
                            <h3 className="text-lg font-bold">Confirm Delete</h3>
                        </div>
                        <p className="mb-6">Are you sure you want to delete this banner?</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteConfirmOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BannerList;
