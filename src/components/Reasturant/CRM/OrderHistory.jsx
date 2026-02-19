import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaCalendar, FaShoppingBag } from 'react-icons/fa';
import axios from 'axios';

const OrderHistory = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchOrderHistory = async (customerId) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/customers/${customerId}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(data);
      setSelectedCustomer(customers.find(c => c._id === customerId));
    } catch (error) {
      console.error('Error fetching order history:', error);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <h2 className="text-2xl font-bold text-white mb-6">Customer Order History</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="mb-4 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-300" />
            <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-300" />
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden max-h-[600px] overflow-y-auto">
            {filteredCustomers.map((customer) => (
              <div key={customer._id} onClick={() => fetchOrderHistory(customer._id)}
                className={`p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors ${selectedCustomer?._id === customer._id ? 'bg-white/5' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-semibold">{customer.name}</h3>
                    <p className="text-gray-300 text-sm">{customer.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-400 font-semibold">{customer.totalOrders || 0} orders</p>
                    <p className="text-green-400 text-sm">₹{(customer.totalSpent || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {selectedCustomer ? (
            <>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl mb-4 shadow-lg">
                <h3 className="text-white text-xl font-bold">{selectedCustomer.name}</h3>
                <p className="text-blue-100">{selectedCustomer.phone}</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-blue-100 text-sm">Total Orders</p>
                    <p className="text-white text-2xl font-bold">{selectedCustomer.totalOrders || 0}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Total Spent</p>
                    <p className="text-white text-2xl font-bold">₹{(selectedCustomer.totalSpent || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden max-h-[500px] overflow-y-auto">
                {orders.length > 0 ? orders.map((order) => (
                  <div key={order._id} className="p-4 border-b border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-semibold">Order #{order.orderNumber}</p>
                        <p className="text-gray-300 text-sm flex items-center gap-2">
                          <FaCalendar /> {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">₹{order.totalAmount.toFixed(2)}</p>
                        <span className={`text-xs px-2 py-1 rounded ${order.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'} text-white`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      {order.items?.map((item, idx) => (
                        <p key={idx} className="text-gray-300 text-sm">• {item.name} x{item.quantity}</p>
                      ))}
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-gray-300">
                    <FaShoppingBag className="text-4xl mx-auto mb-2" />
                    <p>No orders found</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8 text-center text-gray-300">
              <FaEye className="text-4xl mx-auto mb-2" />
              <p>Select a customer to view order history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
