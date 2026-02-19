import React, { useState, useEffect } from 'react';
import { FiClock, FiTrendingUp, FiUsers, FiActivity } from 'react-icons/fi';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PeakHours = () => {
  const [peakData, setPeakData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState('hourly');

  const formatTime = (minutes) => {
    if (!minutes || isNaN(minutes)) return '0:00';
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchPeakHours();
  }, [viewType]);

  const fetchPeakHours = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/dashboard/peak-hours`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPeakData(response.data);
      }
    } catch (error) {
      console.error('Peak hours error:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentData = peakData?.[viewType] || [];
  const maxOrders = Math.max(...currentData.map(d => d.orders));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Peak Hours Analysis</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewType('hourly')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewType === 'hourly' 
                ? 'bg-white/30 backdrop-blur-md text-white border border-white/30' 
                : 'bg-white/10 backdrop-blur-md text-white/70 border border-white/20 hover:bg-white/20'
            }`}
          >
            Hourly
          </button>
          <button
            onClick={() => setViewType('weekly')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewType === 'weekly' 
                ? 'bg-white/30 backdrop-blur-md text-white border border-white/30' 
                : 'bg-white/10 backdrop-blur-md text-white/70 border border-white/20 hover:bg-white/20'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-white">Loading...</div>
      ) : peakData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Peak Hour</p>
                  <p className="text-2xl font-bold text-green-400">{peakData.peakHour?.hour}:00</p>
                  <p className="text-sm text-white/50">{peakData.peakHour?.orders} orders</p>
                </div>
                <FiClock className="text-green-400" size={24} />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Peak Day</p>
                  <p className="text-2xl font-bold text-blue-400">{peakData.peakDay?.day}</p>
                  <p className="text-sm text-white/50">{peakData.peakDay?.orders} orders</p>
                </div>
                <FiActivity className="text-blue-400" size={24} />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Avg Wait Time</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {currentData.length > 0 ? formatTime(currentData.reduce((sum, d) => sum + (d.avgWaitTime || 0), 0) / currentData.length) : '0:00'}
                  </p>
                </div>
                <FiUsers className="text-purple-400" size={24} />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Total Orders</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {currentData.reduce((sum, d) => sum + d.orders, 0)}
                  </p>
                </div>
                <FiTrendingUp className="text-orange-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">
              {viewType === 'hourly' ? 'Hourly Distribution' : 'Weekly Distribution'}
            </h3>
            <div className="h-64 flex items-end justify-between gap-1">
              {currentData.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="w-full flex flex-col items-center">
                    <div
                      className="bg-blue-400 rounded-t w-8 transition-all hover:bg-blue-300"
                      style={{
                        height: `${(item.orders / maxOrders) * 200}px`,
                        minHeight: '4px'
                      }}
                      title={`${item.orders} orders, ₹${item.revenue?.toLocaleString()}`}
                    />
                    <span className="text-xs mt-2 text-center text-white/70">
                      {viewType === 'hourly' ? `${item.hour}:00` : item.day}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/20">
              <h3 className="text-lg font-semibold text-white">Detailed Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">
                      {viewType === 'hourly' ? 'Hour' : 'Day'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Avg Wait Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {currentData.map((item, index) => (
                    <tr key={index} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-white">
                        {viewType === 'hourly' ? `${item.hour}:00 - ${item.hour + 1}:00` : item.day}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">{item.orders}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-400 font-medium">
                        ₹{item.revenue?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">{formatTime(item.avgWaitTime)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.orders >= maxOrders * 0.8 ? 'bg-red-400/20 text-red-400' :
                          item.orders >= maxOrders * 0.5 ? 'bg-yellow-400/20 text-yellow-400' :
                          'bg-green-400/20 text-green-400'
                        }`}>
                          {item.orders >= maxOrders * 0.8 ? 'Very Busy' :
                           item.orders >= maxOrders * 0.5 ? 'Busy' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-white/70">No data available</div>
      )}
    </div>
  );
};

export default PeakHours;