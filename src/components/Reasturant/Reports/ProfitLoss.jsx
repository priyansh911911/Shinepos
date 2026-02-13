import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiDownload } from 'react-icons/fi';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProfitLoss = () => {
  const [plData, setPLData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchPLData();
  }, [period, selectedDate]);

  const fetchPLData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mock P&L data
      const mockPLData = {
        revenue: {
          foodSales: 120000,
          beverageSales: 25000,
          otherIncome: 5000,
          total: 150000
        },
        cogs: {
          foodCost: 36000, // 30% of food sales
          beverageCost: 10000, // 40% of beverage sales
          total: 46000
        },
        grossProfit: 104000,
        operatingExpenses: {
          salaries: 35000,
          rent: 15000,
          utilities: 5000,
          marketing: 3000,
          maintenance: 2000,
          insurance: 1500,
          other: 3500,
          total: 65000
        },
        ebitda: 39000,
        depreciation: 2000,
        interest: 1000,
        netProfit: 36000,
        margins: {
          grossMargin: 69.33,
          ebitdaMargin: 26.00,
          netMargin: 24.00
        },
        comparison: {
          lastPeriod: {
            revenue: 140000,
            netProfit: 32000
          },
          growth: {
            revenue: 7.14,
            netProfit: 12.50
          }
        }
      };
      
      setPLData(mockPLData);
    } catch (error) {
      console.error('P&L data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportPL = (format) => {
    if (!plData) return;
    
    const data = {
      period: selectedDate,
      revenue: plData.revenue,
      cogs: plData.cogs,
      grossProfit: plData.grossProfit,
      operatingExpenses: plData.operatingExpenses,
      netProfit: plData.netProfit,
      margins: plData.margins
    };
    
    if (format === 'pdf') {
      // Mock PDF export
      console.log('Exporting P&L as PDF...');
    } else {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `profit-loss-${selectedDate}.json`;
      link.click();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Profit & Loss Statement</h1>
        <div className="flex gap-2">
          <button
            onClick={() => exportPL('excel')}
            className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 border border-white/20 flex items-center gap-2 transition-all"
          >
            <FiDownload size={16} />
            Excel
          </button>
          <button
            onClick={() => exportPL('pdf')}
            className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 border border-white/20 flex items-center gap-2 transition-all"
          >
            <FiDownload size={16} />
            PDF
          </button>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="font-medium text-white">Period:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          
          <input
            type="month"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-white">Loading...</div>
      ) : plData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-400">₹{plData.revenue.total?.toLocaleString()}</p>
                  <p className="text-sm text-green-400">+{plData.comparison.growth.revenue}%</p>
                </div>
                <FiDollarSign className="text-green-400" size={24} />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Gross Profit</p>
                  <p className="text-2xl font-bold text-blue-400">₹{plData.grossProfit?.toLocaleString()}</p>
                  <p className="text-sm text-blue-400">{plData.margins.grossMargin}% margin</p>
                </div>
                <FiTrendingUp className="text-blue-400" size={24} />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">EBITDA</p>
                  <p className="text-2xl font-bold text-purple-400">₹{plData.ebitda?.toLocaleString()}</p>
                  <p className="text-sm text-purple-400">{plData.margins.ebitdaMargin}% margin</p>
                </div>
                <FiTrendingUp className="text-purple-400" size={24} />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Net Profit</p>
                  <p className="text-2xl font-bold text-orange-400">₹{plData.netProfit?.toLocaleString()}</p>
                  <p className="text-sm text-orange-400">+{plData.comparison.growth.netProfit}%</p>
                </div>
                <FiTrendingUp className="text-orange-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/20">
              <h3 className="text-lg font-semibold text-white">Profit & Loss Statement</h3>
              <p className="text-sm text-white/70">For the period: {selectedDate}</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Revenue Section */}
              <div>
                <h4 className="font-semibold text-white mb-3">REVENUE</h4>
                <div className="space-y-2 ml-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Food Sales</span>
                    <span className="text-white">₹{plData.revenue.foodSales?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Beverage Sales</span>
                    <span className="text-white">₹{plData.revenue.beverageSales?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Other Income</span>
                    <span className="text-white">₹{plData.revenue.otherIncome?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-white/20 pt-2">
                    <span className="text-white">Total Revenue</span>
                    <span className="text-white">₹{plData.revenue.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* COGS Section */}
              <div>
                <h4 className="font-semibold text-white mb-3">COST OF GOODS SOLD</h4>
                <div className="space-y-2 ml-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Food Cost</span>
                    <span className="text-red-400">₹{plData.cogs.foodCost?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Beverage Cost</span>
                    <span className="text-red-400">₹{plData.cogs.beverageCost?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-white/20 pt-2">
                    <span className="text-white">Total COGS</span>
                    <span className="text-red-400">₹{plData.cogs.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Gross Profit */}
              <div className="bg-green-400/20 backdrop-blur-md p-4 rounded-lg border border-green-400/30">
                <div className="flex justify-between font-semibold text-green-400">
                  <span>GROSS PROFIT</span>
                  <span>₹{plData.grossProfit?.toLocaleString()}</span>
                </div>
                <div className="text-sm text-green-400/80 text-right">
                  {plData.margins.grossMargin}% margin
                </div>
              </div>

              {/* Operating Expenses */}
              <div>
                <h4 className="font-semibold text-white mb-3">OPERATING EXPENSES</h4>
                <div className="space-y-2 ml-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Salaries & Benefits</span>
                    <span className="text-red-400">₹{plData.operatingExpenses.salaries?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Rent</span>
                    <span className="text-red-400">₹{plData.operatingExpenses.rent?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Utilities</span>
                    <span className="text-red-400">₹{plData.operatingExpenses.utilities?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Marketing</span>
                    <span className="text-red-400">₹{plData.operatingExpenses.marketing?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Maintenance</span>
                    <span className="text-red-400">₹{plData.operatingExpenses.maintenance?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Insurance</span>
                    <span className="text-red-400">₹{plData.operatingExpenses.insurance?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Other Expenses</span>
                    <span className="text-red-400">₹{plData.operatingExpenses.other?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-white/20 pt-2">
                    <span className="text-white">Total Operating Expenses</span>
                    <span className="text-red-400">₹{plData.operatingExpenses.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* EBITDA */}
              <div className="bg-blue-400/20 backdrop-blur-md p-4 rounded-lg border border-blue-400/30">
                <div className="flex justify-between font-semibold text-blue-400">
                  <span>EBITDA</span>
                  <span>₹{plData.ebitda?.toLocaleString()}</span>
                </div>
                <div className="text-sm text-blue-400/80 text-right">
                  {plData.margins.ebitdaMargin}% margin
                </div>
              </div>

              {/* Other Expenses */}
              <div>
                <div className="space-y-2 ml-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Depreciation</span>
                    <span className="text-red-400">₹{plData.depreciation?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Interest Expense</span>
                    <span className="text-red-400">₹{plData.interest?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div className="bg-green-400/30 backdrop-blur-md p-4 rounded-lg border-2 border-green-400/50">
                <div className="flex justify-between font-bold text-green-400 text-lg">
                  <span>NET PROFIT</span>
                  <span>₹{plData.netProfit?.toLocaleString()}</span>
                </div>
                <div className="text-sm text-green-400/80 text-right">
                  {plData.margins.netMargin}% margin
                </div>
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

export default ProfitLoss;