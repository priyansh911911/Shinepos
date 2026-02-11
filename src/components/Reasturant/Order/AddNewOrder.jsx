import React from 'react';
import { FiPlus, FiMinus, FiX, FiSearch } from 'react-icons/fi';
import { useAddNewOrder } from './hooks/useAddNewOrder';

const AddNewOrder = ({ onClose, orderId }) => {
  const {
    menuItems,
    orderItems,
    loading,
    loadingMenu,
    error,
    selectedItem,
    selectedVariation,
    setSelectedVariation,
    selectedAddons,
    setSelectedAddons,
    searchTerm,
    setSearchTerm,
    openItemModal,
    closeItemModal,
    addItemToOrder,
    updateItemQuantity,
    removeItem,
    calculateTotal,
    handleAddItemsToOrder
  } = useAddNewOrder(orderId);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center pl-34 p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden">
          <div className="p-4 border-b border-white/20 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Add Items to Order</h2>
            <button
              onClick={() => onClose()}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="p-4 overflow-y-auto max-h-[calc(85vh-120px)]">
            {error && (
              <div className="bg-red-500/80 backdrop-blur-md border border-red-600/50 text-white px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-base font-medium text-gray-900">Selected Items</h3>
                
                {orderItems.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {orderItems.map((item) => (
                      <div key={item.key} className="flex items-center justify-between bg-white/40 backdrop-blur-md p-2 rounded-xl border border-white/30">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm truncate">{item.name}</div>
                          <div className="text-xs text-gray-700">
                            {item.variation.name} - ₹{item.price}
                            {item.addons.length > 0 && (
                              <div className="text-xs text-gray-600 truncate">
                                + {item.addons.map(a => a.name).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.key, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg"
                          >
                            <FiMinus size={12} />
                          </button>
                          
                          <span className="w-6 text-center font-medium text-gray-900 text-sm">{item.quantity}</span>
                          
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.key, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 transition-all shadow-lg"
                          >
                            <FiPlus size={12} />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => removeItem(item.key)}
                            className="w-7 h-7 flex items-center justify-center bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-all shadow-lg"
                          >
                            <FiX size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-600 text-center py-6 bg-white/30 backdrop-blur-md rounded-xl">
                    <div className="text-3xl mb-2">🍽️</div>
                    <p className="text-sm">No items selected</p>
                  </div>
                )}

                <div className="text-right bg-white/40 backdrop-blur-md p-2 rounded-xl border border-white/30">
                  <div className="text-base font-semibold text-gray-900">
                    Total: ₹{calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center gap-2">
                  <h3 className="text-base font-medium text-gray-900">Menu Items</h3>
                  <div className="relative flex-1 max-w-xs">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" size={14} />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-sm bg-white/40 backdrop-blur-md border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                  {loadingMenu ? (
                    <div className="col-span-2 text-center py-8 text-gray-600">
                      <div className="text-3xl mb-2">🔄</div>
                      <p className="text-sm">Loading menu items...</p>
                    </div>
                  ) : menuItems
                    .filter(item => 
                      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((item) => (
                      <div key={item._id} className="bg-white/40 backdrop-blur-md border border-white/30 rounded-xl p-2">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-gray-900 text-xs truncate">{item.itemName}</h4>
                          <span className="text-xs font-semibold text-green-600 whitespace-nowrap ml-1">
                            ₹{item.variation && item.variation.length > 0 
                              ? Math.min(...item.variation.map(v => v.price || 0))
                              : 0}
                          </span>
                        </div>
                        
                        {item.description && (
                          <p className="text-xs text-gray-700 mb-1 line-clamp-1">{item.description}</p>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => openItemModal(item)}
                          disabled={item.status !== 'active'}
                          className={`w-full py-1 px-2 rounded-lg text-xs font-medium transition-all ${
                            item.status === 'active'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg'
                              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          }`}
                        >
                          {item.status === 'active' ? '➕' : 'N/A'}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-white/20">
              <button
                type="button"
                onClick={() => onClose()}
                className="px-4 py-2 text-sm bg-white/30 backdrop-blur-md border border-white/30 text-gray-900 rounded-xl hover:bg-white/40 transition-all"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={async () => {
                  await handleAddItemsToOrder();
                  onClose(true);
                }}
                disabled={loading || orderItems.length === 0}
                className="px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
              >
                {loading ? 'Adding...' : 'Add Items'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{selectedItem.itemName}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">Select Variation</label>
              {selectedItem.variation?.map(variation => (
                <label key={variation._id} className="flex items-center mb-2 p-2 bg-white/40 backdrop-blur-md rounded-lg hover:bg-white/50 cursor-pointer">
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
                  <label key={addon._id} className="flex items-center mb-2 p-2 bg-white/40 backdrop-blur-md rounded-lg hover:bg-white/50 cursor-pointer">
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
                className="px-4 py-2 bg-white/30 backdrop-blur-md border border-white/30 text-gray-900 rounded-xl hover:bg-white/40 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addItemToOrder}
                disabled={!selectedVariation}
                className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddNewOrder;
