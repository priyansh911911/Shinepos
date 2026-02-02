import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useModules } from '../../../../context/ModuleContext';
import { FiPackage, FiShoppingCart, FiFileText, FiLoader, FiAlertCircle } from 'react-icons/fi';

const ModuleSettings = () => {
  const { modules, updateModule, loading } = useModules();
  const [updating, setUpdating] = useState(null);

  const moduleList = [
    {
      key: 'inventory',
      name: 'Inventory Management',
      description: 'Track stock levels, manage suppliers, and monitor inventory',
      icon: <FiPackage className="text-3xl" />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      key: 'orderTaking',
      name: 'Order Taking',
      description: 'Create and manage customer orders with real-time updates',
      icon: <FiShoppingCart className="text-3xl" />,
      color: 'from-green-500 to-green-600'
    },
    {
      key: 'kot',
      name: 'Kitchen Order Ticket (KOT)',
      description: 'Generate KOT for kitchen operations and order tracking',
      icon: <FiFileText className="text-3xl" />,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const handleToggle = async (moduleName, currentStatus) => {
    setUpdating(moduleName);
    const success = await updateModule(moduleName, !currentStatus);
    setUpdating(null);
    
    if (!success) {
      alert('Failed to update module. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FiLoader className="text-5xl animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
      >
        <div className="flex items-start gap-3">
          <FiAlertCircle className="text-yellow-400 text-xl mt-1 flex-shrink-0" />
          <div>
            <p className="text-white font-medium mb-1">Important Notice</p>
            <p className="text-gray-200 text-sm">
              Disabling a module will prevent all users from accessing related features. Existing data will remain safe and intact.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        {moduleList.map((module, index) => {
          const isEnabled = modules[module.key]?.enabled ?? true;
          const isUpdating = updating === module.key;

          return (
            <motion.div
              key={module.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${module.color} text-white shadow-lg`}>
                    {module.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">{module.name}</h3>
                    <p className="text-gray-300 text-sm">{module.description}</p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        isEnabled 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                          : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                        {isEnabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(module.key, isEnabled)}
                  disabled={isUpdating}
                  className={`relative px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
                    isEnabled
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg'
                  } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUpdating ? (
                    <div className="flex items-center gap-2">
                      <FiLoader className="animate-spin" />
                      <span>Updating...</span>
                    </div>
                  ) : isEnabled ? (
                    <span>Disable Module</span>
                  ) : (
                    <span>Enable Module</span>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ModuleSettings;
