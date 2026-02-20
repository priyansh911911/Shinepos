import React, { useState, useEffect } from 'react';
import { FiFileText, FiCalendar, FiClock, FiGrid } from 'react-icons/fi';

const KOTHistory = () => {
  const [historyKots, setHistoryKots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedKot, setExpandedKot] = useState(null);

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
          kot.status === 'DELIVERED' || kot.status === 'CANCELLED' || kot.status === 'PAID'
        );
        setHistoryKots(completedKots);
      }
    } catch (error) {
      console.error('Error fetching KOT history:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse-slow">📜</div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-900 font-medium">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-4">
      {historyKots.map((kot, index) => (
        <div 
          key={kot._id} 
          className="bg-white/30 backdrop-blur-md rounded-xl shadow-lg border border-white/40 hover:shadow-xl transition-all duration-300 animate-fadeIn"
          style={{ animationDelay: `${index * 0.03}s` }}
        >
          <div 
            className="p-4 cursor-pointer"
            onClick={() => setExpandedKot(expandedKot === kot._id ? null : kot._id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-xl font-bold text-white ${
                  kot.status === 'DELIVERED' ? 'bg-green-500' :
                  kot.status === 'PAID' ? 'bg-gray-500' :
                  'bg-red-500'
                }`}>
                  {kot.status === 'DELIVERED' ? '✅' :
                   kot.status === 'PAID' ? '💰' : '❌'}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">{kot.kotNumber}</h3>
                  <p className="text-sm text-white flex items-center gap-1"><FiFileText className="inline" /> Order: {kot.orderNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-white flex items-center gap-1 justify-end"><FiCalendar className="inline" /> {new Date(kot.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm text-white flex items-center gap-1 justify-end"><FiClock className="inline" /> {new Date(kot.createdAt).toLocaleTimeString()}</p>
                  {kot.tableNumber && (
                    <p className="text-sm text-white flex items-center gap-1 justify-end"><FiGrid className="inline" /> Table: {kot.tableNumber}</p>
                  )}
                </div>
                <div className={`text-2xl transition-transform ${
                  expandedKot === kot._id ? 'rotate-180' : ''
                }`}>
                  ▼
                </div>
              </div>
            </div>
          </div>

          {expandedKot === kot._id && (
            <div className="px-4 pb-4 pt-0">
              <div className="flex flex-wrap gap-2 border-t border-white/40 pt-4">
                {kot.items?.map((item, idx) => (
                  <div key={idx} className="bg-white/40 backdrop-blur-lg rounded-lg px-3 py-2 border border-white/50">
                    <span className="font-medium text-gray-900">
                      <span className="bg-orange-500 text-white font-bold px-2 py-0.5 rounded-full text-xs mr-2">
                        {item.quantity}x
                      </span>
                      {item.name}
                    </span>
                    {item.variation && (
                      <span className="text-sm text-gray-700 ml-2">({item.variation.name})</span>
                    )}
                  </div>
                ))}
                {kot.extraItems?.map((item, idx) => (
                  <div key={`extra-${idx}`} className="bg-blue-100/60 backdrop-blur-lg rounded-lg px-3 py-2 border border-blue-300">
                    <span className="font-medium text-gray-900">
                      <span className="bg-blue-500 text-white font-bold px-2 py-0.5 rounded-full text-xs mr-2">
                        {item.quantity}x
                      </span>
                      {item.name}
                      <span className="ml-1 text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded">NEW</span>
                    </span>
                    {item.variation && (
                      <span className="text-sm text-gray-700 ml-2">({item.variation.name})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {historyKots.length === 0 && (
        <div className="text-center py-16 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl">
          <div className="text-6xl mb-4 animate-pulse-slow">📜</div>
          <p className="text-gray-500 text-lg font-medium">No KOT history available</p>
          <p className="text-gray-400 text-sm mt-2">Completed orders will appear here</p>
        </div>
      )}
    </div>
  );
};

export default KOTHistory;
