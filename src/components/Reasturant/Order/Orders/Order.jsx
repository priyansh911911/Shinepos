import React, { useState } from 'react';
import { FiPlus, FiEye } from 'react-icons/fi';
import OrderList from './OrderList';
import CreateOrder from './CreateOrder';
import OrderDetails from './OrderDetails';
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

  const handleAddItemsClose = () => {
    setShowAddItems(null);
    fetchOrders();
    setActiveTab('list'); // Redirect to orders page
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse-slow">🍽️</div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-xl mb-6 shadow-lg animate-slideIn">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

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
          />
        </div>
        <OrderList
          orders={orders}
          onViewOrder={handleViewOrder}
          onUpdateStatus={handleUpdateStatus}
          onUpdatePriority={handleUpdatePriority}
          onProcessPayment={handlePaymentClick}
          onAddItems={handleAddItems}
          onTransfer={handleTransferClick}
          onRefresh={fetchOrders}
        />
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
      </div>
    </div>
  );
};

export default Order;