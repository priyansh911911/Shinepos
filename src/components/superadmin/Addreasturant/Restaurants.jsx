import React, { useState } from 'react';
import RestaurantAdd from './reasturantadd';
import RestaurantList from './reasturantlist';

const Restaurants = () => {
  const [view, setView] = useState('list');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Restaurants Management</h1>
        <button
          onClick={() => setView(view === 'list' ? 'add' : 'list')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          {view === 'list' ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Restaurant
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to List
            </>
          )}
        </button>
      </div>

      {view === 'list' ? <RestaurantList /> : <RestaurantAdd onSuccess={() => setView('list')} />}
    </div>
  );
};

export default Restaurants;
