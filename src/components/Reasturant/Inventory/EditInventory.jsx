import React, { useState, useEffect } from 'react';

const EditInventory = ({ item, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'ingredient',
    currentStock: '',
    minStock: '',
    unit: 'kg',
    costPerUnit: '',
    supplier: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || 'ingredient',
        currentStock: item.currentStock || '',
        minStock: item.minStock || '',
        unit: item.unit || 'kg',
        costPerUnit: item.costPerUnit || '',
        supplier: item.supplier || ''
      });
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await onUpdate(item._id, formData);
    
    if (result.success) {
      onCancel();
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white/20 backdrop-blur-2xl rounded-2xl p-4 sm:p-6 animate-fadeIn">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">📦 Edit Inventory Item</h2>
      
      {error && (
        <div className="bg-red-500/20 backdrop-blur-lg border border-red-400/50 text-red-700 px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Item Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/40 backdrop-blur-lg border border-white/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-white/40 backdrop-blur-lg border border-white/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            >
              <option value="ingredient">Ingredient</option>
              <option value="beverage">Beverage</option>
              <option value="packaging">Packaging</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Current Stock</label>
            <input
              type="number"
              value={formData.currentStock}
              onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
              className="w-full bg-white/40 backdrop-blur-lg border border-white/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Minimum Stock</label>
            <input
              type="number"
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
              className="w-full bg-white/40 backdrop-blur-lg border border-white/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Unit</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full bg-white/40 backdrop-blur-lg border border-white/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            >
              <option value="kg">Kilogram (kg)</option>
              <option value="g">Gram (g)</option>
              <option value="l">Liter (l)</option>
              <option value="ml">Milliliter (ml)</option>
              <option value="pieces">Pieces</option>
              <option value="boxes">Boxes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Cost Per Unit (₹)</label>
            <input
              type="number"
              step="0.01"
              value={formData.costPerUnit}
              onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
              className="w-full bg-white/40 backdrop-blur-lg border border-white/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-900 mb-2">Supplier</label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full bg-white/40 backdrop-blur-lg border border-white/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            />
          </div>
        </div>

        <div className="flex flex-col space-y-3 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-2 bg-white/30 backdrop-blur-md hover:bg-white/40 text-gray-900 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Updating...' : '✓ Update Item'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full px-6 py-2 bg-white/30 backdrop-blur-md hover:bg-white/40 text-gray-900 rounded-xl transition-colors"
          >
            ← Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditInventory;
