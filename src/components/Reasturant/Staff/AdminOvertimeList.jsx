import React, { useState, useEffect } from 'react';
import { FiClock, FiUser, FiRefreshCw } from 'react-icons/fi';

const AdminOvertimeList = () => {
  const [overtimeList, setOvertimeList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllOvertimes();
  }, []);

  const fetchAllOvertimes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/staff/overtime-responses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('All overtime responses:', data);
        const overtimes = data.responses?.map(item => ({
          staffName: item.staffName,
          staffId: item.staffId,
          date: new Date(item.date).toLocaleDateString(),
          startTime: item.startTime,
          endTime: item.endTime,
          hours: item.hours,
          status: item.status,
          respondedAt: item.respondedAt
        })) || [];
        setOvertimeList(overtimes);
      } else {
        console.error('Response not ok:', response.status);
      }
    } catch (error) {
      console.error('Error fetching overtimes:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Staff Overtime</h2>
        <button
          onClick={fetchAllOvertimes}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center gap-2 transition-all border border-white/40"
        >
          <FiRefreshCw size={18} /> Refresh
        </button>
      </div>
      
      {overtimeList.length === 0 ? (
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-8 text-center border border-white/40">
          <FiClock className="text-4xl mx-auto mb-4 text-gray-300" />
          <p className="text-gray-300">No active overtime</p>
        </div>
      ) : (
        <div className="bg-white/20 backdrop-blur-md rounded-xl border border-white/40 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/40 bg-white/10">
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Staff Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Time</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Hours</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Status</th>
              </tr>
            </thead>
            <tbody>
              {overtimeList.map((item, idx) => (
                <tr key={idx} className="border-b border-white/20 hover:bg-white/10 transition">
                  <td className="px-6 py-4 text-sm text-white flex items-center gap-2">
                    <FiUser /> {item.staffName}
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{item.date}</td>
                  <td className="px-6 py-4 text-sm text-white">{item.startTime} - {item.endTime}</td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">{item.hours}h</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === 'accepted' ? 'bg-green-500/30 text-green-300' :
                      item.status === 'completed' ? 'bg-blue-500/30 text-blue-300' :
                      'bg-yellow-500/30 text-yellow-300'
                    }`}>
                      {item.status === 'accepted' ? '✓ Accepted' : 
                       item.status === 'completed' ? '✓ Completed' : 'In Progress'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOvertimeList;
