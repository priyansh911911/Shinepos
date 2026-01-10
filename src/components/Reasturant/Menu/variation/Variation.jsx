import React, { useState, useEffect, useRef } from 'react';
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
        return <AddVariation onSuccess={handleBackToList} onBack={() => setView('list')} />;
      case 'edit':
        return <EditVariation variation={editingVariation} onSuccess={handleBackToList} onBack={() => setView('list')} />;
      default:
        return <VariationList variations={variations} loading={loading} onAdd={handleAddVariation} onEdit={handleEditVariation} onDelete={fetchVariations} />;
    }
  };

  return (
    <div>
      {renderView()}
    </div>
  );
};

export default Variation;