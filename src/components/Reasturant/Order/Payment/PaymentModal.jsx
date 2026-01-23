import React, { useState } from 'react';
import { FiX, FiCreditCard, FiDollarSign } from 'react-icons/fi';

const PaymentModal = ({ order, onProcessPayment, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const paymentMethods = [
    { value: 'CASH', label: 'Cash', icon: FiDollarSign },
    { value: 'CARD', label: 'Card', icon: FiCreditCard },
    { value: 'UPI', label: 'UPI', icon: FiCreditCard },
    { value: 'ONLINE', label: 'Online', icon: FiCreditCard }
  ];

  const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if ((paymentMethod !== 'CASH') && !transactionId.trim()) {
      setError('Transaction ID is required for non-cash payments');
      return;
    }

    setLoading(true);
    setError('');

    const paymentData = {
      method: paymentMethod,
      amount: order.totalAmount,
      transactionId: transactionId.trim() || undefined
    };

    const result = await onProcessPayment(order._id, paymentData);
    
    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
    // Modal will close automatically on success
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h3 className="text-lg font-semibold text-gray-900">Process Payment</h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-500/80 backdrop-blur-md border border-red-600/50 text-white px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-white/40 backdrop-blur-md rounded-xl p-4 mb-6 border border-white/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700">Order Number:</span>
              <span className="font-medium text-gray-900">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700">Customer:</span>
              <span className="font-medium text-gray-900">{order.customerName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Total Amount:</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setPaymentMethod(method.value)}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-xl transition-all ${
                      paymentMethod === method.value
                        ? 'bg-white/60 backdrop-blur-lg text-gray-900 shadow-lg border border-white/50'
                        : 'bg-white/30 backdrop-blur-md text-gray-700 hover:bg-white/40 border border-white/30'
                    }`}
                  >
                    <IconComponent size={18} />
                    <span className="text-sm font-medium">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transaction ID */}
          {paymentMethod !== 'CASH' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Transaction ID *
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full bg-white/40 backdrop-blur-md border border-white/30 rounded-xl px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter transaction ID"
                required
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/30 backdrop-blur-md border border-white/30 text-gray-900 rounded-xl hover:bg-white/40 transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
            >
              {loading ? 'Processing...' : `Process ${formatCurrency(order.totalAmount)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;