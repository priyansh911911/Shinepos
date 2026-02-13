import React, { useState } from 'react';
import { FiRefreshCw, FiUser, FiPhone, FiGrid, FiShoppingBag, FiFileText, FiPlus, FiRotateCcw, FiCreditCard, FiChevronDown, FiCheckCircle, FiEye } from 'react-icons/fi';

const OrderList = ({ orders, onViewOrder, onUpdateStatus, onProcessPayment, onRefresh, onUpdatePriority, onTransfer, onAddItems, onViewSplitBill, activeTab, setActiveTab }) => {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [expandedOrderItems, setExpandedOrderItems] = useState(null);
  const [refreshingList, setRefreshingList] = useState(false);

  
  

  const statusColors = {
    PENDING: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white',
    PREPARING: 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
    READY: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
    DELIVERED: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    CANCELLED: 'bg-gradient-to-r from-red-500 to-red-700 text-white',
    PAID: 'bg-gradient-to-r from-gray-600 to-gray-800 text-white'
  };

  const filteredOrders = filterStatus === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const [selectedOrder, setSelectedOrder] = useState(null);

  // Set first order as selected by default
  React.useEffect(() => {
    if (filteredOrders.length > 0 && !selectedOrder) {
      setSelectedOrder(filteredOrders[0]);
    }
  }, [filteredOrders, selectedOrder]);

  const handleRefresh = async () => {
    setRefreshingList(true);
    await onRefresh();
    setRefreshingList(false);
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  return (
    <div className="space-y-6">
      {/* Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side - Order List */}
        <div className="bg-white/20 backdrop-blur-xl rounded-2xl overflow-hidden lg:col-span-1 self-start sticky top-6">
          <div className="p-4">
            <h3 className="text-xl font-bold text-gray-900"><FiShoppingBag className="inline mr-2" />Orders ({filteredOrders.length})</h3>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-300px)] p-4 space-y-3">
            {refreshingList ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
              </div>
            ) : (
              <>
                {filteredOrders.map((order) => (
              <div
                key={order._id}
                onClick={() => handleOrderClick(order)}
                className={`bg-white/30 backdrop-blur-md rounded-xl p-4 cursor-pointer transition-colors hover:bg-white/40 ${
                  selectedOrder?._id === order._id ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{order.customerName}</h4>
                    <p className="text-xs text-gray-700"><FiGrid className="inline mr-1" />{order.tableNumber || 'N/A'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-900 text-sm cursor-pointer" onClick={(e) => {
                    e.stopPropagation();
                    setExpandedOrderItems(expandedOrderItems === order._id ? null : order._id);
                  }}>
                    <div className="flex items-center gap-1">
                      <FiChevronDown className={`transition-transform ${expandedOrderItems === order._id ? 'rotate-180' : ''}`} />
                      <span>{order.items.length} items</span>
                    </div>
                    {expandedOrderItems === order._id && (
                      <div className="mt-2 space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-xs text-gray-700">{item.quantity}x {item.name}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
                ))}
                {filteredOrders.length === 0 && (
                  <div className="text-center py-10">
                    <div className="text-5xl mb-3">🍽️</div>
                    <p className="text-gray-900 font-medium">No orders found</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Side - Order Details */}
        <div className="bg-white/15 backdrop-blur-xl rounded-2xl overflow-hidden lg:col-span-2">
          {selectedOrder ? (
            <>
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900"><FiFileText className="inline mr-2" />Order Details</h3>
              </div>
              <div className="p-6 space-y-4">
                {/* Customer Info & Order Items in Same Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Customer Info */}
                  <div className="bg-white/30 backdrop-blur-md rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-3"><FiUser className="inline mr-2" />Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-900"><span className="font-medium">Name:</span> {selectedOrder.customerName}</p>
                      {selectedOrder.customerPhone && (
                        <p className="text-gray-900"><span className="font-medium">Phone:</span> {selectedOrder.customerPhone}</p>
                      )}
                      <p className="text-gray-900"><span className="font-medium">Table:</span> {selectedOrder.tableNumber || 'N/A'}</p>
                      {selectedOrder.mergedTableNumbers && selectedOrder.mergedTableNumbers.length > 0 && (
                        <p className="text-purple-700 font-medium"><FiRotateCcw className="inline mr-1" />Merged: {selectedOrder.mergedTableNumbers.join(', ')}</p>
                      )}
                    </div>

                    {/* Payment Breakdown */}
                    <div className="mt-4 pt-3 border-t border-gray-400">
                      <h5 className="font-semibold text-gray-900 mb-2 text-xs">Payment Breakdown</h5>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between text-gray-800">
                          <span>Items Total:</span>
                          <span className="font-medium">{formatCurrency(selectedOrder.subtotal || selectedOrder.totalAmount)}</span>
                        </div>
                        {selectedOrder.discount && selectedOrder.discount.amount > 0 && (
                          <div className="flex justify-between text-red-600">
                            <span>Discount ({selectedOrder.discount.percentage}%):</span>
                            <span className="font-medium">-{formatCurrency(selectedOrder.discount.amount)}</span>
                          </div>
                        )}
                        {(selectedOrder.gst > 0 || selectedOrder.sgst > 0) && (
                          <>
                            <div className="flex justify-between text-gray-800">
                              <span>GST (2.5%):</span>
                              <span className="font-medium">{formatCurrency(selectedOrder.gst || 0)}</span>
                            </div>
                            <div className="flex justify-between text-gray-800">
                              <span>SGST (2.5%):</span>
                              <span className="font-medium">{formatCurrency(selectedOrder.sgst || 0)}</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between pt-1 border-t border-gray-400 font-bold text-gray-900">
                          <span>Total:</span>
                          <span className="text-sm">{formatCurrency(selectedOrder.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-white/30 backdrop-blur-md rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-3"><FiShoppingBag className="inline mr-2" />Order Items</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-start text-sm p-2 rounded-lg bg-white/20">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{item.quantity}x {item.name}</p>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                item.status === 'PENDING' ? 'bg-yellow-500 text-white' :
                                item.status === 'PREPARING' ? 'bg-orange-500 text-white' :
                                item.status === 'READY' ? 'bg-green-500 text-white' :
                                item.status === 'SERVED' ? 'bg-purple-500 text-white' :
                                'bg-gray-500 text-white'
                              }`}>
                                {item.status || 'PENDING'}
                              </span>
                            </div>
                            {item.variation && <p className="text-xs text-gray-700">Variation: {item.variation.name}</p>}
                          </div>
                          <span className="font-bold text-gray-900">{formatCurrency(item.itemTotal || (item.variation?.price * item.quantity) || (item.basePrice * item.quantity) || 0)}</span>
                        </div>
                      ))}
                      {selectedOrder.extraItems && selectedOrder.extraItems.length > 0 && (
                        <>
                          <div className="border-t border-red-400 pt-2 mt-2">
                            <p className="text-[10px] font-bold text-red-600 mb-1">EXTRA ITEMS</p>
                          </div>
                          {selectedOrder.extraItems.map((item, index) => (
                            <div key={`extra-${index}`} className="flex justify-between items-start text-sm p-2 rounded-lg bg-red-50/30 border border-red-300">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-900">{item.quantity}x {item.name}</p>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                    item.status === 'PENDING' ? 'bg-yellow-500 text-white' :
                                    item.status === 'PREPARING' ? 'bg-orange-500 text-white' :
                                    item.status === 'READY' ? 'bg-green-500 text-white' :
                                    item.status === 'SERVED' ? 'bg-purple-500 text-white' :
                                    'bg-gray-500 text-white'
                                  }`}>
                                    {item.status || 'PENDING'}
                                  </span>
                                </div>
                                {item.variation && <p className="text-xs text-gray-700">Variation: {item.variation.name}</p>}
                              </div>
                              <span className="font-bold text-gray-900">{formatCurrency(item.itemTotal || item.total || 0)}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Summary & Actions */}
                <div className="bg-white/30 backdrop-blur-md rounded-xl p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-900 font-medium">Status:</span>
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => onUpdateStatus(selectedOrder._id, e.target.value)}
                        className="px-3 py-2 bg-white/50 backdrop-blur-md border border-white/30 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="READY">Ready</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                  <div className="flex space-x-2">
                    {selectedOrder.status !== 'PAID' && selectedOrder.status !== 'CANCELLED' && !selectedOrder.paymentDetails && (
                      <button
                        onClick={() => onAddItems && onAddItems(selectedOrder._id)}
                        className="flex-1 p-3 bg-white/30 backdrop-blur-md hover:bg-white/50 text-gray-900 rounded-xl font-medium transition-colors"
                      >
                        <FiPlus className="inline mr-1" />Add
                      </button>
                    )}
                    {selectedOrder.tableId && selectedOrder.status !== 'PAID' && selectedOrder.status !== 'CANCELLED' && (
                      <button
                        onClick={() => onTransfer(selectedOrder)}
                        className="flex-1 p-3 bg-white/30 backdrop-blur-md hover:bg-white/50 text-gray-900 rounded-xl font-medium transition-colors"
                      >
                        <FiRotateCcw className="inline mr-1" />Transfer
                      </button>
                    )}
                    {selectedOrder.hasSplitBill && !selectedOrder.paymentDetails && (
                      <button
                        onClick={() => onViewSplitBill && onViewSplitBill(selectedOrder)}
                        className="flex-1 p-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium transition-colors shadow-md hover:from-purple-600 hover:to-purple-700"
                      >
                        <FiEye className="inline mr-1" />View Split
                      </button>
                    )}
                    {selectedOrder.status === 'DELIVERED' && selectedOrder.status !== 'PAID' && selectedOrder.status !== 'CANCELLED' && !selectedOrder.paymentDetails && !selectedOrder.hasSplitBill && (
                      <button
                        onClick={() => onProcessPayment(selectedOrder)}
                        className="flex-1 p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium transition-colors shadow-md hover:from-green-600 hover:to-emerald-600"
                      >
                        <FiCreditCard className="inline mr-1" />Pay
                      </button>
                    )}
                    {(selectedOrder.status === 'PAID' || selectedOrder.paymentDetails) && (
                      <div className="flex-1 p-3 bg-green-100 text-green-800 rounded-xl font-medium text-center">
                        <FiCheckCircle className="inline mr-1" />Paid
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full p-10">
              <div className="text-center">
                <div className="text-6xl mb-4">👈</div>
                <p className="text-gray-900 font-medium text-lg">Select an order to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderList;
