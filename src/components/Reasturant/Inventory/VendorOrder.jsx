import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEye, FiClock, FiCheck } from 'react-icons/fi';
import VendorCreateOrder from './VendorCreateOrder';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VendorOrder = () => {
  const [orders, setOrders] = useState([]);
  const [showCreateOrder, setShowCreateOrder] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/inventory/purchase-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'approved': return 'text-blue-600 bg-blue-50';
      case 'ordered': return 'text-purple-600 bg-purple-50';
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock />;
      case 'delivered': return <FiCheck />;
      default: return <FiEye />;
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/api/inventory/purchase-orders/${orderId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (showCreateOrder) {
    return (
      <VendorCreateOrder 
        onBack={() => setShowCreateOrder(false)}
        onOrderCreated={() => {
          setShowCreateOrder(false);
          fetchOrders();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Purchase Orders</h2>
          <p className="text-gray-600">Create and manage orders to vendors</p>
        </div>
        <button
          onClick={() => setShowCreateOrder(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2"
        >
          <FiPlus />
          <span>Create Order</span>
        </button>
      </div>

      <div className="bg-white/20 backdrop-blur-2xl rounded-2xl animate-fadeIn">
        <div className="p-4 border-b border-white/30">
          <h3 className="font-medium text-white">Order History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-white/10">
                  <td className="px-4 py-3 text-sm font-medium text-white">#{order.orderNumber || order._id.slice(-6)}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{order.vendorName}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{order.items?.length || 0} items</td>
                  <td className="px-4 py-3 text-sm font-medium text-white">₹{order.totalAmount?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 w-fit ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'approved')}
                          className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-xs"
                        >
                          Approve
                        </button>
                      )}
                      {order.status === 'approved' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'ordered')}
                          className="text-purple-600 hover:bg-purple-50 px-2 py-1 rounded text-xs"
                        >
                          Mark Ordered
                        </button>
                      )}
                      {order.status === 'ordered' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'delivered')}
                          className="text-green-600 hover:bg-green-50 px-2 py-1 rounded text-xs"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-300">
            No purchase orders found. Create your first order!
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOrder;
