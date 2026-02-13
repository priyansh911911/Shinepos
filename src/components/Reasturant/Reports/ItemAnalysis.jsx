import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiPackage } from 'react-icons/fi';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ItemAnalysis = () => {
  const [itemData, setItemData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('revenue');

  useEffect(() => {
    fetchItemAnalysis();
  }, []);

  const fetchItemAnalysis = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mock item analysis data based on category breakdown
      const mockItems = [
        { name: 'Margherita Pizza', category: 'Pizza', quantity: 45, revenue: 13500, cost: 6750, profit: 6750, margin: 50 },
        { name: 'Chicken Burger', category: 'Burgers', quantity: 32, revenue: 9600, cost: 5760, profit: 3840, margin: 40 },
        { name: 'Caesar Salad', category: 'Salads', quantity: 28, revenue: 5600, cost: 2240, profit: 3360, margin: 60 },
        { name: 'Pasta Alfredo', category: 'Pasta', quantity: 25, revenue: 7500, cost: 3750, profit: 3750, margin: 50 },
        { name: 'Fish & Chips', category: 'Mains', quantity: 20, revenue: 8000, cost: 5600, profit: 2400, margin: 30 }
      ];
      setItemData(mockItems);
    } catch (error) {
      console.error('Item analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedItems = [...itemData].sort((a, b) => {
    switch (sortBy) {
      case 'revenue': return b.revenue - a.revenue;
      case 'quantity': return b.quantity - a.quantity;
      case 'profit': return b.profit - a.profit;
      case 'margin': return b.margin - a.margin;
      default: return 0;
    }
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Item Profitability Analysis</h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white"
        >
          <option value="revenue">Sort by Revenue</option>
          <option value="quantity">Sort by Quantity</option>
          <option value="profit">Sort by Profit</option>
          <option value="margin">Sort by Margin</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-white">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Top Item Revenue</p>
                  <p className="text-2xl font-bold text-green-400">₹{sortedItems[0]?.revenue?.toLocaleString()}</p>
                  <p className="text-sm text-white/50">{sortedItems[0]?.name}</p>
                </div>
                <FiDollarSign className="text-green-400" size={24} />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Best Margin</p>
                  <p className="text-2xl font-bold text-blue-400">{Math.max(...itemData.map(i => i.margin))}%</p>
                  <p className="text-sm text-white/50">{itemData.find(i => i.margin === Math.max(...itemData.map(i => i.margin)))?.name}</p>
                </div>
                <FiTrendingUp className="text-blue-400" size={24} />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Most Sold</p>
                  <p className="text-2xl font-bold text-purple-400">{Math.max(...itemData.map(i => i.quantity))}</p>
                  <p className="text-sm text-white/50">{itemData.find(i => i.quantity === Math.max(...itemData.map(i => i.quantity)))?.name}</p>
                </div>
                <FiPackage className="text-purple-400" size={24} />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Total Profit</p>
                  <p className="text-2xl font-bold text-orange-400">₹{itemData.reduce((sum, item) => sum + item.profit, 0).toLocaleString()}</p>
                </div>
                <FiTrendingUp className="text-orange-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/20">
              <h3 className="text-lg font-semibold text-white">Item Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Profit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {sortedItems.map((item, index) => (
                    <tr key={index} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-white">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white/70">{item.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-400 font-medium">₹{item.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-red-400">₹{item.cost.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-blue-400 font-medium">₹{item.profit.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.margin >= 50 ? 'bg-green-400/20 text-green-400' :
                          item.margin >= 30 ? 'bg-yellow-400/20 text-yellow-400' :
                          'bg-red-400/20 text-red-400'
                        }`}>
                          {item.margin}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ItemAnalysis;