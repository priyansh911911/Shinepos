import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiArrowLeft, FiPlus, FiTrash2, FiSave } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VendorCreateOrder = ({ onBack, onOrderCreated }) => {
  const [vendors, setVendors] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [newOrder, setNewOrder] = useState({
    vendorId: '',
    vendorName: '',
    items: [{ inventoryItemId: '', itemName: '', quantity: 1, unitPrice: 0, total: 0 }],
    totalAmount: 0,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [vendorsRes, inventoryRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/inventory/vendors`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/inventory/all/inventory/items`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setVendors(vendorsRes.data.vendors || []);
      setInventory(inventoryRes.data.inventory || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const addItem = () => {
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, { inventoryItemId: '', itemName: '', quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const removeItem = (index) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
    calculateTotal();
  };

  const updateItem = (index, field, value) => {
    setNewOrder(prev => {
      const updatedItems = prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          
          if (field === 'inventoryItemId') {
            const inventoryItem = inventory.find(inv => inv._id === value);
            updatedItem.itemName = inventoryItem?.name || '';
            updatedItem.unitPrice = inventoryItem?.costPerUnit || 0;
          }
          
          if (field === 'quantity' || field === 'unitPrice' || field === 'inventoryItemId') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          
          return updatedItem;
        }
        return item;
      });
      
      const totalAmount = updatedItems.reduce((sum, item) => sum + item.total, 0);
      
      return {
        ...prev,
        items: updatedItems,
        totalAmount
      };
    });
  };

  const updateVendor = (vendorId) => {
    const vendor = vendors.find(v => v._id === vendorId);
    setNewOrder(prev => ({
      ...prev,
      vendorId,
      vendorName: vendor?.name || ''
    }));
  };

  const calculateTotal = () => {
    const total = newOrder.items.reduce((sum, item) => sum + item.total, 0);
    setNewOrder(prev => ({ ...prev, totalAmount: total }));
  };

  const createOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/inventory/purchase-orders`, newOrder, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onOrderCreated();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <FiArrowLeft />
        </button>
        <div>
          <h2 className="text-xl font-semibold">Create Purchase Order</h2>
          <p className="text-gray-600">Place a new order with vendor</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Select Vendor</label>
            <select
              value={newOrder.vendorId}
              onChange={(e) => updateVendor(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Choose Vendor</option>
              {vendors.map(vendor => (
                <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Order Date</label>
            <input
              type="date"
              value={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border rounded-lg"
              readOnly
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Order Items</h3>
            <button
              onClick={addItem}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg flex items-center space-x-1 text-sm"
            >
              <FiPlus className="w-3 h-3" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="space-y-3">
            {newOrder.items.map((item, index) => (
              <div key={index} className="flex space-x-2 items-center bg-gray-50 p-3 rounded-lg">
                <select
                  value={item.inventoryItemId}
                  onChange={(e) => updateItem(index, 'inventoryItemId', e.target.value)}
                  className="flex-1 p-2 border rounded-lg"
                >
                  <option value="">Select Item</option>
                  {inventory.map(inv => (
                    <option key={inv._id} value={inv._id}>{inv.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                  className="w-20 p-2 border rounded-lg"
                  min="1"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  className="w-24 p-2 border rounded-lg"
                  step="0.01"
                />
                <div className="w-24 p-2 bg-gray-100 rounded-lg text-center">
                  ₹{item.total.toFixed(2)}
                </div>
                <button
                  onClick={() => removeItem(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
          <textarea
            value={newOrder.notes}
            onChange={(e) => setNewOrder(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Special instructions or notes for vendor"
            className="w-full p-2 border rounded-lg"
            rows="3"
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-xl font-bold">
            Total: ₹{newOrder.totalAmount.toFixed(2)}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={createOrder}
              className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2"
              disabled={!newOrder.vendorId || newOrder.items.length === 0}
            >
              <FiSave />
              <span>Create Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorCreateOrder;
