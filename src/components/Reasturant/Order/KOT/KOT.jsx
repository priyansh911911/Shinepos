import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import KOTHistory from './KOTHistory';

const KOT = () => {
  const [kots, setKots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [openDropdown, setOpenDropdown] = useState(null);

  const statuses = [
    { value: 'PENDING', label: 'Pending', emoji: '⏳' },
    { value: 'PREPARING', label: 'Preparing', emoji: '👨🍳' },
    { value: 'READY', label: 'Ready', emoji: '✅' },
    { value: 'DELIVERED', label: 'Delivered', emoji: '🚀' },
    { value: 'CANCELLED', label: 'Cancelled', emoji: '❌' }
  ];

  const getStatusDisplay = (status) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? `${statusObj.emoji} ${statusObj.label}` : status;
  };

  useEffect(() => {
    fetchKitchenOrders();
  }, []);

  const fetchKitchenOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/kitchen/all/kitchen/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const activeKots = (data.kots || []).filter(kot => 
          kot.status !== 'DELIVERED' && kot.status !== 'CANCELLED' && kot.status !== 'PAID'
        );
        setKots(activeKots);
      }
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
    }
    setLoading(false);
  };

  const updateKOTStatus = async (kotId, newStatus) => {
    try {
      if (newStatus === 'DELIVERED' || newStatus === 'CANCELLED' || newStatus === 'PAID') {
        setKots(prev => prev.filter(kot => kot._id !== kotId));
      } else {
        setKots(prev => prev.map(kot => 
          kot._id === kotId ? { ...kot, status: newStatus } : kot
        ));
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/kot/${kotId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        fetchKitchenOrders();
      }
    } catch (error) {
      console.error('Error updating KOT status:', error);
      fetchKitchenOrders();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <motion.div 
            className="text-6xl mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            👨🍳
          </motion.div>
          <motion.div 
            className="rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="mt-4 text-gray-900 font-medium">Loading kitchen orders...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-3">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'active' 
                ? 'bg-white/40 backdrop-blur-lg text-gray-900' 
                : 'bg-white/20 backdrop-blur-md text-gray-800'
            }`}
          >
            🔥 Active KOTs
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'history' 
                ? 'bg-white/40 backdrop-blur-lg text-gray-900' 
                : 'bg-white/20 backdrop-blur-md text-gray-800'
            }`}
          >
            📜 History
          </button>
          <button
            onClick={fetchKitchenOrders}
            className="px-6 py-3 bg-white/30 backdrop-blur-md hover:bg-white/40 text-gray-900 rounded-xl font-medium transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {activeTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {kots.map((kot, index) => (
            <motion.div 
              key={kot._id} 
              className={`bg-white/30 backdrop-blur-md rounded-xl overflow-visible transition-colors hover:bg-white/35 ${openDropdown === kot._id ? 'z-50' : 'z-0'} ${
                kot.priority === 'URGENT' ? 'ring-2 ring-red-500' : 
                kot.priority === 'HIGH' ? 'ring-2 ring-orange-400' : ''
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={kot.priority === 'URGENT' ? { opacity: 1, y: 0, scale: [1, 1.01, 1] } : { opacity: 1, y: 0 }}
              transition={kot.priority === 'URGENT' ? { opacity: { delay: index * 0.05, duration: 0.2 }, y: { delay: index * 0.05, duration: 0.2 }, scale: { duration: 1.5, repeat: Infinity } } : { delay: index * 0.05, duration: 0.2 }}
            >
              {/* Header */}
              <div className={`p-3 rounded-t-xl ${
                kot.priority === 'URGENT' ? 'bg-red-500/80' :
                kot.priority === 'HIGH' ? 'bg-orange-500/80' :
                kot.priority === 'NORMAL' ? 'bg-yellow-500/80' :
                'bg-green-500/80'
              } text-white`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{kot.kotNumber}</h3>
                    <p className="text-xs opacity-90">{kot.orderNumber}</p>
                  </div>
                  <div className="text-lg">
                    {kot.priority === 'URGENT' ? '🔴' :
                     kot.priority === 'HIGH' ? '🟠' :
                     kot.priority === 'NORMAL' ? '🟡' : '🟢'}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span>⏰ {new Date(kot.createdAt).toLocaleTimeString()}</span>
                  {kot.tableNumber && <span>🪑 {kot.tableNumber}</span>}
                </div>
              </div>

              {/* Items */}
              <div className="p-3">
                <div className="space-y-1 mb-3 max-h-32 overflow-y-auto">
                  {kot.items?.map((item, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="flex items-center gap-1">
                        <span className="bg-orange-500 text-white font-bold px-1.5 py-0.5 rounded text-xs">
                          {item.quantity}x
                        </span>
                        <span className="font-medium text-white">{item.name}</span>
                      </div>
                      {item.variation && (
                        <div className="text-xs text-gray-300 ml-6">🎯 {item.variation.name}</div>
                      )}
                      {item.addons?.map((addon, addonIdx) => (
                        <div key={addonIdx} className="text-xs text-white ml-6">➕ {addon.name}</div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Status Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => kot.status !== 'READY' && kot.status !== 'DELIVERED' && kot.status !== 'CANCELLED' && setOpenDropdown(openDropdown === kot._id ? null : kot._id)}
                    disabled={kot.status === 'READY' || kot.status === 'DELIVERED' || kot.status === 'CANCELLED'}
                    className={`w-full px-3 py-2 bg-white/40 backdrop-blur-lg rounded-lg text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-between ${
                      (kot.status === 'READY' || kot.status === 'DELIVERED' || kot.status === 'CANCELLED') ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <span>{getStatusDisplay(kot.status)}</span>
                    <span className={`transition-transform ${openDropdown === kot._id ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  
                  {openDropdown === kot._id && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white/90 backdrop-blur-xl rounded-lg overflow-hidden z-50 shadow-xl">
                      {statuses.map((status) => (
                        <button
                          key={status.value}
                          onClick={() => {
                            updateKOTStatus(kot._id, status.value);
                            setOpenDropdown(null);
                          }}
                          className="w-full px-3 py-2 text-left text-xs font-medium text-gray-900 hover:bg-purple-500/20 transition-colors"
                        >
                          {status.emoji} {status.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'active' && kots.length === 0 && (
        <div className="text-center py-16 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl">
          <motion.div 
            className="text-6xl mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🍳
          </motion.div>
          <p className="text-gray-500 text-lg font-medium">No active KOTs in kitchen</p>
          <p className="text-gray-400 text-sm mt-2">Orders will appear here when placed</p>
        </div>
      )}

      {activeTab === 'history' && <KOTHistory />}
    </motion.div>
  );
};

export default KOT;
