import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import RestaurantAdd from './reasturantadd';
import RestaurantList from './reasturantlist';
import EditRestaurantInline from './EditRestaurantInline';

const Restaurants = () => {
  const [showAddPage, setShowAddPage] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);

  useEffect(() => {
    const handlePopState = () => {
      setShowAddPage(false);
    };

    if (showAddPage) {
      window.history.pushState({ addPage: true }, '');
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showAddPage]);

  if (editingRestaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
        <EditRestaurantInline 
          restaurant={editingRestaurant}
          onBack={() => setEditingRestaurant(null)}
          onSuccess={() => setEditingRestaurant(null)}
        />
      </div>
    );
  }

  if (showAddPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => setShowAddPage(false)}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium bg-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Restaurants
          </button>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6"
        >
          Add New Restaurant
        </motion.h1>
        <RestaurantAdd onSuccess={() => setShowAddPage(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Restaurants Management
          </h1>
          <p className="text-gray-600">Manage all restaurant accounts and settings</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddPage(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Restaurant
        </motion.button>
      </motion.div>

      <RestaurantList onEdit={setEditingRestaurant} />
    </div>
  );
};

export default Restaurants;
