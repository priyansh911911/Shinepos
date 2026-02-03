import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiTrendingDown, FiCalendar, FiDollarSign } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const WastageTracking = ({ onAlert, showAddWastage, setShowAddWastage }) => {
  const [wastageRecords, setWastageRecords] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [newWastage, setNewWastage] = useState({
    inventoryItemId: '',
    quantity: 0,
    reason: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [analytics, setAnalytics] = useState({
    totalWastage: 0,
    totalCost: 0,
    topWastedItems: []
  });

  const wastageReasons = [
    'Expired',
    'Spoiled',
    'Overcooked',
    'Customer Return',
    'Preparation Error',
    'Equipment Failure',
    'Other'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [wastageRes, inventoryRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/inventory/wastage`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/inventory/all/inventory/items`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setWastageRecords(wastageRes.data.wastage || []);
      setInventory(inventoryRes.data.inventory || []);
      calculateAnalytics(wastageRes.data.wastage || [], inventoryRes.data.inventory || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const calculateAnalytics = (wastage, inventory) => {
    const totalWastage = wastage.reduce((sum, record) => sum + record.quantity, 0);
    const totalCost = wastage.reduce((sum, record) => {
      const item = inventory.find(inv => inv._id === record.inventoryItemId);
      return sum + (record.quantity * (item?.costPerUnit || 0));
    }, 0);

    const itemWastage = {};
    wastage.forEach(record => {
      const item = inventory.find(inv => inv._id === record.inventoryItemId);
      if (item) {
        if (!itemWastage[item.name]) {
          itemWastage[item.name] = { quantity: 0, cost: 0 };
        }
        itemWastage[item.name].quantity += record.quantity;
        itemWastage[item.name].cost += record.quantity * item.costPerUnit;
      }
    });

    const topWastedItems = Object.entries(itemWastage)
      .sort((a, b) => b[1].cost - a[1].cost)
      .slice(0, 5);

    setAnalytics({ totalWastage, totalCost, topWastedItems });

    // Generate alerts for high wastage
    if (totalCost > 1000) {
      onAlert([`High wastage cost detected: ₹${totalCost.toFixed(2)} this month`]);
    }
  };

  const addWastageRecord = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/inventory/wastage`, newWastage, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNewWastage({
        inventoryItemId: '',
        quantity: 0,
        reason: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddWastage(false);
      fetchData();
      onAlert(['Wastage record added successfully']);
    } catch (error) {
      console.error('Error adding wastage record:', error);
      onAlert(['Failed to add wastage record']);
    }
  };

  const getWastageByPeriod = (days) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return wastageRecords.filter(record => 
      new Date(record.date) >= cutoffDate
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
        </div>
        <button
          onClick={() => setShowAddWastage(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center space-x-2"
          style={{ display: 'none' }}
        >
          <FiPlus />
          <span>Record Wastage</span>
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Total Wastage (This Month)</p>
              <p className="text-2xl font-bold text-red-700">{analytics.totalWastage.toFixed(1)} units</p>
            </div>
            <FiTrendingDown className="text-red-500 text-2xl" />
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Wastage Cost</p>
              <p className="text-2xl font-bold text-orange-700">₹{analytics.totalCost.toFixed(2)}</p>
            </div>
            <FiDollarSign className="text-orange-500 text-2xl" />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Weekly Average</p>
              <p className="text-2xl font-bold text-yellow-700">
                {(getWastageByPeriod(7).length / 7).toFixed(1)} items/day
              </p>
            </div>
            <FiCalendar className="text-yellow-500 text-2xl" />
          </div>
        </div>
      </div>

      {showAddWastage && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Record Wastage</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Inventory Item</label>
              <select
                value={newWastage.inventoryItemId}
                onChange={(e) => setNewWastage(prev => ({ ...prev, inventoryItemId: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select Item</option>
                {inventory.map(item => (
                  <option key={item._id} value={item._id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Quantity Wasted</label>
              <input
                type="number"
                value={newWastage.quantity}
                onChange={(e) => setNewWastage(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                className="w-full p-2 border rounded-lg"
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Reason</label>
              <select
                value={newWastage.reason}
                onChange={(e) => setNewWastage(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select Reason</option>
                {wastageReasons.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={newWastage.date}
                onChange={(e) => setNewWastage(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={addWastageRecord}
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Record Wastage
            </button>
            <button
              onClick={() => setShowAddWastage(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Top Wasted Items */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-medium">Top Wasted Items (By Cost)</h3>
        </div>
        <div className="divide-y">
          {analytics.topWastedItems.map(([itemName, data], index) => (
            <div key={itemName} className="p-4 flex justify-between items-center">
              <div>
                <span className="font-medium">{itemName}</span>
                <span className="text-sm text-gray-500 ml-2">{data.quantity} units</span>
              </div>
              <span className="text-red-600 font-medium">₹{data.cost.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Wastage Records */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-medium">Recent Wastage Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {wastageRecords.slice(0, 10).map(record => {
                const item = inventory.find(inv => inv._id === record.inventoryItemId);
                const cost = record.quantity * (item?.costPerUnit || 0);
                return (
                  <tr key={record._id}>
                    <td className="px-4 py-3 text-sm">{item?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm">{record.quantity} {item?.unit}</td>
                    <td className="px-4 py-3 text-sm">{record.reason}</td>
                    <td className="px-4 py-3 text-sm text-red-600">₹{cost.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">{new Date(record.date).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Wastage Reduction Tips:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Monitor expiry dates and implement FIFO (First In, First Out)</li>
          <li>• Train staff on proper storage and handling procedures</li>
          <li>• Adjust portion sizes based on customer feedback</li>
          <li>• Use predictive ordering to avoid overstocking</li>
        </ul>
      </div>
    </div>
  );
};

export default WastageTracking;