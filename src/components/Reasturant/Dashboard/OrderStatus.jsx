import React from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiTool, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const OrderStatus = ({ stats, delay = 0 }) => {
  const statusItems = [
    {
      label: 'Pending',
      count: stats.pendingOrders || 0,
      percentage: stats.pendingOrders ? (stats.pendingOrders / (stats.pendingOrders + stats.completedOrders + 15)) * 100 : 0,
      color: 'bg-red-500',
      icon: <FiAlertCircle />,
      textColor: 'text-red-400'
    },
    {
      label: 'Preparing',
      count: 15,
      percentage: 15 / (stats.pendingOrders + stats.completedOrders + 15) * 100,
      color: 'bg-yellow-500',
      icon: <FiTool />,
      textColor: 'text-yellow-400'
    },
    {
      label: 'Completed',
      count: stats.completedOrders || 0,
      percentage: stats.completedOrders ? (stats.completedOrders / (stats.pendingOrders + stats.completedOrders + 15)) * 100 : 0,
      color: 'bg-green-500',
      icon: <FiCheckCircle />,
      textColor: 'text-green-400'
    }
  ];

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20"
    >
      <div className="flex items-center gap-2 mb-4">
        <FiClock className="text-white text-lg" />
        <h3 className="text-lg font-semibold text-white">Order Status</h3>
      </div>
      
      <div className="space-y-4">
        {statusItems.map((item, index) => (
          <motion.div 
            key={item.label}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: delay + (index * 0.1), duration: 0.3 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`${item.textColor} text-lg`}>
                {item.icon}
              </div>
              <span className="text-gray-200 font-medium">{item.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 h-2 bg-gray-600 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ delay: delay + (index * 0.1) + 0.3, duration: 0.8 }}
                  className={`h-full ${item.color} rounded-full`}
                />
              </div>
              <span className="text-white font-bold text-lg min-w-[2rem] text-right">
                {item.count}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: delay + 0.5, duration: 0.3 }}
        className="mt-6 pt-4 border-t border-white/20"
      >
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Total Orders Today</span>
          <span className="text-white font-bold text-xl">
            {stats.pendingOrders + stats.completedOrders + 15}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrderStatus;