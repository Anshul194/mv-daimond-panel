import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
    fetchFaqs,
    createFaq,
    updateFaq,
    deleteFaq,
    resetState,
} from "../../store/slices/faqSlice";
import {
    Pencil,
    Trash2,
    CheckCircle,
    XCircle,
    Search,
    Plus,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
} from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import toast from "react-hot-toast";
import FaqModal from "../../components/modals/FaqModal";

const FaqList: React.FC = () => {
    const dispatch = useAppDispatch();
    const { faqs, loading, error, success, totalDocuments, currentPage, totalPages } = useAppSelector((state) => state.faq);

    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedFaq, setSelectedFaq] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [faqToDelete, setFaqToDelete] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchFaqs({ page: 1, limit: 10 }));
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            dispatch(resetState());
            dispatch(fetchFaqs({ page: currentPage, limit: 10, search }));
        }
    }, [success, dispatch]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(fetchFaqs({ page: 1, limit: 10, search }));
    };

    const handlePageChange = (page: number) => {
        dispatch(fetchFaqs({ page, limit: 10, search }));
    };

    const handleOpenModal = (faq: any = null) => {
        setSelectedFaq(faq);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedFaq(null);
        setModalOpen(false);
    };

    const handleSubmit = async (id: string | undefined, data: any) => {
        setIsProcessing(true);
        try {
            if (id) {
                await dispatch(updateFaq({ id, data })).unwrap();
                toast.success("FAQ updated successfully");
            } else {
                await dispatch(createFaq(data)).unwrap();
                toast.success("FAQ created successfully");
            }
            handleCloseModal();
        } catch (err: any) {
            toast.error(err || "An error occurred");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!faqToDelete) return;
        setIsProcessing(true);
        try {
            await dispatch(deleteFaq(faqToDelete._id)).unwrap();
            toast.success("FAQ deleted successfully");
            setDeleteConfirmOpen(false);
            setFaqToDelete(null);
        } catch (err: any) {
            toast.error(err || "An error occurred");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <PageMeta title="FAQ Management | Admin" description="Manage Frequently Asked Questions" />
            <PageBreadcrumb pageTitle="FAQ Management" />

            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">FAQs</h2>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4" /> Add FAQ
                    </button>
                </div>

                <form onSubmit={handleSearch} className="mb-6 relative max-w-md">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search FAQs..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 dark:bg-gray-900"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </form>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {faqs.map((faq) => (
                                <tr key={faq._id}>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300 max-w-md truncate">
                                        {faq.title}
                                    </td>
                                    <td className="px-6 py-4">
                                        {faq.status === "active" ? (
                                            <CheckCircle className="text-green-500 w-5 h-5" />
                                        ) : (
                                            <XCircle className="text-red-500 w-5 h-5" />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button onClick={() => handleOpenModal(faq)} className="text-blue-500 hover:text-blue-700">
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => { setFaqToDelete(faq); setDeleteConfirmOpen(true); }} className="text-red-500 hover:text-red-700">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                        <p className="text-sm text-gray-500">Showing page {currentPage} of {totalPages}</p>
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="p-2 border rounded-md disabled:opacity-50"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                                className="p-2 border rounded-md disabled:opacity-50"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <FaqModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onConfirm={handleSubmit}
                faq={selectedFaq}
                isProcessing={isProcessing}
            />

            {/* Delete Confirmation */}
            {deleteConfirmOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setDeleteConfirmOpen(false)}></div>
                    <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="text-red-500 w-6 h-6" />
                            <h3 className="text-lg font-semibold">Confirm Delete</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this FAQ? This action cannot be undone.</p>
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

export default FaqList;
