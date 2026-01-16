import React, { useState, useEffect } from 'react';

const KOTHistory = () => {
  const [historyKots, setHistoryKots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKOTHistory();
  }, []);

  const fetchKOTHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/kitchen/all/kitchen/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const completedKots = (data.kots || []).filter(kot => 
          kot.status === 'COMPLETE' || kot.status === 'CANCELLED'
        );
        setHistoryKots(completedKots);
      }
    } catch (error) {
      console.error('Error fetching KOT history:', error);
    }
    setLoading(false);
  };

  if (loading) return <div className="p-6">Loading history...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">KOT History</h2>
        <button
          onClick={fetchKOTHistory}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">KOT #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {historyKots.map((kot) => (
              <tr key={kot._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{kot.kotNumber}</td>
                <td className="px-4 py-3 text-sm">{kot.orderNumber}</td>
                <td className="px-4 py-3 text-sm">
                  {kot.items?.map((item, idx) => (
                    <div key={idx}>{item.quantity}x {item.name}</div>
                  ))}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    kot.status === 'COMPLETE' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {kot.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(kot.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {historyKots.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No KOT history available</p>
        </div>
      )}
    </div>
  );
};

export default KOTHistory;
