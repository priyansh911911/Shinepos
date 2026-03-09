import React, { useState } from 'react';
import { FiCheckCircle, FiArrowLeft } from 'react-icons/fi';

const AddInventory = ({ onAdd, onCancel }) => {
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await onAdd(formData);
    
    if (result.success) {
      setFormData({
        name: '',
        category: 'ingredient',
        currentStock: '',
        minStock: '',
        unit: 'kg',
        costPerUnit: '',
        supplier: ''
      });
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-white/5 backdrop-blur-2xl rounded-2xl p-4 sm:p-6 animate-fadeIn">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2"><FiCheckCircle /> Add Inventory Item</h2>

      {error && (
        <div className="bg-red-500/20 backdrop-blur-lg border border-red-400/50 text-white px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Item Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ingredient">Ingredient</option>
              <option value="beverage">Beverage</option>
              <option value="packaging">Packaging</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Current Stock *
            </label>
            <input
              type="number"
              name="currentStock"
              value={formData.currentStock}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Minimum Stock *
            </label>
            <input
              type="number"
              name="minStock"
              value={formData.minStock}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Unit *
            </label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              required
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-white mb-2">
              Cost Per Unit *
            </label>
            <input
              type="number"
              name="costPerUnit"
              value={formData.costPerUnit}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-white mb-2">
              Supplier
            </label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col space-y-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-2 bg-white/30 backdrop-blur-md hover:bg-white/40 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : <><FiCheckCircle /> Add Item</>}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full px-6 py-2 bg-white/30 backdrop-blur-md hover:bg-white/40 text-white rounded-xl transition-colors"
          >
            <FiArrowLeft /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddInventory;
