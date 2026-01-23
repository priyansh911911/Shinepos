import React, { useState } from 'react';
import { FiPlus, FiEye, FiClipboard, FiRefreshCw, FiArchive, FiList } from 'react-icons/fi';
import OrderList from './OrderList';
import CreateOrder from './CreateOrder';
import OrderDetails from './OrderDetails';
import OrderHistory from './OrderHistory';
import PaymentModal from '../Payment/PaymentModal';
import TransferModal from './TransferModal';
import AddNewOrder from '../AddNewOrder';
import { useOrders } from './hooks/useOrders';

const Order = () => {
  const [showAddItems, setShowAddItems] = useState(null);
  const {
    orders,
    loading,
    error,
    activeTab,
    setActiveTab,
    selectedOrder,
    setSelectedOrder,
    showPaymentModal,
    setShowPaymentModal,
    showTransferModal,
    setShowTransferModal,
    fetchOrders,
    handleCreateOrder,
    handleUpdateStatus,
    handleUpdatePriority,
    handleProcessPayment,
    handleViewOrder,
    handlePaymentClick,
    handleTransferClick,
    handleTransferSuccess
  } = useOrders();

  const handleAddItems = (orderId) => {
    console.log('handleAddItems called with orderId:', orderId);
    setShowAddItems(orderId);
  };

  const handleAddItemsClose = (shouldRefresh = false) => {
    setShowAddItems(null);
    if (shouldRefresh) {
      fetchOrders();
    }
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-xl mb-6 animate-slideIn">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Persistent Navigation Header */}
        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-3 sm:p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('list')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center justify-center space-x-2 font-medium transition-colors text-sm ${
                  activeTab === 'list' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                    : 'bg-white/30 text-gray-900 hover:bg-white/40'
                }`}
              >
                <FiClipboard />
                <span className="hidden sm:inline">Orders</span>
              </button>
              
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center justify-center space-x-2 font-medium transition-colors text-sm ${
                  activeTab === 'create' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                    : 'bg-white/30 text-gray-900 hover:bg-white/40'
                }`}
              >
                <FiPlus />
                <span className="hidden sm:inline">New Order</span>
              </button>
              
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center justify-center space-x-2 font-medium transition-colors text-sm ${
                  activeTab === 'history' 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
                    : 'bg-white/30 text-gray-900 hover:bg-white/40'
                }`}
              >
                <FiArchive />
                <span className="hidden sm:inline">History</span>
              </button>
              
              <select
                className="flex-1 sm:flex-none bg-white/30 backdrop-blur-md border border-white/40 text-gray-900 rounded-xl px-3 sm:px-6 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium text-sm"
              >
                <option value="ALL">All Orders</option>
                <option value="PENDING">Pending</option>
                <option value="PREPARING">Preparing</option>
                <option value="READY">Ready</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="PAID">Paid</option>
              </select>
            </div>
            
            <button
              onClick={fetchOrders}
              className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/30 backdrop-blur-md hover:bg-white/40 text-gray-900 rounded-xl transition-colors font-medium text-sm"
            >
              <FiRefreshCw />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {!loading && (
          <>
            {activeTab === 'list' && (
              <div className="animate-fadeIn">
                <OrderList
                  orders={orders}
                  onViewOrder={handleViewOrder}
                  onUpdateStatus={handleUpdateStatus}
                  onUpdatePriority={handleUpdatePriority}
                  onProcessPayment={handlePaymentClick}
                  onAddItems={handleAddItems}
                  onTransfer={handleTransferClick}
                  onRefresh={fetchOrders}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  showNavigation={false}
                />
              </div>
            )}

            {activeTab === 'create' && (
              <div className="animate-fadeIn">
                <CreateOrder
                  onCreateOrder={handleCreateOrder}
                  onCancel={() => setActiveTab('list')}
                />
              </div>
            )}

            {activeTab === 'details' && selectedOrder && (
              <OrderDetails
                order={selectedOrder}
                onUpdateStatus={handleUpdateStatus}
                onProcessPayment={handlePaymentClick}
                onBack={() => setActiveTab('list')}
              />
            )}

            {activeTab === 'history' && (
              <div className="animate-fadeIn">
                <OrderHistory />
              </div>
            )}

            {showPaymentModal && selectedOrder && (
              <PaymentModal
                order={selectedOrder}
                onProcessPayment={handleProcessPayment}
                onClose={() => setShowPaymentModal(false)}
              />
            )}

            {showAddItems && (
              <div>
                <p>Debug: showAddItems = {showAddItems}</p>
                <AddNewOrder
                  orderId={showAddItems}
                  onClose={handleAddItemsClose}
                />
              </div>
            )}

            {showTransferModal && selectedOrder && (
              <TransferModal
                order={selectedOrder}
                onClose={() => {
                  setShowTransferModal(false);
                  setSelectedOrder(null);
                }}
                onSuccess={handleTransferSuccess}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Order;