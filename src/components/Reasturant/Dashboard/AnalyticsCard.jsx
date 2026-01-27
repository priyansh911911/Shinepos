import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const AnalyticsCard = ({ title, value, icon, color, change, trend, delay = 0 }) => {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20 hover:bg-white/15 transition-all group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="flex items-center gap-1">
          {trend === 'up' ? (
            <FiTrendingUp className="text-green-400 text-sm" />
          ) : trend === 'down' ? (
            <FiTrendingDown className="text-red-400 text-sm" />
          ) : null}
          <span className={`text-xs font-medium ${
            trend === 'up' ? 'text-green-400' : 
            trend === 'down' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {change}
          </span>
        </div>
      </div>
      <div>
        <p className="text-gray-200 text-sm mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </motion.div>
  );
};

export default AnalyticsCard;