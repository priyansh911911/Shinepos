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
        <div></div>
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
        <div className="bg-red-50/20 p-4 rounded-lg border border-red-200/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-300 text-sm font-medium">Total Wastage (This Month)</p>
              <p className="text-2xl font-bold text-red-200">{analytics.totalWastage.toFixed(1)} units</p>
            </div>
            <FiTrendingDown className="text-red-400 text-2xl" />
          </div>
        </div>

        <div className="bg-orange-50/20 p-4 rounded-lg border border-orange-200/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300 text-sm font-medium">Wastage Cost</p>
              <p className="text-2xl font-bold text-orange-200">₹{analytics.totalCost.toFixed(2)}</p>
            </div>
            <FiDollarSign className="text-orange-400 text-2xl" />
          </div>
        </div>

        <div className="bg-yellow-50/20 p-4 rounded-lg border border-yellow-200/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-sm font-medium">Weekly Average</p>
              <p className="text-2xl font-bold text-yellow-200">
                {(getWastageByPeriod(7).length / 7).toFixed(1)} items/day
              </p>
            </div>
            <FiCalendar className="text-yellow-400 text-2xl" />
          </div>
        </div>
      </div>

      {showAddWastage && (
        <div className="bg-white/20 backdrop-blur-2xl rounded-2xl p-6">
          <h3 className="text-lg font-medium mb-4 text-white">Record Wastage</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Inventory Item</label>
              <select
                value={newWastage.inventoryItemId}
                onChange={(e) => setNewWastage(prev => ({ ...prev, inventoryItemId: e.target.value }))}
                className="w-full p-2 border border-white/30 rounded-lg bg-white/10 text-white"
              >
                <option value="">Select Item</option>
                {inventory.map(item => (
                  <option key={item._id} value={item._id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Quantity Wasted</label>
              <input
                type="number"
                value={newWastage.quantity}
                onChange={(e) => setNewWastage(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                className="w-full p-2 border border-white/30 rounded-lg bg-white/10 text-white"
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Reason</label>
              <select
                value={newWastage.reason}
                onChange={(e) => setNewWastage(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full p-2 border border-white/30 rounded-lg bg-white/10 text-white"
              >
                <option value="">Select Reason</option>
                {wastageReasons.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Date</label>
              <input
                type="date"
                value={newWastage.date}
                onChange={(e) => setNewWastage(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-2 border border-white/30 rounded-lg bg-white/10 text-white"
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
              className="px-4 py-2 bg-white/20 text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Top Wasted Items */}
      <div className="bg-white/20 backdrop-blur-2xl rounded-2xl animate-fadeIn">
        <div className="p-4 border-b border-white/30">
          <h3 className="font-medium text-white">Top Wasted Items (By Cost)</h3>
        </div>
        <div className="divide-y divide-white/20">
          {analytics.topWastedItems.map(([itemName, data], index) => (
            <div key={itemName} className="p-4 flex justify-between items-center">
              <div>
                <span className="font-medium text-white">{itemName}</span>
                <span className="text-sm text-gray-300 ml-2">{data.quantity} units</span>
              </div>
              <span className="text-red-400 font-medium">₹{data.cost.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Wastage Records */}
      <div className="bg-white/20 backdrop-blur-2xl rounded-2xl animate-fadeIn">
        <div className="p-4 border-b border-white/30">
          <h3 className="font-medium text-white">Recent Wastage Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Item</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Cost</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {wastageRecords.slice(0, 10).map(record => {
                const item = inventory.find(inv => inv._id === record.inventoryItemId);
                const cost = record.quantity * (item?.costPerUnit || 0);
                return (
                  <tr key={record._id} className="hover:bg-white/10">
                    <td className="px-4 py-3 text-sm text-white">{item?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{record.quantity} {item?.unit}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{record.reason}</td>
                    <td className="px-4 py-3 text-sm text-red-400">₹{cost.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{new Date(record.date).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50/20 p-4 rounded-lg border border-blue-200/30">
        <h3 className="font-medium text-blue-300 mb-2">Wastage Reduction Tips:</h3>
        <ul className="text-sm text-blue-200 space-y-1">
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
