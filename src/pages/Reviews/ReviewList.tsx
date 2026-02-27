import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchReviews, deleteReview, resetState, updateReviewStatus } from "../../store/slices/reviewSlice";
import ReviewModal from "../../components/modals/ReviewModal";
import { PlusIcon, PencilIcon, TrashIcon, Star } from "lucide-react";
import toast from "react-hot-toast";

const ReviewList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { results: reviews, loading, success, error, totalPages, currentPage } = useAppSelector((state) => state.review);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<string>("");

  useEffect(() => {
    dispatch(fetchReviews({ page, limit: 10, targetType: filterType || undefined }));
  }, [dispatch, page, filterType]);

  useEffect(() => {
    if (success && isModalOpen) {
      toast.success(selectedReview ? "Review updated!" : "Review created!");
      setIsModalOpen(false);
      dispatch(resetState());
    }
    if (error) {
      toast.error(error);
      dispatch(resetState());
    }
  }, [success, error, dispatch, isModalOpen, selectedReview]);

  const handleAdd = () => {
    setSelectedReview(null);
    setIsModalOpen(true);
  };

  const handleEdit = (review: any) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await dispatch(updateReviewStatus({ id, status })).unwrap();
      toast.success(`Review ${status}!`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await dispatch(deleteReview(id)).unwrap();
        toast.success("Review deleted!");
      } catch (err) {
        toast.error("Failed to delete review");
      }
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Review Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage customer testimonials and product reviews.</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <PlusIcon className="w-5 h-5" />
          Add Review
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-sm outline-none"
            >
              <option value="">All Types</option>
              <option value="website">Website Reviews</option>
              <option value="product">Product Reviews</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            Showing page {currentPage} of {totalPages}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4">User / Product</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Comment</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              {loading && reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500 underline animate-pulse">
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    No reviews found.
                  </td>
                </tr>
              ) : (
                reviews.map((review: any) => (
                  <tr key={review._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {review.reviewerName || (review.user && review.user.name ? review.user.name : "Anonymous")}
                        </span>
                        {review.product && (
                          <span className="text-xs text-gray-400 mt-1 truncate max-w-[150px]">
                            Product: {review.product?.title || review.product}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {renderStars(review.rating)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="line-clamp-2 max-w-md text-gray-600 dark:text-gray-400">
                        {review.comment}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${review.targetType === "product"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}>
                        {review.targetType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${review.status === "approved"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : review.status === "rejected"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}>
                        {review.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {review.status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(review._id, 'approved')}
                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors font-medium text-xs"
                            title="Approve"
                          >
                            Approve
                          </button>
                        )}
                        {review.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(review._id, 'rejected')}
                            className="p-1.5 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors font-medium text-xs"
                            title="Reject"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(review)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === p
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        review={selectedReview}
      />
    </div>
  );
};

export default ReviewList;
