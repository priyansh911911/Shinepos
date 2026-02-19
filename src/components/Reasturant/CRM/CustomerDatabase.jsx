import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaPhone, FaEnvelope, FaHistory } from 'react-icons/fa';
import axios from 'axios';

const CustomerDatabase = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      console.log('Submitting:', formData);
      if (editingCustomer) {
        const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/customers/${editingCustomer._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Update response:', response.data);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/customers`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchCustomers();
      setShowModal(false);
      setFormData({ name: '', phone: '', email: '' });
      setEditingCustomer(null);
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Failed to save customer');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this customer?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Customer Database</h2>
        <button onClick={() => { 
          setEditingCustomer(null);
          setFormData({ name: '', phone: '', email: '' });
          setShowModal(true);
        }} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all">
          <FaPlus /> Add Customer
        </button>
      </div>

      <div className="mb-4 relative">
        <FaSearch className="absolute left-3 top-3 text-gray-300" />
        <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-300" />
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-white">Name</th>
              <th className="px-4 py-3 text-left text-white">Phone</th>
              <th className="px-4 py-3 text-left text-white">Email</th>
              <th className="px-4 py-3 text-left text-white">Total Orders</th>
              <th className="px-4 py-3 text-left text-white">Total Spent</th>
              <th className="px-4 py-3 text-left text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer._id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-white">{customer.name}</td>
                <td className="px-4 py-3 text-white">{customer.phone}</td>
                <td className="px-4 py-3 text-white">{customer.email}</td>
                <td className="px-4 py-3 text-white">{customer.totalOrders || 0}</td>
                <td className="px-4 py-3 text-white">₹{(customer.totalSpent || 0).toFixed(2)}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => { 
                    setEditingCustomer(customer);
                    setFormData({
                      name: customer.name || '',
                      phone: customer.phone || '',
                      email: customer.email || ''
                    });
                    setShowModal(true);
                  }} className="text-blue-400 hover:text-blue-300 transition-colors">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(customer._id)} className="text-red-400 hover:text-red-300 transition-colors">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl w-96">
            <h3 className="text-xl font-bold text-white mb-4">{editingCustomer ? 'Edit' : 'Add'} Customer</h3>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full mb-3 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-300" required />
              <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full mb-3 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-300" required />
              <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full mb-3 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-300" />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all">Save</button>
                <button type="button" onClick={() => { setShowModal(false); setEditingCustomer(null); }} className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-white py-2 rounded-lg hover:bg-white/20 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDatabase;
