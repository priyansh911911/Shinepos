import React, { useState, useEffect } from 'react';
import { FiUser, FiClock, FiStar, FiTrendingUp } from 'react-icons/fi';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StaffPerformance = () => {
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('monthly');

  useEffect(() => {
    fetchStaffPerformance();
  }, [dateRange]);

  const fetchStaffPerformance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mock performance data
      const mockPerformance = response.data.staff.map((staff, index) => ({
        ...staff,
        ordersProcessed: Math.floor(Math.random() * 100) + 20,
        avgOrderTime: Math.floor(Math.random() * 10) + 5,
        customerRating: (Math.random() * 2 + 3).toFixed(1),
        efficiency: Math.floor(Math.random() * 30) + 70,
        hoursWorked: Math.floor(Math.random() * 40) + 120
      }));
      
      setStaffData(mockPerformance);
    } catch (error) {
      console.error('Staff performance error:', error);
    } finally {
      setLoading(false);
    }
  };

  const topPerformer = staffData.reduce((top, staff) => 
    staff.efficiency > (top?.efficiency || 0) ? staff : top, null
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Staff Performance</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white"
        >
          <option value="weekly">This Week</option>
          <option value="monthly">This Month</option>
          <option value="quarterly">This Quarter</option>
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
                  <p className="text-sm text-white/70">Top Performer</p>
                  <p className="text-2xl font-bold text-green-400">{topPerformer?.efficiency}%</p>
                  <p className="text-sm text-white/50">{topPerformer?.name}</p>
                </div>
                <FiStar className="text-green-400" size={24} />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Avg Rating</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {(staffData.reduce((sum, s) => sum + parseFloat(s.customerRating || 0), 0) / staffData.length).toFixed(1)}
                  </p>
                </div>
                <FiStar className="text-blue-400" size={24} />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Total Orders</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {staffData.reduce((sum, s) => sum + (s.ordersProcessed || 0), 0)}
                  </p>
                </div>
                <FiTrendingUp className="text-purple-400" size={24} />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Active Staff</p>
                  <p className="text-2xl font-bold text-orange-400">{staffData.length}</p>
                </div>
                <FiUser className="text-orange-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/20">
              <h3 className="text-lg font-semibold text-white">Individual Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Staff</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Avg Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase">Efficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {staffData.map((staff, index) => (
                    <tr key={index} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                            <FiUser className="text-white/70" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-white">{staff.name}</div>
                            <div className="text-sm text-white/50">{staff.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-400/20 text-blue-400">
                          {staff.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">{staff.ordersProcessed || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">{staff.avgOrderTime || 0} min</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiStar className="text-yellow-400 mr-1" size={16} />
                          <span className="text-white">{staff.customerRating || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">{staff.hoursWorked || 0}h</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-white/20 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                (staff.efficiency || 0) >= 80 ? 'bg-green-400' :
                                (staff.efficiency || 0) >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${staff.efficiency || 0}%` }}
                            />
                          </div>
                          <span className="text-sm text-white">{staff.efficiency || 0}%</span>
                        </div>
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

export default StaffPerformance;