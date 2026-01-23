import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import AddonList from './AddonList';
import AddAddon from './AddAddon';
import EditAddon from './EditAddon';

const Addon = () => {
  const [view, setView] = useState('list');
  const [editingAddon, setEditingAddon] = useState(null);
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchAddons();
    }
  }, []);

  const fetchAddons = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/addon/all/addon`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAddons(data.addons || []);
      }
    } catch (error) {
      console.error('Error fetching addons:', error);
    }
    setLoading(false);
  };

  const handleAddAddon = () => {
    setView('add');
  };

  const handleEditAddon = (addon) => {
    setEditingAddon(addon);
    setView('edit');
  };

  const handleBackToList = () => {
    setView('list');
    setEditingAddon(null);
    fetchAddons(); // Refresh data
  };

  const renderView = () => {
    switch (view) {
      case 'add':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            <AddAddon onSuccess={handleBackToList} onBack={() => setView('list')} />
          </motion.div>
        );
      case 'edit':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            <EditAddon addon={editingAddon} onSuccess={handleBackToList} onBack={() => setView('list')} />
          </motion.div>
        );
      default:
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <div className="flex justify-end items-center mb-6">
              <button
                onClick={handleAddAddon}
                className="px-6 py-3 bg-white/30 backdrop-blur-md hover:bg-white/40 text-gray-900 rounded-xl flex items-center space-x-2 font-medium transition-all border border-white/40"
              >
                <span>➕ Add Addon</span>
              </button>
            </div>
            <AddonList addons={addons} loading={loading} onAdd={handleAddAddon} onEdit={handleEditAddon} onDelete={fetchAddons} />
          </motion.div>
        );
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto animate-fadeIn">
        {renderView()}
      </div>
    </div>
  );
};

export default Addon;