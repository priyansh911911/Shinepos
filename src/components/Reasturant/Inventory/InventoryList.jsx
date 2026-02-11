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
    <div className="bg-white/20 backdrop-blur-2xl rounded-2xl animate-fadeIn">
      <div className="p-4 sm:p-6 border-b border-white/30 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">📦 Inventory Items</h2>
        <button
          onClick={onRefresh}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-white/30 backdrop-blur-md hover:bg-white/40 text-gray-900 rounded-xl transition-colors w-full sm:w-auto"
        >
          <FiRefreshCw />
          <span>Refresh</span>
        </button>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden">
        {inventory.map((item) => (
          <div key={item._id} className={`p-4 border-b border-white/30 ${item.isLowStock ? 'bg-orange-500/20' : ''}`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-900">{item.name}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(item)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Edit"
                >
                  <FiEdit size={16} />
                </button>
                <button
                  onClick={() => setRestockModal(item._id)}
                  className="text-green-600 hover:text-green-800 p-1"
                  title="Restock"
                >
                  <FiPackage size={16} />
                </button>
                <button
                  onClick={() => setDeleteModal(item._id)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
              <div><span className="font-medium">Category:</span> {item.category}</div>
              <div><span className="font-medium">Unit:</span> {item.unit}</div>
              <div>
                <span className="font-medium">Stock:</span> 
                <span className={item.isLowStock ? 'text-orange-600 font-medium' : ''}>
                  {item.currentStock}
                </span>
              </div>
              <div><span className="font-medium">Min:</span> {item.minStock}</div>
              <div><span className="font-medium">Cost:</span> ₹{item.costPerUnit}</div>
              <div><span className="font-medium">Supplier:</span> {item.supplier || '-'}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/30 backdrop-blur-lg">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Current Stock</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Min Stock</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Unit</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Cost/Unit</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Supplier</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/30">
            {inventory.map((item) => (
              <tr key={item._id} className={`hover:bg-white/20 transition-colors ${item.isLowStock ? 'bg-orange-500/20' : ''}`}>
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
        <div className="text-center py-8 text-gray-900">
          No inventory items found
        </div>
      )}

      {restockModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/20 backdrop-blur-2xl rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📦 Restock Item</h3>
            <input
              type="number"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              placeholder="Enter quantity"
              className="w-full bg-white/40 backdrop-blur-lg border border-white/50 rounded-xl px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              min="1"
            />
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleRestock}
                className="flex-1 px-4 py-2 bg-white/30 backdrop-blur-md hover:bg-white/40 text-gray-900 rounded-xl transition-colors"
              >
                ✓ Restock
              </button>
              <button
                onClick={() => {
                  setRestockModal(null);
                  setRestockQty('');
                }}
                className="flex-1 px-4 py-2 bg-white/30 backdrop-blur-md hover:bg-white/40 text-gray-900 rounded-xl transition-colors"
              >
                ← Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/20 backdrop-blur-2xl rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🗑️ Delete Item</h3>
            <p className="mb-4 text-gray-900">Are you sure you want to delete this item?</p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500/30 backdrop-blur-md hover:bg-red-500/40 text-red-700 rounded-xl transition-colors"
              >
                ✓ Delete
              </button>
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-2 bg-white/30 backdrop-blur-md hover:bg-white/40 text-gray-900 rounded-xl transition-colors"
              >
                ← Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryList;
