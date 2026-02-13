import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiPackage } from 'react-icons/fi';
import ModuleSettings from './Module/ModuleSettings';

const Settings = () => {
  return (
    <div className="min-h-screen bg-transparent p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <FiSettings className="text-orange-500" />
          Restaurant Settings
        </h1>
        <p className="text-gray-200">Manage your restaurant configuration</p>
      </motion.div>

      <ModuleSettings />
    </div>
  );
};

export default Settings;
