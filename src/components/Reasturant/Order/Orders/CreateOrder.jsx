import React from 'react';
import { useCreateOrder } from './hooks/useCreateOrder';
import FloatingCart from './FloatingCart';
import OrderItemsList from './OrderItemsList';

const CreateOrder = ({ onCreateOrder, onCancel }) => {
  const [step, setStep] = React.useState(1);
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

  const handleNext = () => {
    if (!customerName || !guestCount) {
      alert('Please fill in customer name and guest count');
      return;
    }
    setStep(2);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/80 backdrop-blur-md border border-red-600/50 text-white px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Customer Details */}
      {step === 1 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 lg:p-6 border border-white/20 mx-auto">
          <h3 className="text-xl font-bold text-white mb-6">👤 Customer Information</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-gray-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Number of Guests *
              </label>
              <input
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-gray-300"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Discount (%)
              </label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-gray-300"
                min="0"
                max="100"
                placeholder="0"
              />
            </div>

            {showMergeOption ? (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">
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
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">
                  Table (Optional)
                </label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 text-white"
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

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium shadow-lg"
            >
              Next: Select Items →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Menu Selection */}
      {step === 2 && (
        <>
          <OrderItemsList
            menuItems={menuItems}
            loadingMenu={loadingMenu}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            fetchMenuItems={fetchMenuItems}
            openItemModal={openItemModal}
          />

          <FloatingCart
            orderItems={orderItems}
            updateItemQuantity={updateItemQuantity}
            removeItem={removeItem}
            calculateTotal={calculateTotal}
            onCheckout={() => handleSubmit()}
            loading={loading}
          />
        </>
      )}

      {/* Item Selection Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{selectedItem.itemName}</h3>
            
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
