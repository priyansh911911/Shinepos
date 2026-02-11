import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import KOTHistory from './KOTHistory';
import PendingKOT from './PendingKOT';

const KOT = () => {
  const [kots, setKots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const timerRef = useRef(null);

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'PENDING': { next: 'PREPARING', label: 'Start Preparing', emoji: '👨🍳', color: 'bg-orange-500' },
      'PREPARING': { next: 'READY', label: 'Mark Ready', emoji: '✅', color: 'bg-green-500' },
      'READY': null
    };
    return statusFlow[currentStatus];
  };

  const statuses = [
    { value: 'PENDING', label: 'Pending', emoji: '⏳', color: 'bg-yellow-500' },
    { value: 'PREPARING', label: 'Preparing', emoji: '👨🍳', color: 'bg-orange-500' },
    { value: 'READY', label: 'Ready', emoji: '✅', color: 'bg-green-500' }
  ];

  const getStatusDisplay = (status) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? `${statusObj.emoji} ${statusObj.label}` : status;
  };

  useEffect(() => {
    fetchKitchenOrders();
    timerRef.current = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const calculateElapsedTime = (startedAt, status) => {
    if (status === 'READY' || status === 'DELIVERED' || status === 'CANCELLED' || status === 'PAID') {
      return null;
    }
    if (!startedAt) {
      return null;
    }
    const elapsed = Math.floor((currentTime - new Date(startedAt).getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return { minutes, seconds, totalSeconds: elapsed };
  };

  const getTimerColor = (elapsed, prepTime) => {
    const percentage = (elapsed / (prepTime * 60)) * 100;
    if (percentage >= 100) return 'text-red-600 font-bold';
    if (percentage >= 80) return 'text-orange-600 font-bold';
    if (percentage >= 60) return 'text-yellow-600 font-semibold';
    return 'text-green-600';
  };

  const getProgressColor = (elapsed, prepTime) => {
    const percentage = (elapsed / (prepTime * 60)) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const fetchKitchenOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/kitchen/all/kitchen/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const activeKots = (data.kots || []).filter(kot => 
          kot.status !== 'DELIVERED' && 
          kot.status !== 'CANCELLED' && 
          kot.status !== 'PAID' &&
          kot.items?.some(item => item.status !== 'PENDING')
        );
        setKots(activeKots);
      }
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
    }
    setLoading(false);
  };

  const updateItemStatus = async (kotId, itemIndex, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/kot/${kotId}/item/${itemIndex}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        setKots(prev => prev.map(kot => kot._id === kotId ? data.kot : kot));
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      fetchKitchenOrders();
    }
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
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'pending' 
                ? 'bg-white/40 backdrop-blur-lg text-gray-900' 
                : 'bg-white/20 backdrop-blur-md text-gray-800'
            }`}
          >
            ⏳ Pending
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'active' 
                ? 'bg-white/40 backdrop-blur-lg text-gray-900' 
                : 'bg-white/20 backdrop-blur-md text-gray-800'
            }`}
          >
            🔥 Active
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

      {activeTab === 'pending' && <PendingKOT onItemStarted={() => setActiveTab('active')} />}

      {activeTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {kots.map((kot, index) => (
            <motion.div 
              key={kot._id} 
              className={`bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-lg rounded-2xl shadow-xl border-2 transition-all hover:shadow-2xl ${
                kot.priority === 'URGENT' ? 'border-red-500 shadow-red-500/50' : 
                kot.priority === 'HIGH' ? 'border-orange-400 shadow-orange-400/30' : 
                'border-white/30'
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={kot.priority === 'URGENT' ? { opacity: 1, scale: [1, 1.02, 1] } : { opacity: 1, scale: 1 }}
              transition={kot.priority === 'URGENT' ? { scale: { duration: 1.5, repeat: Infinity } } : { duration: 0.2 }}
            >
              {/* Compact Header */}
              <div className={`px-3 py-2 rounded-t-2xl flex items-center justify-between ${
                kot.priority === 'URGENT' ? 'bg-gradient-to-r from-red-600 to-red-500' :
                kot.priority === 'HIGH' ? 'bg-gradient-to-r from-orange-600 to-orange-500' :
                kot.priority === 'NORMAL' ? 'bg-gradient-to-r from-yellow-600 to-yellow-500' :
                'bg-gradient-to-r from-green-600 to-green-500'
              } text-white shadow-lg`}>
                <div className="flex items-center gap-2">
                  <div className="text-xl">
                    {kot.priority === 'URGENT' ? '🔴' :
                     kot.priority === 'HIGH' ? '🟠' :
                     kot.priority === 'NORMAL' ? '🟡' : '🟢'}
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight">{kot.kotNumber}</h3>
                    <p className="text-[10px] opacity-90">{kot.orderNumber}</p>
                  </div>
                </div>
                <div className="text-right text-[10px]">
                  <div>⏰ {new Date(kot.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                  {kot.tableNumber && <div>🪑 {kot.tableNumber}</div>}
                </div>
              </div>

              {/* Items Section */}
              <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                {kot.items?.map((item, idx) => {
                  const elapsed = calculateElapsedTime(item.startedAt, item.status);
                  const prepTime = item.timeToPrepare || 15;
                  const progress = elapsed ? Math.min((elapsed.totalSeconds / (prepTime * 60)) * 100, 100) : 100;
                  
                  return (
                    <div key={idx} className="bg-white/30 backdrop-blur-sm rounded-xl p-2 border border-white/40 shadow-sm">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className="bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold px-2 py-0.5 rounded-md text-xs shadow-sm flex-shrink-0">
                            {item.quantity}×
                          </span>
                          <span className="font-semibold text-gray-900 text-xs leading-tight">{item.name}</span>
                        </div>
                        {item.status === 'PREPARING' && elapsed && (
                          <div className={`text-xs font-mono font-bold flex-shrink-0 px-1.5 py-0.5 rounded ${getTimerColor(elapsed.totalSeconds, prepTime)} bg-white/50`}>
                            ⏱ {elapsed.minutes}:{elapsed.seconds.toString().padStart(2, '0')}
                          </div>
                        )}
                      </div>
                      
                      {item.status === 'PREPARING' && elapsed && (
                        <div className="w-full bg-gray-300/50 rounded-full h-1.5 mb-1 overflow-hidden shadow-inner">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-500 ${getProgressColor(elapsed.totalSeconds, prepTime)} shadow-sm`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                      
                      <div className="space-y-0.5 mb-2">
                        {item.status === 'PREPARING' && elapsed && (
                          <div className="text-[9px] text-gray-700 font-medium">
                            Target: {prepTime}min {progress >= 100 && <span className="text-red-600 font-bold">⚠️ DELAYED</span>}
                          </div>
                        )}
                        {item.variation && (
                          <div className="text-[10px] text-gray-700 flex items-center gap-1">
                            <span className="bg-blue-500/20 px-1.5 py-0.5 rounded">🎯 {item.variation.name}</span>
                          </div>
                        )}
                        {item.addons?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.addons.map((addon, addonIdx) => (
                              <span key={addonIdx} className="text-[9px] bg-purple-500/20 text-purple-900 px-1.5 py-0.5 rounded">+ {addon.name}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {item.status === 'PENDING' && (
                        <button
                          onClick={() => updateItemStatus(kot._id, idx, 'PREPARING')}
                          className="w-full py-1.5 px-2 rounded-lg text-[10px] font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all shadow-sm"
                        >
                          👨🍳 Start
                        </button>
                      )}
                      {item.status === 'PREPARING' && (
                        <button
                          onClick={() => updateItemStatus(kot._id, idx, 'READY')}
                          className="w-full py-1.5 px-2 rounded-lg text-[10px] font-bold text-white bg-green-500 hover:bg-green-600 transition-all shadow-sm"
                        >
                          ✅ Mark Ready
                        </button>
                      )}
                      {item.status === 'READY' && (
                        <div className="w-full py-1.5 px-2 rounded-lg text-[10px] font-bold text-white bg-gray-500 text-center shadow-sm">
                          ✅ Ready
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="px-3 pb-3">
                {(() => {
                  const allReady = kot.items?.every(item => item.status === 'READY');
                  
                  if (kot.status === 'READY') {
                    return (
                      <div className="w-full px-3 py-2.5 rounded-xl text-sm font-bold text-white text-center shadow-lg bg-green-500">
                        ✅ Completed
                      </div>
                    );
                  } else if (allReady) {
                    return (
                      <button
                        onClick={() => updateKOTStatus(kot._id, 'READY')}
                        className="w-full px-3 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg hover:shadow-xl hover:scale-105 bg-green-500"
                      >
                        ✅ Complete KOT
                      </button>
                    );
                  } else {
                    return (
                      <div className="w-full px-3 py-2.5 rounded-xl text-xs font-medium text-gray-700 text-center bg-gray-300/50">
                        ⏳ Preparing items...
                      </div>
                    );
                  }
                })()}
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
