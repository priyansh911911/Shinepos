import React, { useState } from 'react'
import AddCategory from './AddCategory'
import EditCategory from './EditCategory'
import CategoryList from './CategoryList'

const MainCategorys = () => {
  const [view, setView] = useState('list');
  const [editingCategory, setEditingCategory] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddSuccess = () => {
    setView('list');
    setRefreshKey(prev => prev + 1);
  };

  const handleEditSuccess = () => {
    setView('list');
    setRefreshKey(prev => prev + 1);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setView('edit');
  };

  if (view === 'add') {
    return <AddCategory onSuccess={handleAddSuccess} onBack={() => setView('list')} />;
  }

  if (view === 'edit') {
    return <EditCategory category={editingCategory} onSuccess={handleEditSuccess} onBack={() => setView('list')} />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-end items-center mb-6">
        <button
          onClick={() => setView('add')}
          className="px-6 py-3 bg-white/30 backdrop-blur-md hover:bg-white/40 text-gray-900 rounded-xl flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border border-white/40"
        >
          <span>➕ Add Category</span>
        </button>
      </div>
      
      <CategoryList key={refreshKey} onEdit={handleEdit} />
    </div>
  )
}

export default MainCategorys
