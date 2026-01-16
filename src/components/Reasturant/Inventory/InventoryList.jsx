import React, { useState } from 'react';
import { FiRefreshCw, FiEdit, FiPackage, FiTrash2 } from 'react-icons/fi';

const InventoryList = ({ inventory, onUpdate, onRestock, onRefresh, onEdit, onDelete }) => {
  const [restockModal, setRestockModal] = useState(null);
  const [restockQty, setRestockQty] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);

  const handleRestock = async () => {
    if (!restockQty || restockQty <= 0) return;
    
    const result = await onRestock(restockModal, parseInt(restockQty));
    if (result.success) {
      setRestockModal(null);
      setRestockQty('');
    }
  };

  const handleDelete = async () => {
    const result = await onDelete(deleteModal);
    if (result.success) {
      setDeleteModal(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold">Inventory Items</h2>
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          <FiRefreshCw />
          <span>Refresh</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Stock</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost/Unit</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inventory.map((item) => (
              <tr key={item._id} className={`hover:bg-gray-50 ${item.isLowStock ? 'bg-orange-50' : ''}`}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                <td className="px-4 py-3 text-sm text-gray-900 capitalize">{item.category}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`font-medium ${item.isLowStock ? 'text-orange-600' : 'text-gray-900'}`}>
                    {item.currentStock}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{item.minStock}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{item.unit}</td>
                <td className="px-4 py-3 text-sm text-gray-900">₹{item.costPerUnit}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{item.supplier || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => setRestockModal(item._id)}
                      className="text-green-600 hover:text-green-800"
                      title="Restock"
                    >
                      <FiPackage />
                    </button>
                    <button
                      onClick={() => setDeleteModal(item._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {inventory.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No inventory items found
        </div>
      )}

      {restockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">Restock Item</h3>
            <input
              type="number"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              placeholder="Enter quantity"
              className="w-full px-3 py-2 border rounded-lg mb-4"
              min="1"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleRestock}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Restock
              </button>
              <button
                onClick={() => {
                  setRestockModal(null);
                  setRestockQty('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">Delete Item</h3>
            <p className="mb-4">Are you sure you want to delete this item?</p>
            <div className="flex space-x-2">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryList;
