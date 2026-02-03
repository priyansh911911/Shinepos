import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiPackage, FiAlertTriangle, FiCpu, FiUsers } from 'react-icons/fi';
import InventoryList from './InventoryList';
import AddInventory from './AddInventory';
import EditInventory from './EditInventory';
import SmartInventory from './SmartInventory';
import Vendor from './Vendor';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Inventory = ({ initialTab, onTabChange }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    setActiveTab(initialTab || 'list');
  }, [initialTab]);

  useEffect(() => {
    setActiveTab(initialTab || 'list');
  }, [initialTab]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/inventory/all/inventory/items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(response.data.inventory);
    } catch (err) {
      setError('Failed to fetch inventory');
      console.error('Fetch inventory error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInventory = async (itemData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/inventory/add`, itemData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(prev => [response.data.inventoryItem, ...prev]);
      setActiveTab('list');
      return { success: true };
    } catch (err) {
      console.error('Add inventory error:', err);
      return { success: false, error: err.response?.data?.error || 'Failed to add inventory item' };
    }
  };

  const handleUpdateInventory = async (id, itemData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/api/inventory/update/item/${id}`, itemData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(prev => prev.map(item => 
        item._id === id ? response.data.inventoryItem : item
      ));
      setEditingItem(null);
      return { success: true };
    } catch (err) {
      console.error('Update inventory error:', err);
      return { success: false, error: err.response?.data?.error || 'Failed to update inventory item' };
    }
  };

  const handleRestock = async (id, quantity) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`${API_BASE_URL}/api/inventory/update/restock/${id}`, 
        { quantity },
        { headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(prev => prev.map(item => 
        item._id === id ? response.data.inventoryItem : item
      ));
      return { success: true };
    } catch (err) {
      console.error('Restock error:', err);
      return { success: false, error: err.response?.data?.error || 'Failed to restock item' };
    }
  };

  const handleDeleteInventory = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/inventory/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(prev => prev.filter(item => item._id !== id));
      return { success: true };
    } catch (err) {
      console.error('Delete inventory error:', err);
      return { success: false, error: err.response?.data?.error || 'Failed to delete inventory item' };
    }
  };

  const lowStockCount = inventory.filter(item => item.isLowStock).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
          {lowStockCount > 0 && (
            <div className="flex items-center mt-2 text-orange-600">
              <FiAlertTriangle className="mr-2" />
              <span className="text-sm">{lowStockCount} item(s) low on stock</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setActiveTab('list');
              onTabChange && onTabChange('list');
            }}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FiPackage />
            <span>Inventory</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('smart');
              onTabChange && onTabChange('smart');
            }}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === 'smart' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FiCpu />
            <span>Smart Inventory</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('vendor');
              onTabChange && onTabChange('vendor');
            }}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === 'vendor' 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FiUsers />
            <span>Vendors</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('add');
              onTabChange && onTabChange('add');
            }}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === 'add' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FiPlus />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {activeTab === 'list' && (
        <InventoryList
          inventory={inventory}
          onUpdate={handleUpdateInventory}
          onRestock={handleRestock}
          onRefresh={fetchInventory}
          onEdit={(item) => {
            setEditingItem(item);
            setActiveTab('edit');
          }}
          onDelete={handleDeleteInventory}
        />
      )}

      {activeTab === 'smart' && (
        <SmartInventory />
      )}

      {activeTab === 'vendor' && (
        <Vendor />
      )}

      {activeTab === 'add' && (
        <AddInventory
          onAdd={handleAddInventory}
          onCancel={() => {
            setActiveTab('list');
            onTabChange && onTabChange('list');
          }}
        />
      )}

      {activeTab === 'edit' && editingItem && (
        <EditInventory
          item={editingItem}
          onUpdate={handleUpdateInventory}
          onCancel={() => {
            setEditingItem(null);
            setActiveTab('list');
            onTabChange && onTabChange('list');
          }}
        />
      )}
    </div>
  );
};

export default Inventory;
