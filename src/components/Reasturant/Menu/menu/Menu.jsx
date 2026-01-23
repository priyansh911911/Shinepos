import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import ItemList from './ItemList';
import AddItem from './AddItem';
import EditItem from './EditItem';

const Menu = () => {
  const [view, setView] = useState('list');
  const [editingItem, setEditingItem] = useState(null);

  if (view === 'add') {
    return (
      <div className="p-6">
        <AddItem onSuccess={() => setView('list')} onBack={() => setView('list')} />
      </div>
    );
  }

  if (view === 'edit') {
    return (
      <div className="p-6">
        <EditItem item={editingItem} onSuccess={() => setView('list')} onBack={() => setView('list')} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end items-center mb-6">
          <button
            onClick={() => setView('add')}
            className="px-6 py-3 bg-white/30 backdrop-blur-md hover:bg-white/40 text-gray-900 rounded-xl flex items-center space-x-2 font-medium transition-all border border-white/40"
          >
            <FiPlus />
            <span>Add Item</span>
          </button>
        </div>
        <div className="animate-fadeIn">
          <ItemList onEdit={(item) => { setEditingItem(item); setView('edit'); }} />
        </div>
      </div>
    </div>
  );
};

export default Menu;