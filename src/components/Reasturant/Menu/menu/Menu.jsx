import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import ItemList from './ItemList';
import AddItem from './AddItem';
import EditItem from './EditItem';

const Menu = () => {
  const [view, setView] = useState('list');
  const [editingItem, setEditingItem] = useState(null);

  if (view === 'add') {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="p-6">
        <AddItem onSuccess={() => setView('list')} onBack={() => setView('list')} />
      </motion.div>
    );
  }

  if (view === 'edit') {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="p-6">
        <EditItem item={editingItem} onSuccess={() => setView('list')} onBack={() => setView('list')} />
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end items-center mb-6">
          <button
            onClick={() => setView('add')}
            className="px-6 py-3 bg-white/30 backdrop-blur-md hover:bg-white/40 text-gray-900 rounded-xl flex items-center space-x-2 font-medium transition-colors"
          >
            <FiPlus />
            <span>Add Item</span>
          </button>
        </div>
        <div className="animate-fadeIn">
          <ItemList onEdit={(item) => { setEditingItem(item); setView('edit'); }} />
        </div>
      </div>
    </motion.div>
  );
};

export default Menu;