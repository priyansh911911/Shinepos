import React, { useState, useEffect } from 'react';
import { useCategory } from '../Category/hooks/useCategory';

const ItemList = ({ onEdit }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { categories } = useCategory();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/menus/get/all-menu-items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  const deleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/menus/delete/menu-item/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setItems(items.filter(item => item._id !== id));
        alert('Item deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const editItem = (item) => {
    if (onEdit) onEdit(item);
  };

  const getCategoryName = (categoryID) => {
    if (typeof categoryID === 'object' && categoryID?.name) {
      return categoryID.name;
    }
    const category = categories.find(cat => cat._id === categoryID);
    return category ? category.name : 'Unknown';
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Items List</h2>
      
      <div className="grid gap-4">
        {items.map(item => (
          <div key={item._id} className="bg-white p-4 rounded-lg shadow-md border">
            <div className="flex gap-4">
              {item.imageUrl && (
                <img 
                  src={item.imageUrl} 
                  alt={item.itemName}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{item.itemName}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editItem(item)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteItem(item._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                    <span className={`px-2 py-1 rounded text-sm ${
                      item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Category:</span> {getCategoryName(item.categoryID)}
                  </div>
                  <div>
                    <span className="font-medium">Price:</span> ₹{item.price}
                  </div>
                  <div>
                    <span className="font-medium">Prep Time:</span> {item.timeToPrepare} min
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Food Type:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.foodType === 'veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.foodType === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No items found. Add some items to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemList;