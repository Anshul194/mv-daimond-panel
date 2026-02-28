import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
    fetchHomeStats,
    createHomeStat,
    updateHomeStat,
    deleteHomeStat,
    resetHomePageState,
} from "../../store/slices/homePageSlice";
import {
    Pencil,
    Trash2,
    CheckCircle,
    XCircle,
    Plus,
    AlertTriangle,
} from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import toast from "react-hot-toast";
import HomeStatModal from "../../components/modals/HomeStatModal";
import GreenBoxEdit from "./GreenBoxEdit";

const HomeStatsList: React.FC = () => {
    const dispatch = useAppDispatch();
    const { stats, loading, success } = useAppSelector((state) => state.homePage);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedStat, setSelectedStat] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [statToDelete, setStatToDelete] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchHomeStats());
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            dispatch(resetHomePageState());
            dispatch(fetchHomeStats());
        }
    }, [success, dispatch]);

    const handleOpenModal = (stat: any = null) => {
        setSelectedStat(stat);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedStat(null);
        setModalOpen(false);
    };

    const handleSubmit = async (id: string | undefined, data: any) => {
        setIsProcessing(true);
        try {
            if (id) {
                await dispatch(updateHomeStat({ id, data })).unwrap();
                toast.success("Statistic updated successfully");
            } else {
                await dispatch(createHomeStat(data)).unwrap();
                toast.success("Statistic created successfully");
            }
            handleCloseModal();
        } catch (err: any) {
            toast.error(err || "An error occurred");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!statToDelete) return;
        setIsProcessing(true);
        try {
            await dispatch(deleteHomeStat(statToDelete._id)).unwrap();
            toast.success("Statistic deleted successfully");
            setDeleteConfirmOpen(false);
            setStatToDelete(null);
        } catch (err: any) {
            toast.error(err || "An error occurred");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <PageMeta title="Home Page Management | Admin" description="Manage Home Page content and statistics" />
            <PageBreadcrumb pageTitle="Home Page Management" />

            <div className="space-y-6">
                {/* Green Box Content Editor */}
                <GreenBoxEdit />

                {/* Home Stats Table */}
                <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Home Statistics Cards</h2>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Statistic
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Suffix</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {stats.map((stat) => (
                                    <tr key={stat._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-300">
                                            {stat.label}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {stat.value}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {stat.suffix}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {stat.order}
                                        </td>
                                        <td className="px-6 py-4">
                                            {stat.status === "active" ? (
                                                <CheckCircle className="text-green-500 w-5 h-5" />
                                            ) : (
                                                <XCircle className="text-red-500 w-5 h-5" />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button onClick={() => handleOpenModal(stat)} className="text-blue-500 hover:text-blue-700">
                                                <Pencil className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => { setStatToDelete(stat); setDeleteConfirmOpen(true); }} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {stats.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                            No statistics found. Add one to get started!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <HomeStatModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onConfirm={handleSubmit}
                stat={selectedStat}
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
                        <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete "{statToDelete?.label}"? This action cannot be undone.</p>
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

export default HomeStatsList;
