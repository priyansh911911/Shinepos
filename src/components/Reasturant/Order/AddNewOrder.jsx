import React from 'react';
import { FiPlus, FiMinus, FiX, FiSearch } from 'react-icons/fi';
import { useAddNewOrder } from './hooks/useAddNewOrder';

const AddNewOrder = ({ onClose, orderId }) => {
  const {
    menuItems,
    orderItems,
    loading,
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Add Items to Order</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">Selected Items</h3>
                
                {orderItems.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {orderItems.map((item) => (
                      <div key={item.key} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">
                            {item.variation.name} - ₹{item.price}
                            {item.addons.length > 0 && (
                              <div className="text-xs text-gray-500">
                                + {item.addons.map(a => a.name).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.key, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                          >
                            <FiMinus size={14} />
                          </button>
                          
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.key, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                          >
                            <FiPlus size={14} />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => removeItem(item.key)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    No items selected
                  </div>
                )}

                <div className="text-right">
                  <div className="text-lg font-semibold">
                    Total: ₹{calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-800">Menu Items</h3>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                  {menuItems
                    .filter(item => 
                      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((item) => (
                      <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-800">{item.itemName}</h4>
                          <span className="text-sm font-semibold text-green-600">
                            ₹{item.variation && item.variation.length > 0 
                              ? Math.min(...item.variation.map(v => v.price || 0))
                              : 0}
                          </span>
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => openItemModal(item)}
                          disabled={item.status !== 'active'}
                          className={`w-full py-2 px-4 rounded-lg text-sm font-medium ${
                            item.status === 'active'
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {item.status === 'active' ? 'Add to Order' : 'Not Available'}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={async () => {
                  await handleAddItemsToOrder();
                  onClose(); // Always close and redirect
                }}
                disabled={loading || orderItems.length === 0}
                className={`px-6 py-2 rounded-lg ${orderItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white disabled:opacity-50`}
              >
                {loading ? 'Adding...' : 'Add Items'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{selectedItem.itemName}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Variation</label>
              {selectedItem.variation?.map(variation => (
                <label key={variation._id} className="flex items-center mb-2">
                  <input
                    type="radio"
                    name="variation"
                    checked={selectedVariation?._id === variation._id}
                    onChange={() => setSelectedVariation(variation)}
                    className="mr-2"
                  />
                  {variation.name} - ₹{variation.price}
                </label>
              ))}
            </div>
            
            {selectedItem.addon?.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Addons</label>
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
                    {addon.name} - ₹{addon.price}
                  </label>
                ))}
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={closeItemModal}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addItemToOrder}
                disabled={!selectedVariation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                Add to Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddNewOrder;