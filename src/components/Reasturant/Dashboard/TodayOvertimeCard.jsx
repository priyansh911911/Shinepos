import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';

const TodayOvertimeCard = ({ delay = 0 }) => {
  const [overtimeData, setOvertimeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayOvertime();
  }, []);

  const fetchTodayOvertime = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/staff/my-overtime`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const requests = data.overtimeRequests || [];
        
        // Filter for today's overtime
        const today = new Date().toISOString().split('T')[0];
        const todayOvertime = requests.find(req => {
          const reqDate = new Date(req.date).toISOString().split('T')[0];
          return reqDate === today;
        });
        
        setOvertimeData(todayOvertime);
      }
    } catch (error) {
      console.error('Error fetching today overtime:', error);
    }
    setLoading(false);
  };

  const formatTime12Hour = (time24) => {
    if (!time24) return '';
    const [hours, mins] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${mins} ${ampm}`;
  };

  const formatDecimalToTime = (hours) => {
    if (typeof hours === 'string') {
      return hours;
    }
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'accepted': return 'text-green-400';
      case 'declined': return 'text-red-400';
      case 'completed': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock />;
      case 'accepted': return <FiCheckCircle />;
      case 'declined': return <FiAlertCircle />;
      case 'completed': return <FiCheckCircle />;
      default: return <FiClock />;
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay, duration: 0.3 }}
        className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20"
      >
        <div className="flex items-center justify-center">
          <FiLoader className="animate-spin text-white" size={24} />
          <span className="ml-2 text-white">Loading overtime...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FiClock className="text-orange-400" />
          Today's Overtime
        </h3>
      </div>

      {!overtimeData ? (
        <div className="text-center py-4">
          <FiCheckCircle className="text-4xl mx-auto mb-2 text-green-400" />
          <p className="text-white font-medium">No overtime assigned today</p>
          <p className="text-gray-300 text-sm">Enjoy your regular shift!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`${getStatusColor(overtimeData.status)} text-lg`}>
                {getStatusIcon(overtimeData.status)}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                overtimeData.status === 'pending' ? 'bg-yellow-500/30 text-yellow-300' :
                overtimeData.status === 'accepted' ? 'bg-green-500/30 text-green-300' :
                overtimeData.status === 'declined' ? 'bg-red-500/30 text-red-300' :
                'bg-blue-500/30 text-blue-300'
              }`}>
                {overtimeData.status === 'accepted' ? '✓ Accepted' : 
                 overtimeData.status === 'declined' ? '✗ Declined' : 
                 overtimeData.status === 'completed' ? '✓ Completed' : 'Pending'}
              </span>
            </div>
          </div>

          {/* Time Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-xs text-gray-300 mb-1">Time Slot</p>
              <p className="text-white font-semibold text-sm">
                {formatTime12Hour(overtimeData.startTime)} - {formatTime12Hour(overtimeData.endTime)}
              </p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-xs text-gray-300 mb-1">Duration</p>
              <p className="text-white font-semibold text-sm">
                {formatDecimalToTime(overtimeData.hours)}
              </p>
            </div>
          </div>

          {/* Reason */}
          {overtimeData.reason && (
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-xs text-gray-300 mb-1">Reason</p>
              <p className="text-white text-sm">{overtimeData.reason}</p>
            </div>
          )}

          {/* Amount (if completed) */}
          {overtimeData.amount && overtimeData.status === 'completed' && (
            <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg p-3 border border-green-500/30">
              <p className="text-xs text-green-300 mb-1">Overtime Pay</p>
              <p className="text-green-400 font-bold text-lg">₹{overtimeData.amount}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default TodayOvertimeCard;