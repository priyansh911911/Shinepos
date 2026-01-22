import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiLoader, FiCheckCircle, FiXCircle, FiClock, FiTag, FiSearch } from 'react-icons/fi';

const ItemList = ({ onEdit }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/menus/get/all-menu-items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setItems(data.menuItems || []);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
    setLoading(false);
  };

  const toggleItemStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    // Optimistic update
    setItems(items.map(item => 
      item._id === id ? { ...item, status: newStatus } : item
    ));
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/menus/update/menu-item/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        // Revert on failure
        setItems(items.map(item => 
          item._id === id ? { ...item, status: currentStatus } : item
        ));
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      // Revert on failure
      setItems(items.map(item => 
        item._id === id ? { ...item, status: currentStatus } : item
      ));
    }
  };

  const deleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/menus/delete/menu-item/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setItems(items.filter(item => item._id !== id));
        alert('Item deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleEdit = (item) => {
    if (onEdit) onEdit(item);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <FiLoader className="text-6xl mb-4 animate-spin mx-auto text-orange-500" size={64} />
          <p className="mt-4 text-gray-600 font-medium">Loading menu items...</p>
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
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/40 backdrop-blur-lg border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.filter(item => 
          item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
        ).map((item, index) => (
          <div 
            key={item._id} 
            className="bg-white/30 backdrop-blur-md rounded-xl overflow-hidden hover:bg-white/40 transition-colors animate-fadeIn"
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            {/* Image Section */}
            <div className="relative h-32 bg-gradient-to-br from-orange-100 to-red-100">
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.itemName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl">🍴</span>
                </div>
              )}
              
              {/* Food Type Badge */}
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold shadow-md ${
                  item.foodType === 'veg' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {item.foodType === 'veg' ? '🌱' : '🍖'}
                </span>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900 truncate flex-1">{item.itemName}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1 ml-2 ${
                  item.status === 'active' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {item.status === 'active' ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
                </span>
              </div>
              
              <div className="space-y-1 mb-3 text-xs text-gray-900">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><FiTag size={12} /> {item.categoryID?.name || 'N/A'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><FiClock size={12} /> {item.timeToPrepare} min</span>
                  {item.variation && item.variation.length > 0 ? (
                    <span className="text-sm font-bold text-black">
                      ₹{Math.min(...item.variation.map(v => v.price || 0))}
                    </span>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toggleItemStatus(item._id, item.status)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                    item.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      item.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 px-2 py-1.5 bg-white/30 backdrop-blur-md hover:bg-white/40 text-gray-900 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <FiEdit2 size={12} />
                </button>
                
                <button
                  onClick={() => deleteItem(item._id)}
                  className="flex-1 px-2 py-1.5 bg-white/30 backdrop-blur-md hover:bg-white/40 text-gray-900 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {items.length === 0 && (
        <div className="text-center py-16 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl">
          <div className="text-6xl mb-4 animate-pulse-slow">🍴</div>
          <p className="text-gray-500 text-lg font-medium">No menu items found</p>
          <p className="text-gray-400 text-sm mt-2">Add some items to get started</p>
        </div>
      )}
    </div>
  );
};

export default ItemList;