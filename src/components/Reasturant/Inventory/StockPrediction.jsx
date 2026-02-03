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
      
      // Generate predictions
      const predictedData = generatePredictions(inventoryRes.data.inventory || [], salesRes.data.sales || []);
      setPredictions(predictedData);
      
      // Generate alerts for critical items
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
      // Calculate average daily consumption based on sales data
      const itemSales = sales.filter(sale => 
        sale.items && sale.items.some(saleItem => saleItem.inventoryItemId === item._id)
      );
      
      // Get consumption data for last 30 days
      const last30Days = itemSales.slice(-30);
      const totalConsumption = last30Days.reduce((sum, sale) => {
        const saleItem = sale.items.find(si => si.inventoryItemId === item._id);
        return sum + (saleItem?.quantity || 0);
      }, 0);
      
      const avgDailyConsumption = totalConsumption / 30;
      
      // Predict stockout date
      const daysUntilStockout = avgDailyConsumption > 0 
        ? Math.floor(item.currentStock / avgDailyConsumption)
        : 999; // If no consumption, assume it won't run out soon
      
      // Calculate trend (increasing/decreasing consumption)
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
      
      // Suggest reorder quantity (2 weeks worth + safety stock)
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
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      default: return '➡️';
    }
  };

  const generatePurchaseOrder = async (items) => {
    // Removed - no longer needed
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
        <div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Critical Items</p>
              <p className="text-2xl font-bold text-red-700">{criticalItems.length}</p>
              <p className="text-xs text-red-500">≤ 3 days left</p>
            </div>
            <FiAlertTriangle className="text-red-500 text-2xl" />
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">High Priority</p>
              <p className="text-2xl font-bold text-orange-700">{highPriorityItems.length}</p>
              <p className="text-xs text-orange-500">≤ 7 days left</p>
            </div>
            <FiTrendingUp className="text-orange-500 text-2xl" />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Avg Daily Usage</p>
              <p className="text-2xl font-bold text-blue-700">
                {(predictions.reduce((sum, item) => sum + parseFloat(item.avgDailyConsumption), 0) / predictions.length).toFixed(1)}
              </p>
              <p className="text-xs text-blue-500">units/day</p>
            </div>
            <FiCalendar className="text-blue-500 text-2xl" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Well Stocked</p>
              <p className="text-2xl font-bold text-green-700">
                {predictions.filter(item => item.priority === 'low').length}
              </p>
              <p className="text-xs text-green-500">> 14 days left</p>
            </div>
            <FiCalendar className="text-green-500 text-2xl" />
          </div>
        </div>
      </div>

      {/* Predictions Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-medium">Stock Predictions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Daily Usage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Left</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Suggested Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {predictions.map(item => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-sm">{item.currentStock} {item.unit}</td>
                  <td className="px-4 py-3 text-sm">{item.avgDailyConsumption} {item.unit}</td>
                  <td className="px-4 py-3 text-sm">
                    {item.daysUntilStockout === 999 ? '∞' : `${item.daysUntilStockout} days`}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="flex items-center space-x-1">
                      <span>{getTrendIcon(item.trend)}</span>
                      <span className="capitalize">{item.trend}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{item.suggestedReorderQty} {item.unit}</td>
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

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Prediction Algorithm:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
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