import React, { useState } from 'react'
import { motion } from 'framer-motion'
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
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
        <AddCategory onSuccess={handleAddSuccess} onBack={() => setView('list')} />
      </motion.div>
    );
  }

  if (view === 'edit') {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
        <EditCategory category={editingCategory} onSuccess={handleEditSuccess} onBack={() => setView('list')} />
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-6">
      <div className="flex justify-end items-center mb-6">
        <button
          onClick={() => setView('add')}
          className="px-6 py-3 bg-white/30 backdrop-blur-md hover:bg-white/40 text-gray-900 rounded-xl flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border border-white/40"
        >
          <span>➕ Add Category</span>
        </button>
      </div>
      
      <CategoryList key={refreshKey} onEdit={handleEdit} />
    </motion.div>
  )
}

export default MainCategorys
