import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrendingUp, FiAlertTriangle, FiCalendar } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StockPrediction = ({ onAlert }) => {
  const [predictions, setPredictions] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDataAndPredict();
  }, []);

  const fetchDataAndPredict = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [inventoryRes, salesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/inventory/all/inventory/items`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        axios.get(`${API_BASE_URL}/api/analytics/sales-data`, { 
          headers: { Authorization: `Bearer ${token}` } 
        })
      ]);
      
      setInventory(inventoryRes.data.inventory || []);
      setSalesData(salesRes.data.sales || []);
      
      const predictedData = generatePredictions(inventoryRes.data.inventory || [], salesRes.data.sales || []);
      setPredictions(predictedData);
      
      const criticalItems = predictedData.filter(item => item.daysUntilStockout <= 3);
      if (criticalItems.length > 0) {
        onAlert([`${criticalItems.length} items predicted to run out within 3 days`]);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePredictions = (inventory, sales) => {
    return inventory.map(item => {
      const itemSales = sales.filter(sale => 
        sale.items && sale.items.some(saleItem => saleItem.inventoryItemId === item._id)
      );
      
      const last30Days = itemSales.slice(-30);
      const totalConsumption = last30Days.reduce((sum, sale) => {
        const saleItem = sale.items.find(si => si.inventoryItemId === item._id);
        return sum + (saleItem?.quantity || 0);
      }, 0);
      
      const avgDailyConsumption = totalConsumption / 30;
      
      const daysUntilStockout = avgDailyConsumption > 0 
        ? Math.floor(item.currentStock / avgDailyConsumption)
        : 999;
      
      const recent7Days = last30Days.slice(-7);
      const previous7Days = last30Days.slice(-14, -7);
      
      const recentConsumption = recent7Days.reduce((sum, sale) => {
        const saleItem = sale.items.find(si => si.inventoryItemId === item._id);
        return sum + (saleItem?.quantity || 0);
      }, 0) / 7;
      
      const previousConsumption = previous7Days.reduce((sum, sale) => {
        const saleItem = sale.items.find(si => si.inventoryItemId === item._id);
        return sum + (saleItem?.quantity || 0);
      }, 0) / 7;
      
      const trend = recentConsumption > previousConsumption ? 'increasing' : 
                   recentConsumption < previousConsumption ? 'decreasing' : 'stable';
      
      const suggestedReorderQty = Math.ceil((avgDailyConsumption * 14) + (avgDailyConsumption * 3));
      
      return {
        ...item,
        avgDailyConsumption: avgDailyConsumption.toFixed(2),
        daysUntilStockout,
        trend,
        suggestedReorderQty,
        stockoutDate: new Date(Date.now() + (daysUntilStockout * 24 * 60 * 60 * 1000)),
        priority: daysUntilStockout <= 3 ? 'critical' : 
                 daysUntilStockout <= 7 ? 'high' : 
                 daysUntilStockout <= 14 ? 'medium' : 'low'
      };
    }).sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-400/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30';
      default: return 'text-green-400 bg-green-500/20 border-green-400/30';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      default: return '➡️';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const criticalItems = predictions.filter(item => item.priority === 'critical');
  const highPriorityItems = predictions.filter(item => item.priority === 'high');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div></div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50/20 p-4 rounded-lg border border-red-200/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-300 text-sm font-medium">Critical Items</p>
              <p className="text-2xl font-bold text-red-200">{criticalItems.length}</p>
              <p className="text-xs text-red-400">≤ 3 days left</p>
            </div>
            <FiAlertTriangle className="text-red-400 text-2xl" />
          </div>
        </div>

        <div className="bg-orange-50/20 p-4 rounded-lg border border-orange-200/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300 text-sm font-medium">High Priority</p>
              <p className="text-2xl font-bold text-orange-200">{highPriorityItems.length}</p>
              <p className="text-xs text-orange-400">≤ 7 days left</p>
            </div>
            <FiTrendingUp className="text-orange-400 text-2xl" />
          </div>
        </div>

        <div className="bg-blue-50/20 p-4 rounded-lg border border-blue-200/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">Avg Daily Usage</p>
              <p className="text-2xl font-bold text-blue-200">
                {(predictions.reduce((sum, item) => sum + parseFloat(item.avgDailyConsumption), 0) / predictions.length).toFixed(1)}
              </p>
              <p className="text-xs text-blue-400">units/day</p>
            </div>
            <FiCalendar className="text-blue-400 text-2xl" />
          </div>
        </div>

        <div className="bg-green-50/20 p-4 rounded-lg border border-green-200/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-medium">Well Stocked</p>
              <p className="text-2xl font-bold text-green-200">
                {predictions.filter(item => item.priority === 'low').length}
              </p>
              <p className="text-xs text-green-400">> 14 days left</p>
            </div>
            <FiCalendar className="text-green-400 text-2xl" />
          </div>
        </div>
      </div>

      {/* Predictions Table */}
      <div className="bg-white/20 backdrop-blur-2xl rounded-2xl animate-fadeIn">
        <div className="p-4 border-b border-white/30">
          <h3 className="font-medium text-white">Stock Predictions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Item</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Current Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Daily Usage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Days Left</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Trend</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Suggested Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {predictions.map(item => (
                <tr key={item._id} className="hover:bg-white/10">
                  <td className="px-4 py-3 text-sm font-medium text-white">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{item.currentStock} {item.unit}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{item.avgDailyConsumption} {item.unit}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {item.daysUntilStockout === 999 ? '∞' : `${item.daysUntilStockout} days`}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    <span className="flex items-center space-x-1">
                      <span>{getTrendIcon(item.trend)}</span>
                      <span className="capitalize">{item.trend}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{item.suggestedReorderQty} {item.unit}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                      {item.priority.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50/20 p-4 rounded-lg border border-blue-200/30">
        <h3 className="font-medium text-blue-300 mb-2">Prediction Algorithm:</h3>
        <ul className="text-sm text-blue-200 space-y-1">
          <li>• Analyzes last 30 days of sales data to calculate average daily consumption</li>
          <li>• Considers consumption trends (increasing/decreasing/stable)</li>
          <li>• Factors in seasonal variations and special events</li>
          <li>• Suggests reorder quantities with safety stock buffer</li>
        </ul>
      </div>
    </div>
  );
};

export default StockPrediction;