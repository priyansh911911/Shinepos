import React, { useState } from 'react'
import AddCategory from './AddCategory'
import CategoryList from './CategoryList'

const MainCategorys = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddSuccess = () => {
    setShowAddModal(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
        >
          + Add Category
        </button>
      </div>
      
      {showAddModal && (
        <div className="fixed inset-0 w-screen h-screen bg-black/30 backdrop-blur-md flex items-center justify-center z-50" style={{ margin: 0 }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add Category</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <AddCategory onSuccess={handleAddSuccess} />
          </div>
        </div>
      )}
      
      <CategoryList key={refreshKey} />
    </div>
  )
}

export default MainCategorys
