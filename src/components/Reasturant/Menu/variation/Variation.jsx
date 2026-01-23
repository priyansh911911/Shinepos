import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import VariationList from './VariationList';
import AddVariation from './AddVariation';
import EditVariation from './EditVariation';

const Variation = () => {
  const [view, setView] = useState('list');
  const [editingVariation, setEditingVariation] = useState(null);
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchVariations();
    }
  }, []);

  const fetchVariations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/variation/all/variation`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVariations(data.variations || []);
      }
    } catch (error) {
      console.error('Error fetching variations:', error);
    }
    setLoading(false);
  };

  const handleAddVariation = () => {
    setView('add');
  };

  const handleEditVariation = (variation) => {
    setEditingVariation(variation);
    setView('edit');
  };

  const handleBackToList = () => {
    setView('list');
    setEditingVariation(null);
    fetchVariations(); // Refresh data
  };

  const renderView = () => {
    switch (view) {
      case 'add':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            <AddVariation onSuccess={handleBackToList} onBack={() => setView('list')} />
          </motion.div>
        );
      case 'edit':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            <EditVariation variation={editingVariation} onSuccess={handleBackToList} onBack={() => setView('list')} />
          </motion.div>
        );
      default:
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <div className="flex justify-end items-center mb-6">
              <button
                onClick={handleAddVariation}
                className="px-6 py-3 bg-white/30 backdrop-blur-md hover:bg-white/40 text-gray-900 rounded-xl flex items-center space-x-2 font-medium transition-all border border-white/40"
              >
                <span>➕ Add Variation</span>
              </button>
            </div>
            <VariationList variations={variations} loading={loading} onAdd={handleAddVariation} onEdit={handleEditVariation} onDelete={fetchVariations} />
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

export default Variation;