import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiPackage } from 'react-icons/fi';
import ModuleSettings from './Module/ModuleSettings';
import GeneralSettings from './GeneralSettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: <FiSettings /> },
    { id: 'modules', label: 'Modules', icon: <FiPackage /> },
  ];

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

      <div className="flex gap-3 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white/20 backdrop-blur-md text-white border border-white/30'
                : 'bg-white/10 backdrop-blur-md text-gray-300 hover:bg-white/15 border border-white/20'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'general' && <GeneralSettings />}
        {activeTab === 'modules' && <ModuleSettings />}
      </div>
    </div>
  );
};

export default Settings;
