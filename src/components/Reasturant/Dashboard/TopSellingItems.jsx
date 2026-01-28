import React from 'react';
import { motion } from 'framer-motion';

const TopSellingItems = ({ items, delay = 0 }) => {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Top Selling Items</h3>
        <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
          View All
        </button>
      </div>
      <div className="space-y-3">
        {items.length > 0 ? items.map((item, index) => (
          <motion.div 
            key={index} 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: delay + (index * 0.1), duration: 0.3 }}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                index === 2 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                'bg-gradient-to-r from-blue-400 to-purple-500'
              }`}>
                {index + 1}
              </div>
              <div>
                <p className="text-white font-medium">{item.name}</p>
                <p className="text-gray-400 text-sm">{item.orders} orders</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">₹{item.revenue.toLocaleString()}</p>
              <div className="w-16 h-1 bg-gray-600 rounded-full mt-1">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                  style={{ width: `${Math.min((item.orders / 25) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-gray-300">No sales data yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TopSellingItems;