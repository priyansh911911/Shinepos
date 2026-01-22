import React, { useState } from 'react'

const AddCategory = ({ onSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/add/category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({ name: '', description: '', isActive: true });
        onSuccess && onSuccess();
      } else {
        setError(data.error || 'Failed to add category');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fadeIn p-6">
      <div className="bg-white/20 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/40 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">🏷️ Add Category</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Category Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter category name"
              className="w-full bg-white/40 backdrop-blur-lg border border-white/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter category description (optional)"
              className="w-full bg-white/40 backdrop-blur-lg border border-white/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-600"
              rows="4"
            ></textarea>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-900">Active</label>
          </div>

          {error && (
            <div className="bg-red-100/80 backdrop-blur-lg border border-red-300 text-red-700 px-4 py-3 rounded-xl flex items-start">
              <span className="text-xl mr-2">⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 bg-white/30 backdrop-blur-md hover:bg-white/40 text-gray-900 rounded-xl border border-white/40"
          >
            ← Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-white/30 backdrop-blur-md hover:bg-white/40 text-gray-900 rounded-xl border border-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : '✓ Create Category'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default AddCategory