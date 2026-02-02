import React from 'react';
import { FiPlus, FiMinus, FiX } from 'react-icons/fi';

const OrderItemsList = ({ orderItems, updateItemQuantity, removeItem, calculateTotal }) => {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 lg:p-6 border border-white/20 h-[380px] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 lg:mb-4 gap-2 flex-shrink-0">
        <h3 className="text-base lg:text-lg font-bold text-white">🍕 Order Items</h3>
        <div className="text-lg lg:text-xl font-bold text-green-300">
          Total: ₹{calculateTotal().toFixed(2)}
        </div>
      </div>
      
      {orderItems.length > 0 ? (
        <div className="space-y-2 flex-1 overflow-y-auto">
          {orderItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between bg-white/20 backdrop-blur-md p-2 lg:p-3 rounded-xl border border-white/20 gap-2 h-16 flex-shrink-0">
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
        <div className="text-center py-8 lg:py-10 text-gray-300 flex-1 flex items-center justify-center">
          <div>
            <div className="text-3xl lg:text-4xl mb-2">🍽️</div>
            <p className="text-sm">No items added yet</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderItemsList;
