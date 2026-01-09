import React, { useState } from 'react';
import AddItem from './AddItem';
import ItemList from './ItemList';
import EditItem from './EditItem';

const MainItems = () => {
  const [view, setView] = useState('list');
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingItem, setEditingItem] = useState(null);

  const handleAddSuccess = () => {
    setView('list');
    setRefreshKey(prev => prev + 1);
  };

  const handleEditSuccess = () => {
    setView('list');
    setEditingItem(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setView('edit');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Menu Items</h1>
        {view === 'list' && (
          <button
            onClick={() => setView('add')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            + Add Item
          </button>
        )}
      </div>
      
      {view === 'add' && (
        <div className="bg-white rounded-lg shadow p-6">
          <AddItem onSuccess={handleAddSuccess} onBack={() => setView('list')} />
        </div>
      )}

      {view === 'edit' && (
        <div className="bg-white rounded-lg shadow p-6">
          <EditItem item={editingItem} onSuccess={handleEditSuccess} onBack={() => setView('list')} />
        </div>
      )}

      {view === 'list' && (
        <ItemList key={refreshKey} onEdit={handleEdit} />
      )}
    </div>
  );
};

export default MainItems;