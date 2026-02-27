import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchCollections, deleteCollection } from "../../store/slices/collectionSlice";
import CollectionModal from "../../components/modals/CollectionModal";
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react";

const CollectionList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { collections, loading } = useAppSelector((state) => state.collection);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchCollections());
  }, [dispatch]);

  const handleAdd = () => {
    setSelectedCollection(null);
    setIsModalOpen(true);
  };

  const handleEdit = (collection: any) => {
    setSelectedCollection(collection);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this collection?")) {
      await dispatch(deleteCollection(id));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ring Collections</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <PlusIcon size={20} /> Add Collection
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Image</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Order</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-400">Loading...</td>
              </tr>
            ) : collections.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-400">No collections found</td>
              </tr>
            ) : (
              collections.map((collection) => (
                <tr key={collection._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-12 h-12 object-cover rounded-lg border"
                    />
                  </td>
                  <td className="px-6 py-4 font-medium">{collection.name}</td>
                  <td className="px-6 py-4">{collection.order}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      collection.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {collection.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(collection)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <PencilIcon size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(collection._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <TrashIcon size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CollectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        collection={selectedCollection}
      />
    </div>
  );
};

export default CollectionList;
