import React from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiShoppingBag, FiBarChart, FiUsers, FiSettings, FiPrinter } from 'react-icons/fi';

const QuickActions = ({ onActionClick, delay = 0 }) => {
  const actions = [
    { 
      id: 'new-order', 
      label: 'New Order', 
      icon: <FiPlus />, 
      color: 'from-blue-500 to-blue-600',
      description: 'Create new order'
    },
    { 
      id: 'add-menu', 
      label: 'Add Menu Item', 
      icon: <FiShoppingBag />, 
      color: 'from-green-500 to-green-600',
      description: 'Add new menu item'
    },
    { 
      id: 'view-reports', 
      label: 'View Reports', 
      icon: <FiBarChart />, 
      color: 'from-purple-500 to-purple-600',
      description: 'Analytics & reports'
    },
    { 
      id: 'manage-staff', 
      label: 'Manage Staff', 
      icon: <FiUsers />, 
      color: 'from-orange-500 to-orange-600',
      description: 'Staff management'
    },
    { 
      id: 'print-kot', 
      label: 'Print KOT', 
      icon: <FiPrinter />, 
      color: 'from-red-500 to-red-600',
      description: 'Kitchen orders'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: <FiSettings />, 
      color: 'from-gray-500 to-gray-600',
      description: 'System settings'
    }
  ];

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + (index * 0.1), duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onActionClick && onActionClick(action.id)}
            className={`bg-gradient-to-r ${action.color} hover:shadow-lg text-white p-3 rounded-lg transition-all group`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="text-xl mb-2 group-hover:scale-110 transition-transform">
                {action.icon}
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActions;