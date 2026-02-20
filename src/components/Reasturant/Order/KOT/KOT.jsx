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
          kot.status !== 'PAID'
        );
        setKots(activeKots);
      }
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
    }
    setLoading(false);
  };

  const getFilteredKots = () => {
    if (activeTab === 'active') {
      return kots.filter(kot => kot.items?.some(item => item.status !== 'PENDING'));
    }
    return kots;
  };

  const updateItemStatus = async (kotId, itemIndex, newStatus, isExtraItem = false) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/kot/${kotId}/item/${itemIndex}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, isExtraItem })
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
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'all' 
                ? 'bg-white/40 backdrop-blur-lg text-gray-900' 
                : 'bg-white/20 backdrop-blur-md text-gray-800'
            }`}
          >
            📋 All
          </button>
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

      {activeTab === 'pending' && <PendingKOT onItemStarted={() => { fetchKitchenOrders(); setActiveTab('active'); }} />}

      {(activeTab === 'active' || activeTab === 'all') && (
        <>
          {getFilteredKots().length === 0 ? (
            <div className="text-center py-16 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl">
              <motion.div 
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🍳
              </motion.div>
              <p className="text-gray-500 text-lg font-medium">No {activeTab} KOTs in kitchen</p>
              <p className="text-gray-400 text-sm mt-2">Orders will appear here when placed</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {getFilteredKots().map((kot) => {
                const allItems = [...(kot.items || []), ...(kot.extraItems || [])];
                const filteredItems = allItems.filter(item => activeTab === 'all' || item.status !== 'PENDING');
                
                return (
                <motion.div 
                  key={kot._id} 
                  className="bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-lg rounded-2xl shadow-xl border-2 border-white/30 transition-all hover:shadow-2xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-3 py-2 rounded-t-2xl flex items-center justify-between bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg">
                    <div>
                      <h3 className="font-bold text-base">{kot.kotNumber}</h3>
                      <p className="text-[10px] opacity-90">{kot.orderNumber}</p>
                    </div>
                    <div className="text-right text-[10px]">
                      <div>⏰ {new Date(kot.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                      {kot.tableNumber && <div>🪑 {kot.tableNumber}</div>}
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    {filteredItems.map((item, idx) => {
                      const elapsed = calculateElapsedTime(item.startedAt, item.status);
                      const prepTime = item.timeToPrepare || 15;
                      const progress = elapsed ? Math.min((elapsed.totalSeconds / (prepTime * 60)) * 100, 100) : 100;
                      const isExtraItem = idx >= (kot.items?.length || 0);
                      const actualIndex = isExtraItem ? idx - (kot.items?.length || 0) : idx;
                      
                      return (
                      <div key={idx} className="bg-white/30 backdrop-blur-sm rounded-xl p-2 border border-white/40">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-900 text-xs">
                            <span className="bg-orange-500 text-white px-2 py-0.5 rounded mr-1">{item.quantity}×</span>
                            {item.name}
                            {isExtraItem && <span className="ml-1 text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded">NEW</span>}
                          </span>
                          {item.status === 'PREPARING' && elapsed && (
                            <div className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${getTimerColor(elapsed.totalSeconds, prepTime)} bg-white/50`}>
                              ⏱ {elapsed.minutes}:{elapsed.seconds.toString().padStart(2, '0')}
                            </div>
                          )}
                        </div>
                        {item.status === 'PREPARING' && elapsed && (
                          <>
                            <div className="w-full bg-gray-300/50 rounded-full h-1.5 mb-1 overflow-hidden">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-500 ${getProgressColor(elapsed.totalSeconds, prepTime)}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <div className="text-[9px] text-gray-700 font-medium mb-1">
                              Target: {prepTime}min {progress >= 100 && <span className="text-red-600 font-bold">⚠️ DELAYED</span>}
                            </div>
                          </>
                        )}
                        {item.status === 'PENDING' && (
                          <button
                            onClick={() => updateItemStatus(kot._id, actualIndex, 'PREPARING', isExtraItem)}
                            className="w-full py-1 px-2 rounded text-[10px] font-bold text-white bg-orange-500 hover:bg-orange-600"
                          >
                            👨🍳 Start
                          </button>
                        )}
                        {item.status === 'PREPARING' && (
                          <button
                            onClick={() => updateItemStatus(kot._id, actualIndex, 'READY', isExtraItem)}
                            className="w-full py-1 px-2 rounded text-[10px] font-bold text-white bg-green-500 hover:bg-green-600"
                          >
                            ✅ Mark Ready
                          </button>
                        )}
                        {item.status === 'READY' && (
                          <button
                            onClick={() => updateItemStatus(kot._id, actualIndex, 'SERVED', isExtraItem)}
                            className="w-full py-1 px-2 rounded text-[10px] font-bold text-white bg-purple-500 hover:bg-purple-600"
                          >
                            🍽️ Mark Served
                          </button>
                        )}
                        {item.status === 'SERVED' && (
                          <div className="w-full py-1 px-2 rounded text-[10px] font-bold text-white text-center bg-gray-500">
                            ✓ Served
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </div>

                  <div className="px-3 pb-3">
                    {(() => {
                      const allItemsServed = allItems.length > 0 && allItems.every(item => item.status === 'SERVED');
                      
                      if (allItemsServed) {
                        return (
                          <div className="w-full px-3 py-2 rounded-xl text-sm font-bold text-white text-center bg-purple-500">
                            🍽️ All Served
                          </div>
                        );
                      } else {
                        const readyCount = allItems.filter(item => item.status === 'READY').length || 0;
                        const servedCount = allItems.filter(item => item.status === 'SERVED').length || 0;
                        const totalCount = allItems.length || 0;
                        return (
                          <div className="w-full px-3 py-2 rounded-xl text-xs font-medium text-gray-700 text-center bg-gray-300/50">
                            {servedCount > 0 ? `🍽️ ${servedCount}/${totalCount} Served` : readyCount > 0 ? `✅ ${readyCount}/${totalCount} Ready` : '⏳ Preparing...'}
                          </div>
                        );
                      }
                    })()}
                  </div>
                </motion.div>
              )})}
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && <KOTHistory />}
    </motion.div>
  );
};

export default KOT;
