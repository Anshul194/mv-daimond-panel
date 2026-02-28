import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchServices, createService, updateService, deleteService, resetState } from "../../store/slices/serviceSlice";
import { Pencil, Trash2, Plus, AlertTriangle } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import toast from "react-hot-toast";
import ServiceModal from "../../components/modals/ServiceModal";

const BASE_URL = import.meta.env.VITE_IMAGE_URL || "http://localhost:3000";

const ServiceList: React.FC = () => {
    const dispatch = useAppDispatch();
    const { services, loading, success } = useAppSelector((state) => state.service);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchServices());
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            dispatch(resetState());
            dispatch(fetchServices());
        }
    }, [success, dispatch]);

    const handleOpenModal = (service: any = null) => {
        setSelectedService(service);
        setModalOpen(true);
    };

    const handleConfirm = async (id: string | undefined, data: any) => {
        setIsProcessing(true);
        try {
            if (id) {
                await dispatch(updateService({ id, data })).unwrap();
                toast.success("Service updated successfully");
            } else {
                await dispatch(createService(data)).unwrap();
                toast.success("Service created successfully");
            }
            setModalOpen(false);
        } catch (err: any) {
            toast.error(err || "An error occurred");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!serviceToDelete) return;
        setIsProcessing(true);
        try {
            await dispatch(deleteService(serviceToDelete._id)).unwrap();
            toast.success("Service deleted successfully");
            setDeleteConfirmOpen(false);
        } catch (err: any) {
            toast.error(err || "An error occurred");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <PageMeta title="Service Management | Admin" description="Manage homepage services section" />
            <PageBreadcrumb pageTitle="Service Management" />

            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Our Services</h2>
                    <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        <Plus className="w-4 h-4" /> Add Service
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800">
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Image</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Link</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Order</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-transparent">
                                {services.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No services found. Click "Add Service" to create one.</td>
                                    </tr>
                                ) : (
                                    services.map((service) => (
                                        <tr key={service._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-6 py-4">
                                                <img
                                                    src={service.image?.startsWith("http") ? service.image : `${BASE_URL}${service.image}`}
                                                    alt={service.alt || service.title}
                                                    className="w-20 h-14 object-cover rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">{service.title}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{service.link || "—"}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{service.order}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${service.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                    {service.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3">
                                                <button onClick={() => handleOpenModal(service)} className="text-blue-500 hover:text-blue-700">
                                                    <Pencil className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => { setServiceToDelete(service); setDeleteConfirmOpen(true); }} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ServiceModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onConfirm={handleConfirm} service={selectedService} isProcessing={isProcessing} />

            {deleteConfirmOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteConfirmOpen(false)}></div>
                    <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="text-red-500" />
                            <h3 className="text-lg font-bold">Confirm Delete</h3>
                        </div>
                        <p className="mb-6">Are you sure you want to delete "<strong>{serviceToDelete?.title}</strong>"?</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteConfirmOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                            <button onClick={handleDelete} disabled={isProcessing} className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50">
                                {isProcessing ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ServiceList;
