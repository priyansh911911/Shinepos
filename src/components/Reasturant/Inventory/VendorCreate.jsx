import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiStar } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VendorCreate = () => {
  const [vendors, setVendors] = useState([]);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
    rating: 5,
    paymentTerms: '',
    deliveryTime: ''
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/inventory/vendors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendors(response.data.vendors || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const addVendor = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/inventory/vendors`, newVendor, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNewVendor({
        name: '',
        contact: '',
        email: '',
        address: '',
        rating: 5,
        paymentTerms: '',
        deliveryTime: ''
      });
      setShowAddVendor(false);
      fetchVendors();
    } catch (error) {
      console.error('Error adding vendor:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Vendor Management</h2>
          <p className="text-gray-300">Add and manage your suppliers</p>
        </div>
        <button
          onClick={() => setShowAddVendor(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2"
        >
          <FiPlus />
          <span>Add Vendor</span>
        </button>
      </div>

      {showAddVendor && (
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4 text-white">Add New Vendor</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Vendor Name"
              value={newVendor.name}
              onChange={(e) => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Contact Number"
              value={newVendor.contact}
              onChange={(e) => setNewVendor(prev => ({ ...prev, contact: e.target.value }))}
              className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="email"
              placeholder="Email"
              value={newVendor.email}
              onChange={(e) => setNewVendor(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Delivery Time (e.g., 2-3 days)"
              value={newVendor.deliveryTime}
              onChange={(e) => setNewVendor(prev => ({ ...prev, deliveryTime: e.target.value }))}
              className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Payment Terms (e.g., Net 30)"
              value={newVendor.paymentTerms}
              onChange={(e) => setNewVendor(prev => ({ ...prev, paymentTerms: e.target.value }))}
              className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={newVendor.rating}
              onChange={(e) => setNewVendor(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
              className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
          </div>
          
          <textarea
            placeholder="Address"
            value={newVendor.address}
            onChange={(e) => setNewVendor(prev => ({ ...prev, address: e.target.value }))}
            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            rows="3"
          />

          <div className="flex space-x-2">
            <button
              onClick={addVendor}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Add Vendor
            </button>
            <button
              onClick={() => setShowAddVendor(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-2xl rounded-2xl animate-fadeIn">
        <div className="p-4 border-b border-white/30">
          <h3 className="font-medium text-white">Registered Vendors</h3>
        </div>
        <div className="divide-y">
          {vendors.map(vendor => (
            <div key={vendor._id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-white">{vendor.name}</h4>
                  <p className="text-sm text-gray-300">{vendor.contact} • {vendor.email}</p>
                  <p className="text-sm text-gray-400">{vendor.address}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-300">
                    <span className="flex items-center">
                      <FiStar className="text-yellow-500 mr-1" />
                      {vendor.rating}/5
                    </span>
                    <span>Delivery: {vendor.deliveryTime}</span>
                    <span>Payment: {vendor.paymentTerms}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-blue-400 hover:bg-white/10 rounded-lg">
                    <FiEdit />
                  </button>
                  <button className="p-2 text-red-400 hover:bg-white/10 rounded-lg">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorCreate;
