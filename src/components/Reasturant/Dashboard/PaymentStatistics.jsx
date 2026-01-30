import React from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiDollarSign } from 'react-icons/fi';

const PaymentStatistics = ({ stats = {}, delay = 0 }) => {
  const paymentMethods = [
    { 
      name: 'Cash', 
      amount: stats.cashPayments || 0, 
      percentage: stats.cashPercentage || 0,
      color: 'from-green-500 to-green-600',
      icon: <FiDollarSign />
    },
    { 
      name: 'Card', 
      amount: stats.cardPayments || 0, 
      percentage: stats.cardPercentage || 0,
      color: 'from-blue-500 to-blue-600',
      icon: <FiCreditCard />
    },
    { 
      name: 'UPI', 
      amount: stats.upiPayments || 0, 
      percentage: stats.upiPercentage || 0,
      color: 'from-purple-500 to-purple-600',
      icon: <FiCreditCard />
    }
  ];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20"
    >
      <h3 className="text-lg font-semibold text-white mb-6">Payment Statistics</h3>
      
      <div className="space-y-4">
        {paymentMethods.map((method, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${method.color}`}>
                  {method.icon}
                </div>
                <span className="text-white font-medium">{method.name}</span>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">₹{method.amount.toLocaleString()}</p>
                <p className="text-gray-300 text-sm">{method.percentage}%</p>
              </div>
            </div>
            <div className="w-full bg-gray-600/50 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${method.percentage}%` }}
                transition={{ delay: delay + 0.2 + index * 0.1, duration: 0.5 }}
                className={`bg-gradient-to-r ${method.color} h-2 rounded-full`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/20">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Total Collected</span>
          <span className="text-white font-bold text-xl">
            ₹{(stats.cashPayments + stats.cardPayments + stats.upiPayments || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentStatistics;
