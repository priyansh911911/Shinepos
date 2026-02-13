import React, { useState, useEffect } from 'react';
import { FiCalendar, FiTrendingUp, FiDollarSign, FiShoppingCart, FiDownload } from 'react-icons/fi';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SalesReport = () => {
  const [dateRange, setDateRange] = useState('today');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSalesData();
  }, [dateRange, customDates]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = { filter: dateRange };
      if (dateRange === 'custom') {
        params.startDate = customDates.start;
        params.endDate = customDates.end;
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setSalesData(response.data.stats);
    } catch (error) {
      console.error('Sales report error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/reports/sales/export`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { format, filter: dateRange, ...customDates },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Sales Report</h1>
        <div className="flex gap-2">
          <button
            onClick={() => exportReport('excel')}
            className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 border border-white/20 flex items-center gap-2 transition-all"
          >
            <FiDownload size={16} />
            Excel
          </button>
          <button
            onClick={() => exportReport('pdf')}
            className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 border border-white/20 flex items-center gap-2 transition-all"
          >
            <FiDownload size={16} />
            PDF
          </button>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <FiCalendar className="text-white/70" />
            <span className="font-medium text-white">Period:</span>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white"
          >
            <option value="today">Today</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
          
          {dateRange === 'custom' && (
            <div className="flex gap-2">
              <input
                type="date"
                value={customDates.start}
                onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white"
              />
              <span className="text-white">to</span>
              <input
                type="date"
                value={customDates.end}
                onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white"
              />
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-white">Loading...</div>
      ) : salesData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-400">₹{salesData.revenue?.toLocaleString()}</p>
                </div>
                <FiDollarSign className="text-green-400" size={24} />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Total Orders</p>
                  <p className="text-2xl font-bold text-blue-400">{salesData.orders}</p>
                </div>
                <FiShoppingCart className="text-blue-400" size={24} />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Avg Order Value</p>
                  <p className="text-2xl font-bold text-purple-400">₹{salesData.avgOrderValue?.toFixed(2)}</p>
                </div>
                <FiTrendingUp className="text-purple-400" size={24} />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Cash Payments</p>
                  <p className="text-2xl font-bold text-orange-400">{salesData.cashPercentage}%</p>
                </div>
                <FiTrendingUp className="text-orange-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Payment Methods</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{salesData.cashPercentage}%</div>
                <div className="text-sm text-white/70">Cash</div>
                <div className="text-sm text-white/50">₹{salesData.cashPayments?.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{salesData.cardPercentage}%</div>
                <div className="text-sm text-white/70">Card</div>
                <div className="text-sm text-white/50">₹{salesData.cardPayments?.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{salesData.upiPercentage}%</div>
                <div className="text-sm text-white/70">UPI</div>
                <div className="text-sm text-white/50">₹{salesData.upiPayments?.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-white/70">No data available</div>
      )}
    </div>
  );
};

export default SalesReport;