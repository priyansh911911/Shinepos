import React, { useState, useEffect } from 'react';
import { FiFileText, FiDownload, FiCalendar, FiPercent } from 'react-icons/fi';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TaxReports = () => {
  const [taxData, setTaxData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchTaxData();
  }, [period, selectedMonth]);

  const fetchTaxData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mock tax data
      const mockTaxData = {
        totalSales: 150000,
        taxableAmount: 142857, // Sales / 1.05 (assuming 5% GST)
        cgst: 3571.43, // 2.5%
        sgst: 3571.43, // 2.5%
        totalTax: 7142.86,
        exemptSales: 7143,
        gstBreakdown: [
          { rate: '5%', taxableAmount: 50000, cgst: 1250, sgst: 1250, total: 2500 },
          { rate: '12%', taxableAmount: 60000, cgst: 3600, sgst: 3600, total: 7200 },
          { rate: '18%', taxableAmount: 32857, cgst: 2957.14, sgst: 2957.14, total: 5914.28 }
        ],
        monthlyData: Array.from({ length: 12 }, (_, i) => ({
          month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
          sales: Math.floor(Math.random() * 50000) + 100000,
          tax: Math.floor(Math.random() * 5000) + 5000
        }))
      };
      
      setTaxData(mockTaxData);
    } catch (error) {
      console.error('Tax data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportGSTR = (type) => {
    // Mock export functionality
    const data = {
      GSTR1: taxData?.gstBreakdown,
      GSTR3B: {
        outwardSupplies: taxData?.totalSales,
        taxLiability: taxData?.totalTax
      }
    };
    
    const blob = new Blob([JSON.stringify(data[type], null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}-${selectedMonth}.json`;
    link.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Tax Reports (GST)</h1>
        <div className="flex gap-2">
          <button
            onClick={() => exportGSTR('GSTR1')}
            className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 border border-white/20 flex items-center gap-2 transition-all"
          >
            <FiDownload size={16} />
            GSTR-1
          </button>
          <button
            onClick={() => exportGSTR('GSTR3B')}
            className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/30 border border-white/20 flex items-center gap-2 transition-all"
          >
            <FiDownload size={16} />
            GSTR-3B
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
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          
          {period === 'monthly' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white"
            />
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-white">Loading...</div>
      ) : taxData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Total Sales</p>
                  <p className="text-2xl font-bold text-green-400">₹{taxData.totalSales?.toLocaleString()}</p>
                </div>
                <FiFileText className="text-green-400" size={24} />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Taxable Amount</p>
                  <p className="text-2xl font-bold text-blue-400">₹{taxData.taxableAmount?.toLocaleString()}</p>
                </div>
                <FiPercent className="text-blue-400" size={24} />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Total GST</p>
                  <p className="text-2xl font-bold text-purple-400">₹{taxData.totalTax?.toLocaleString()}</p>
                </div>
                <FiPercent className="text-purple-400" size={24} />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Exempt Sales</p>
                  <p className="text-2xl font-bold text-orange-400">₹{taxData.exemptSales?.toLocaleString()}</p>
                </div>
                <FiFileText className="text-orange-400" size={24} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">GST Breakdown by Rate</h3>
              <div className="space-y-4">
                {taxData.gstBreakdown?.map((item, index) => (
                  <div key={index} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-lg text-white">{item.rate} GST</span>
                      <span className="text-sm text-white/70">₹{item.total.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-white/70">Taxable Amount</p>
                        <p className="font-medium text-white">₹{item.taxableAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-white/70">CGST</p>
                        <p className="font-medium text-white">₹{item.cgst.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-white/70">SGST</p>
                        <p className="font-medium text-white">₹{item.sgst.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">Monthly Tax Trend</h3>
              <div className="h-64 flex items-end justify-between gap-1">
                {taxData.monthlyData?.slice(0, 6).map((month, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="bg-purple-400 rounded-t w-8"
                      style={{
                        height: `${(month.tax / Math.max(...taxData.monthlyData.map(m => m.tax))) * 200}px`,
                        minHeight: '4px'
                      }}
                      title={`₹${month.tax.toLocaleString()}`}
                    />
                    <span className="text-xs mt-2 text-white/70">{month.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">GST Summary for Filing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-white">Outward Supplies (GSTR-1)</h4>
                <div className="bg-white/5 backdrop-blur-md p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/70">Taxable Supplies:</span>
                    <span className="text-white">₹{taxData.taxableAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Exempt Supplies:</span>
                    <span className="text-white">₹{taxData.exemptSales?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t border-white/20 pt-2">
                    <span className="text-white">Total Supplies:</span>
                    <span className="text-white">₹{taxData.totalSales?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-white">Tax Liability (GSTR-3B)</h4>
                <div className="bg-white/5 backdrop-blur-md p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/70">CGST:</span>
                    <span className="text-white">₹{taxData.cgst?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">SGST:</span>
                    <span className="text-white">₹{taxData.sgst?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t border-white/20 pt-2">
                    <span className="text-white">Total Tax:</span>
                    <span className="text-white">₹{taxData.totalTax?.toLocaleString()}</span>
                  </div>
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

export default TaxReports;