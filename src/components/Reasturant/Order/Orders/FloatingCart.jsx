import React, { useState } from 'react';
import { FiShoppingCart, FiPlus, FiMinus, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingCart = ({ orderItems, updateItemQuantity, removeItem, calculateTotal, onCheckout, loading }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Cart Button */}
      <motion.button
        type="button"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-2xl flex items-center justify-center z-50"
      >
        <FiShoppingCart size={24} />
        {orderItems.length > 0 && (
          <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            {orderItems.length}
          </span>
        )}
      </motion.button>

      {/* Cart Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white/95 backdrop-blur-xl shadow-2xl z-[10001] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">🛒 Your Cart</h2>
                  <button type="button" onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-200 rounded-full">
                    <FiX size={24} />
                  </button>
                </div>

                {/* Cart Items */}
                <div className="space-y-3 mb-6">
                  {orderItems.length > 0 ? (
                    orderItems.map((item) => (
                      <div key={item.key} className="bg-gray-100 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">{item.variation.name} - ₹{item.price}</p>
                            {item.addons.length > 0 && (
                              <p className="text-xs text-gray-500">+ {item.addons.map(a => a.name).join(', ')}</p>
                            )}
                          </div>
                          <button type="button" onClick={() => removeItem(item.key)} className="text-red-500 hover:text-red-700">
                            <FiX size={20} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.key, item.quantity - 1)}
                              className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                            >
                              <FiMinus size={14} />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.key, item.quantity + 1)}
                              className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600"
                            >
                              <FiPlus size={14} />
                            </button>
                          </div>
                          <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <div className="text-4xl mb-2">🛒</div>
                      <p>Your cart is empty</p>
                    </div>
                  )}
                </div>

                {/* Total & Checkout */}
                {orderItems.length > 0 && (
                  <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl pt-4 border-t border-gray-300">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-green-600">₹{calculateTotal().toFixed(2)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onCheckout();
                        setIsOpen(false);
                      }}
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingCart;
