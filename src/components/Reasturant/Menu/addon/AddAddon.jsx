import React, { useState } from 'react';
import { FiStar } from 'react-icons/fi';

const AddAddon = ({ onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    veg: true,
    available: true
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/addon/add/addon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          price: Number(formData.price),
          description: formData.description,
          veg: formData.veg,
          available: formData.available
        })
      });

      if (response.ok) {
        alert('Addon added successfully!');
        setFormData({
          name: '',
          price: '',
          description: '',
          veg: true,
          available: true
        });
        if (onSuccess) onSuccess();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add addon');
      }
    } catch (error) {
      alert('Error adding addon');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="bg-white/20 backdrop-blur-2xl rounded-2xl border border-white/50 p-8">
        <div className="flex items-center gap-3 mb-6">
          <FiStar className="text-3xl text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Add New Addon</h2>
        </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900">Addon Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-3 bg-white/40 backdrop-blur-lg border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            placeholder="e.g., Extra Cheese"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900">Price (₹) *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="w-full p-3 bg-white/40 backdrop-blur-lg border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            min="0"
            step="0.01"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-900">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-3 bg-white/40 backdrop-blur-lg border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            rows="3"
            placeholder="Optional description"
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="veg"
            id="veg"
            checked={formData.veg}
            onChange={handleInputChange}
            className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-purple-500"
          />
          <label htmlFor="veg" className="text-sm font-medium text-gray-900">
            Vegetarian
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="available"
            id="available"
            checked={formData.available}
            onChange={handleInputChange}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-purple-500"
          />
          <label htmlFor="available" className="text-sm font-medium text-gray-900">
            Available
          </label>
        </div>

        <div className="flex gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex-1 bg-white/30 backdrop-blur-md hover:bg-white/40 text-gray-900 py-3 rounded-xl font-medium transition-all border border-white/40"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-white/30 backdrop-blur-md hover:bg-white/40 text-gray-900 py-3 rounded-xl font-medium transition-all border border-white/40 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Addon'}
          </button>
        </div>
      </form>
    </div>
  </div>
  );
};

export default AddAddon;