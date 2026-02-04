import React from 'react';
import { useCreateOrder } from './hooks/useCreateOrder';
import FloatingCart from './FloatingCart';

const CreateOrder = ({ onCreateOrder, onCancel }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const {
    menuItems,
    tables,
    orderItems,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    guestCount,
    setGuestCount,
    selectedTable,
    setSelectedTable,
    discount,
    setDiscount,
    showMergeOption,
    selectedTablesForMerge,
    selectedCapacity,
    isCapacityMet,
    toggleTableSelection,
    loading,
    loadingMenu,
    error,
    selectedItem,
    selectedVariation,
    setSelectedVariation,
    selectedAddons,
    setSelectedAddons,
    openItemModal,
    closeItemModal,
    addItemToOrder,
    updateItemQuantity,
    removeItem,
    calculateTotal,
    handleSubmit,
    fetchMenuItems
  } = useCreateOrder(onCreateOrder);

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      {error && (
        <div className="lg:col-span-3 bg-red-500/80 backdrop-blur-md border border-red-600/50 text-white px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Left Side - Menu Items */}
      <div className="lg:col-span-1 bg-white/10 backdrop-blur-xl rounded-2xl p-4 lg:p-6 border border-white/20">
        <div className="flex items-center justify-between mb-3 lg:mb-4">
          <h3 className="text-base lg:text-lg font-bold text-white">🍽️ Menu Items</h3>
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
        
        {/* Search Bar */}
        <div className="mb-3 lg:mb-4">
          <input
            type="text"
            placeholder="🔍 Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-3 lg:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-gray-300"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2 lg:gap-3 max-h-[300px] lg:max-h-[calc(100vh-350px)] overflow-y-auto">
          {loadingMenu ? (
            <div className="col-span-2 flex justify-center items-center py-10">
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

      {/* Right Side - Customer Info */}
      <div className="lg:col-span-2">
        {/* Customer Information */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 lg:p-6 border border-white/20">
          <h3 className="text-base lg:text-lg font-bold text-white mb-3 lg:mb-4">👤 Customer Information</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            <div>
              <label className="block text-xs lg:text-sm font-medium text-white mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-3 lg:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-gray-300"
                required
              />
            </div>

            <div>
              <label className="block text-xs lg:text-sm font-medium text-white mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-3 lg:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-gray-300"
              />
            </div>

            <div>
              <label className="block text-xs lg:text-sm font-medium text-white mb-1">
                Number of Guests *
              </label>
              <input
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-3 lg:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-gray-300"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-xs lg:text-sm font-medium text-white mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-3 lg:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-gray-300"
                min="0"
                max="100"
                placeholder="0"
              />
            </div>

            {showMergeOption ? (
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Select Tables to Merge *
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                  {tables.filter(t => t.status === 'AVAILABLE').map(table => {
                    const isDisabled = !selectedTablesForMerge.includes(table._id) && isCapacityMet;
                    
                    return (
                      <label key={table._id} className={`flex items-center space-x-2 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input
                          type="checkbox"
                          checked={selectedTablesForMerge.includes(table._id)}
                          disabled={isDisabled}
                          onChange={() => toggleTableSelection(table._id)}
                          className="rounded"
                        />
                        <span className="text-sm text-white">
                          {table.tableNumber} (Cap: {table.capacity})
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-purple-300 font-medium mt-1">
                  Selected: {selectedCapacity}/{guestCount}
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Table (Optional)
                </label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-white"
                >
                  <option value="">No Table</option>
                  {tables.filter(t => t.status === 'AVAILABLE' && (!guestCount || t.capacity >= parseInt(guestCount))).map(table => (
                    <option key={table._id} value={table._id}>
                      {table.tableNumber} (Capacity: {table.capacity})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Cart */}
      <FloatingCart
        orderItems={orderItems}
        updateItemQuantity={updateItemQuantity}
        removeItem={removeItem}
        calculateTotal={calculateTotal}
        onCheckout={() => handleSubmit()}
        loading={loading}
      />

      {/* Item Selection Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{selectedItem.itemName}</h3>
            
            {/* Variations */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">Select Variation</label>
              {selectedItem.variation?.map(variation => (
                <label key={variation._id} className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="variation"
                    checked={selectedVariation?._id === variation._id}
                    onChange={() => setSelectedVariation(variation)}
                    className="mr-2"
                  />
                  <span className="text-gray-900">{variation.name} - ₹{variation.price}</span>
                </label>
              ))}
            </div>
            
            {/* Addons */}
            {selectedItem.addon?.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">Select Addons</label>
                {selectedItem.addon.map(addon => (
                  <label key={addon._id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={selectedAddons.some(a => a._id === addon._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAddons(prev => [...prev, addon]);
                        } else {
                          setSelectedAddons(prev => prev.filter(a => a._id !== addon._id));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-gray-900">{addon.name} - ₹{addon.price}</span>
                  </label>
                ))}
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={closeItemModal}
                className="px-4 py-2 bg-white/30 backdrop-blur-md hover:bg-white/40 text-gray-900 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addItemToOrder}
                disabled={!selectedVariation}
                className="px-4 py-2 bg-white/30 backdrop-blur-md hover:bg-white/40 text-gray-900 rounded-xl transition-colors disabled:opacity-50"
              >
                Add to Order
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default CreateOrder;
