import React from 'react';
import { FiPlus, FiMinus, FiX } from 'react-icons/fi';

const OrderItemsList = ({ menuItems, loadingMenu, searchQuery, setSearchQuery, fetchMenuItems, openItemModal }) => {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 lg:p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">🍽️ Select Menu Items</h3>
        <button
          type="button"
          onClick={() => {
            setSearchQuery('');
            fetchMenuItems();
          }}
          className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-gray-300"
        />
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[calc(100vh-300px)] overflow-y-auto">
        {loadingMenu ? (
          <div className="col-span-full flex justify-center items-center py-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-3"></div>
              <p className="text-white text-sm">Loading menu...</p>
            </div>
          </div>
        ) : (
          menuItems.filter(item => 
            item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
          ).map((item) => (
            <div key={item._id} className="bg-white/20 backdrop-blur-md rounded-xl p-3 border border-white/20 hover:bg-white/25 transition-all flex flex-col">
              {item.imageUrl && (
                <img 
                  src={item.imageUrl} 
                  alt={item.itemName} 
                  className="w-full h-32 object-cover rounded-lg mb-2"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
              <div className="flex-1 mb-2">
                <h4 className="font-semibold text-white text-sm mb-1 break-words leading-tight">{item.itemName}</h4>
                <span className="text-xs font-bold text-green-300">
                  ₹{item.variation && item.variation.length > 0 
                    ? Math.min(...item.variation.map(v => v.price || 0))
                    : 0}
                </span>
              </div>
              
              {item.description && (
                <p className="text-[10px] text-gray-300 mb-2 line-clamp-2 leading-tight">{item.description}</p>
              )}
              
              <button
                type="button"
                onClick={() => openItemModal(item)}
                disabled={item.status !== 'active'}
                className={`w-full py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                  item.status === 'active'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg'
                    : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                }`}
              >
                {item.status === 'active' ? '➕ Add' : 'Not Available'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderItemsList;
