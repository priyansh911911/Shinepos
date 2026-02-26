import React, { useState, useEffect } from 'react';
import { FiX, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import SplitBill from './SplitBill';
import SplitBillPayment from './SplitBillPayment';

const PaymentModal = ({ order, onProcessPayment, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSplitBill, setShowSplitBill] = useState(false);
  const [showSplitPayment, setShowSplitPayment] = useState(false);
  const [splitBillData, setSplitBillData] = useState(null);
  const [existingSplitBill, setExistingSplitBill] = useState(null);
  const [checkingSplit, setCheckingSplit] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [loyaltySettings, setLoyaltySettings] = useState(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Check if split bill already exists
  useEffect(() => {
    checkExistingSplitBill();
    fetchCustomerLoyalty();
    // Check if coupon already applied
    if (order.discount?.couponCode) {
      setAppliedCoupon({
        code: order.discount.couponCode,
        name: order.discount.reason,
        amount: order.discount.amount
      });
    }
  }, [order._id]);

  const fetchCustomerLoyalty = async () => {
    if (!order.customerPhone) return;
    try {
      const token = localStorage.getItem('token');
      const [customerRes, settingsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/customers?phone=${order.customerPhone}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/loyalty/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      if (customerRes.ok) {
        const customers = await customerRes.json();
        const foundCustomer = customers.find(c => c.phone === order.customerPhone);
        setCustomer(foundCustomer);
      }
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setLoyaltySettings(settings);
      }
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    }
  };

  const checkExistingSplitBill = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/split-bill/${order._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setExistingSplitBill(data.splitBill);
      }
    } catch (error) {
      // No split bill exists, which is fine
    } finally {
      setCheckingSplit(false);
    }
  };

  const paymentMethods = [
    { value: 'CASH', label: 'Cash', icon: FiDollarSign },
    { value: 'CARD', label: 'Card', icon: FiCreditCard },
    { value: 'UPI', label: 'UPI', icon: FiCreditCard },
    { value: 'ONLINE', label: 'Online', icon: FiCreditCard }
  ];

  const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

  const calculateLoyaltyDiscount = () => {
    if (!loyaltySettings || pointsToRedeem === 0) return 0;
    return pointsToRedeem / loyaltySettings.redeemRate;
  };

  const getFinalAmount = () => {
    // Order totalAmount already includes coupon discount from backend
    return Math.max(0, order.totalAmount - calculateLoyaltyDiscount());
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/coupon/${order._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          customerId: customer?._id || null
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setAppliedCoupon(data.discountApplied);
        setCouponCode('');
        // Update order object
        order.totalAmount = data.order.totalAmount;
        order.discount = data.order.discount;
      } else {
        setCouponError(data.error || 'Invalid coupon');
      }
    } catch (error) {
      setCouponError('Failed to apply coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/coupon/${order._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setAppliedCoupon(null);
        // Update order object
        order.totalAmount = data.order.totalAmount;
        order.discount = data.order.discount;
        order.subtotal = data.order.subtotal;
      } else {
        alert('Failed to remove coupon');
      }
    } catch (error) {
      alert('Failed to remove coupon');
    }
  };

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
      amount: getFinalAmount(),
      transactionId: transactionId.trim() || undefined,
      loyaltyPointsUsed: pointsToRedeem
    };

    const result = await onProcessPayment(order._id, paymentData);
    
    if (!result.success) {
      setError(result.error);
      setLoading(false);
    } else {
      onClose();
    }
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

        {order.paymentDetails || order.status === 'PAID' ? (
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <div className="text-5xl mb-3">✅</div>
              <h4 className="text-xl font-bold text-green-800 mb-2">Payment Already Completed</h4>
              <p className="text-sm text-green-700 mb-4">This order has already been paid.</p>
              {order.paymentDetails && (
                <div className="text-sm text-gray-700 space-y-1">
                  <p><span className="font-medium">Method:</span> {order.paymentDetails.method}</p>
                  {order.paymentDetails.paidAt && (
                    <p><span className="font-medium">Paid at:</span> {new Date(order.paymentDetails.paidAt).toLocaleString()}</p>
                  )}
                </div>
              )}
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
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
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700">Subtotal:</span>
                <span className="font-medium text-gray-900">{formatCurrency(order.subtotal || order.totalAmount)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center mb-2 text-green-600">
                  <span className="text-sm">🎟️ Coupon ({appliedCoupon.code}):</span>
                  <span className="font-medium">-{formatCurrency(appliedCoupon.amount)}</span>
                </div>
              )}
              {pointsToRedeem > 0 && (
                <div className="flex justify-between items-center mb-2 text-purple-600">
                  <span className="text-sm">🎁 Loyalty Points:</span>
                  <span className="font-medium">-{formatCurrency(calculateLoyaltyDiscount())}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-white/20">
                <span className="text-sm text-gray-700">Total Amount:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(getFinalAmount())}
                </span>
              </div>
            </div>

            {/* Coupon Section */}
            {!appliedCoupon ? (
              <div className="mb-6 p-4 bg-orange-50/50 backdrop-blur-md rounded-xl border border-orange-200/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🎟️</span>
                  <span className="text-sm font-medium text-gray-900">Have a Coupon?</span>
                </div>
                {couponError && (
                  <div className="mb-3 text-xs text-red-600 bg-red-50 p-2 rounded">{couponError}</div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 bg-white/40 backdrop-blur-md border border-white/30 rounded-lg px-3 py-2 text-gray-900 text-sm uppercase"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={applyingCoupon || !couponCode.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 text-sm font-medium"
                  >
                    {applyingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-green-50/50 backdrop-blur-md rounded-xl border border-green-200/30">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">✅</span>
                      <span className="text-sm font-bold text-green-800">{appliedCoupon.name}</span>
                    </div>
                    <p className="text-xs text-green-700">Code: {appliedCoupon.code} • Saved {formatCurrency(appliedCoupon.amount)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-red-600 hover:text-red-800 text-xs font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Loyalty Points */}
            {customer && customer.loyaltyPoints > 0 && loyaltySettings && (
              <div className="mb-6 p-4 bg-purple-50/50 backdrop-blur-md rounded-xl border border-purple-200/30">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-900">🎁 Loyalty Points</span>
                  <span className="text-sm font-bold text-purple-600">{customer.loyaltyPoints} pts available</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">{loyaltySettings.redeemRate} points = ₹1 discount</p>
                <input
                  type="number"
                  min="0"
                  max={Math.min(customer.loyaltyPoints, Math.floor(order.totalAmount * loyaltySettings.redeemRate))}
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(Math.min(Number(e.target.value), customer.loyaltyPoints, Math.floor(order.totalAmount * loyaltySettings.redeemRate)))}
                  className="w-full bg-white/40 backdrop-blur-md border border-white/30 rounded-lg px-3 py-2 text-gray-900 text-sm"
                  placeholder="Points to redeem"
                />
                {pointsToRedeem > 0 && (
                  <p className="text-xs text-green-600 mt-2 font-medium">💰 You'll save {formatCurrency(calculateLoyaltyDiscount())}</p>
                )}
              </div>
            )}

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

            {/* Split Bill Option - Only show if no payment made */}
            {!order.paymentDetails && !order.status === 'PAID' && !existingSplitBill && (order.items.length > 1 || (order.extraItems && order.extraItems.length > 0)) && (
              <div className="mb-6 p-4 bg-blue-50/50 backdrop-blur-md rounded-xl border border-blue-200/30">
                <p className="text-sm text-gray-700 mb-3 font-medium">💳 Payment Options</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSplitBill(true)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm font-medium shadow-md"
                  >
                    Split Bill
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">💡 Split equally or by items among multiple people</p>
              </div>
            )}

            {!order.paymentDetails && order.status !== 'PAID' && existingSplitBill && existingSplitBill.status === 'ACTIVE' && (
              <div className="mb-6 p-4 bg-purple-50/50 backdrop-blur-md rounded-xl border border-purple-200/30">
                <p className="text-sm text-gray-700 mb-3 font-medium">💳 Split Payment Active</p>
                <button
                  type="button"
                  onClick={() => {
                    setSplitBillData(existingSplitBill);
                    setShowSplitPayment(true);
                  }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all text-sm font-medium shadow-md"
                >
                  View Split Payments
                </button>
                <p className="text-xs text-gray-500 mt-2">💡 Continue paying individual splits</p>
              </div>
            )}

            {!order.paymentDetails && order.status !== 'PAID' && existingSplitBill && existingSplitBill.status === 'COMPLETED' && (
              <div className="mb-6 p-4 bg-green-50/50 backdrop-blur-md rounded-xl border border-green-200/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">✅</span>
                  <p className="text-sm text-green-800 font-bold">All Splits Paid!</p>
                </div>
                <div className="space-y-2">
                  {existingSplitBill.splits.map((split) => (
                    <div key={split.splitNumber} className="flex justify-between items-center text-xs bg-white/50 rounded-lg p-2">
                      <span className="text-gray-700">{split.customerName}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-green-700">₹{split.totalAmount.toFixed(2)}</span>
                        <span className="text-green-600">✓ {split.paymentDetails?.method}</span>
                      </div>
                    </div>
                  ))}
                </div>
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
                {loading ? 'Processing...' : `Pay ${formatCurrency(getFinalAmount())}`}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Split Bill Modals */}
      {!order.paymentDetails && order.status !== 'PAID' && showSplitBill && (
        <SplitBill 
          orderId={order._id} 
          onClose={() => setShowSplitBill(false)}
          onSplitCreated={(splitBill) => {
            setSplitBillData(splitBill);
            setShowSplitBill(false);
            setShowSplitPayment(true);
          }}
        />
      )}
      
      {!order.paymentDetails && order.status !== 'PAID' && showSplitPayment && (
        <SplitBillPayment 
          orderId={order._id}
          splitBillData={splitBillData}
          onPaymentComplete={() => {
            setShowSplitPayment(false);
            setSplitBillData(null);
            onClose();
          }}
          onClose={() => {
            setShowSplitPayment(false);
            setSplitBillData(null);
          }} 
        />
      )}
    </div>
  );
};

export default PaymentModal;
