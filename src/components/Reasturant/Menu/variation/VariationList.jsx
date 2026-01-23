import React, { useState } from 'react';
import { FiLoader, FiSearch } from 'react-icons/fi';

const VariationList = ({ variations, loading, onAdd, onEdit, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVariations = variations.filter(variation =>
    variation.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleVariationStatus = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/variation/update/variation/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ available: newStatus })
      });
      
      if (response.ok) {
        onDelete(); // Refresh data in parent
      }
    } catch (error) {
      console.error('Error updating variation status:', error);
    }
  };

  const deleteVariation = async (id) => {
    if (!confirm('Are you sure you want to delete this variation?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/variation/delete/variation/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        alert('Variation deleted successfully!');
        onDelete(); // Refresh data in parent
      }
    } catch (error) {
      console.error('Error deleting variation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <FiLoader className="text-6xl mb-4 animate-spin mx-auto text-cyan-500" size={64} />
          <p className="mt-4 text-gray-600 font-medium">Loading variations...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
          <input
            type="text"
            placeholder="Search variations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/40 backdrop-blur-lg border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
          />
        </div>
      </div>
      
      <div className="bg-white/30 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toggle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-200">
              {filteredVariations.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center">
                    <div className="text-6xl mb-2">📦</div>
                    <p className="text-gray-500 font-medium">{searchQuery ? 'No variations found matching your search' : 'No variations found'}</p>
                    <p className="text-gray-400 text-sm">Create your first variation to get started</p>
                  </td>
                </tr>
              ) : (
                filteredVariations.map((variation) => (
                  <tr key={variation._id} className="hover:bg-white/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{variation.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">₹{variation.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        variation.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {variation.available ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleVariationStatus(variation._id, variation.available)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          variation.available ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            variation.available ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      <button
                        onClick={() => onEdit && onEdit(variation)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteVariation(variation._id)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VariationList;
