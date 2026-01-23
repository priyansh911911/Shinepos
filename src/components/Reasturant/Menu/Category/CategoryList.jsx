import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useCategory } from './hooks/useCategory';

const CategoryList = ({ onEdit }) => {
  const { categories, loading, deleteCategory, toggleCategoryStatus } = useCategory();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    deleteCategory(id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse-slow">🏷️</div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-900 font-medium">Loading categories...</p>
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
            placeholder="Search categories..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toggle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white/50 divide-y divide-gray-200">
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center">
                  <div className="text-6xl mb-2">📦</div>
                  <p className="text-gray-500 font-medium">{searchQuery ? 'No categories found matching your search' : 'No categories found'}</p>
                  <p className="text-gray-400 text-sm">Create your first category to get started</p>
                </td>
              </tr>
            ) : (
              filteredCategories.map((category) => (
                <tr key={category._id} className="hover:bg-white/70 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{category.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      category.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleCategoryStatus(category._id, category.isActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        category.isActive ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          category.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button
                      onClick={() => onEdit(category)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
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

export default CategoryList;
