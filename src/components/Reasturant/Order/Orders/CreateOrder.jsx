import React from 'react';
import { FiPlus, FiMinus, FiX } from 'react-icons/fi';
import { useCreateOrder } from './hooks/useCreateOrder';

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
    handleSubmit
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
        <h3 className="text-base lg:text-lg font-bold text-white mb-3 lg:mb-4">🍽️ Menu Items</h3>
        
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
              <div key={item._id} className="bg-white/20 backdrop-blur-md rounded-xl p-3 lg:p-4 border border-white/20 hover:bg-white/25 transition-all h-32 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-white text-sm lg:text-base line-clamp-1">{item.itemName}</h4>
                  <span className="text-xs lg:text-sm font-semibold text-green-300 flex-shrink-0 ml-2">
                    ₹{item.variation && item.variation.length > 0 
                      ? Math.min(...item.variation.map(v => v.price || 0))
                      : 0}
                  </span>
                </div>
                
                {item.description && (
                  <p className="text-xs text-gray-300 mb-2 line-clamp-2">{item.description}</p>
                )}
                
                <button
                  type="button"
                  onClick={() => openItemModal(item)}
                  disabled={item.status !== 'active'}
                  className={`w-full py-1.5 px-2 rounded-lg text-xs font-medium transition-all mt-auto ${
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

      {/* Right Side - Customer Info & Order Items */}
      <div className="lg:col-span-2 space-y-4 lg:space-y-6">
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
                  {tables.filter(t => t.status === 'AVAILABLE').map(table => (
                    <option key={table._id} value={table._id}>
                      {table.tableNumber} (Capacity: {table.capacity})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 lg:p-6 border border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 lg:mb-4 gap-2">
            <h3 className="text-base lg:text-lg font-bold text-white">🍕 Order Items</h3>
            <div className="text-lg lg:text-xl font-bold text-green-300">
              Total: ₹{calculateTotal().toFixed(2)}
            </div>
          </div>
          
          {orderItems.length > 0 ? (
            <div className="space-y-2 max-h-48 lg:max-h-64 overflow-y-auto">
              {orderItems.map((item) => (
                <div key={item.key} className="flex items-center justify-between bg-white/20 backdrop-blur-md p-2 lg:p-3 rounded-xl border border-white/20 gap-2 h-16">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm lg:text-base truncate">{item.name}</div>
                    <div className="text-xs lg:text-sm text-gray-300 truncate">
                      {item.variation.name} - ₹{item.price}
                      {item.addons.length > 0 && (
                        <span className="text-xs text-gray-400 ml-1">
                          + {item.addons.map(a => a.name).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 lg:space-x-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => updateItemQuantity(item.key, item.quantity - 1)}
                      className="w-7 h-7 lg:w-8 lg:h-8 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg"
                    >
                      <FiMinus size={12} />
                    </button>
                    
                    <span className="w-6 lg:w-8 text-center font-medium text-white text-sm">{item.quantity}</span>
                    
                    <button
                      type="button"
                      onClick={() => updateItemQuantity(item.key, item.quantity + 1)}
                      className="w-7 h-7 lg:w-8 lg:h-8 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 transition-all shadow-lg"
                    >
                      <FiPlus size={12} />
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      className="w-7 h-7 lg:w-8 lg:h-8 flex items-center justify-center bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-all shadow-lg"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 lg:py-10 text-gray-300">
              <div className="text-3xl lg:text-4xl mb-2">🍽️</div>
              <p className="text-sm">No items added yet</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 lg:gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 lg:px-6 py-2 lg:py-3 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-xl transition-all border border-white/30 font-medium text-sm lg:text-base"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading || orderItems.length === 0}
            className="w-full sm:w-auto px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg text-sm lg:text-base"
          >
            {loading ? 'Creating...' : '✓ Create Order'}
          </button>
        </div>
      </div>

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
