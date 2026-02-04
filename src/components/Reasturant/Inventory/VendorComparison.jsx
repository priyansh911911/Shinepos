import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiDollarSign, FiTrendingDown, FiStar } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VendorComparison = ({ onAlert, showAddVendor, setShowAddVendor, showAddPrice, setShowAddPrice }) => {
  const [vendors, setVendors] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [vendorPrices, setVendorPrices] = useState([]);
  const [newVendor, setNewVendor] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
    rating: 5,
    paymentTerms: '',
    deliveryTime: ''
  });
  const [newPrice, setNewPrice] = useState({
    vendorId: '',
    inventoryItemId: '',
    price: 0,
    minOrderQty: 1,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [vendorsRes, inventoryRes, pricesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/inventory/vendors`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/inventory/all/inventory/items`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/inventory/vendor-prices`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setVendors(vendorsRes.data.vendors || []);
      setInventory(inventoryRes.data.inventory || []);
      setVendorPrices(pricesRes.data.prices || []);
    } catch (error) {
      console.error('Error fetching data:', error);
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
      fetchData();
      onAlert(['Vendor added successfully']);
    } catch (error) {
      console.error('Error adding vendor:', error);
      onAlert(['Failed to add vendor']);
    }
  };

  const addVendorPrice = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/inventory/vendor-prices`, newPrice, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNewPrice({
        vendorId: '',
        inventoryItemId: '',
        price: 0,
        minOrderQty: 1,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      setShowAddPrice(false);
      fetchData();
      onAlert(['Vendor price added successfully']);
    } catch (error) {
      console.error('Error adding vendor price:', error);
      onAlert(['Failed to add vendor price']);
    }
  };

  const getBestPriceForItem = (itemId) => {
    const itemPrices = vendorPrices.filter(price => 
      price.inventoryItemId === itemId && 
      new Date(price.validUntil) > new Date()
    );
    
    if (itemPrices.length === 0) return null;
    
    return itemPrices.reduce((best, current) => 
      current.price < best.price ? current : best
    );
  };

  const getVendorComparison = (itemId) => {
    const itemPrices = vendorPrices.filter(price => 
      price.inventoryItemId === itemId && 
      new Date(price.validUntil) > new Date()
    );
    
    return itemPrices.map(price => {
      const vendor = vendors.find(v => v._id === price.vendorId);
      return { ...price, vendor };
    }).sort((a, b) => a.price - b.price);
  };

  const calculateSavings = () => {
    let totalSavings = 0;
    inventory.forEach(item => {
      const bestPrice = getBestPriceForItem(item._id);
      if (bestPrice && bestPrice.price < item.costPerUnit) {
        totalSavings += (item.costPerUnit - bestPrice.price) * item.currentStock;
      }
    });
    return totalSavings;
  };

  const generatePurchaseRecommendations = () => {
    return inventory.map(item => {
      const comparison = getVendorComparison(item._id);
      const bestPrice = comparison[0];
      const currentCost = item.costPerUnit;
      
      return {
        item,
        bestPrice,
        currentCost,
        savings: bestPrice ? (currentCost - bestPrice.price) : 0,
        savingsPercent: bestPrice ? ((currentCost - bestPrice.price) / currentCost * 100) : 0,
        comparison
      };
    }).filter(rec => rec.bestPrice && rec.savings > 0)
      .sort((a, b) => b.savings - a.savings);
  };

  const recommendations = generatePurchaseRecommendations();
  const totalSavings = calculateSavings();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
        </div>
        <div className="flex space-x-2" style={{ display: 'none' }}>
          <button
            onClick={() => setShowAddVendor(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2"
          >
            <FiPlus />
            <span>Add Vendor</span>
          </button>
          <button
            onClick={() => setShowAddPrice(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2"
          >
            <FiDollarSign />
            <span>Add Price</span>
          </button>
        </div>
      </div>

      {/* Savings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50/20 p-4 rounded-lg border border-red-200/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-300 text-sm font-medium">Potential Savings</p>
              <p className="text-2xl font-bold text-red-200">₹{totalSavings.toFixed(2)}</p>
            </div>
            <FiTrendingDown className="text-red-400 text-2xl" />
          </div>
        </div>

        <div className="bg-blue-50/20 p-4 rounded-lg border border-blue-200/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">Active Vendors</p>
              <p className="text-2xl font-bold text-blue-200">{vendors.length}</p>
            </div>
            <FiStar className="text-blue-400 text-2xl" />
          </div>
        </div>

        <div className="bg-purple-50/20 p-4 rounded-lg border border-purple-200/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm font-medium">Price Comparisons</p>
              <p className="text-2xl font-bold text-purple-200">{recommendations.length}</p>
            </div>
            <FiDollarSign className="text-purple-400 text-2xl" />
          </div>
        </div>
      </div>

      {/* Add Vendor Modal */}
      {showAddVendor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Add New Vendor</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Vendor Name"
                value={newVendor.name}
                onChange={(e) => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Contact Number"
                value={newVendor.contact}
                onChange={(e) => setNewVendor(prev => ({ ...prev, contact: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                value={newVendor.email}
                onChange={(e) => setNewVendor(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
              <textarea
                placeholder="Address"
                value={newVendor.address}
                onChange={(e) => setNewVendor(prev => ({ ...prev, address: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                rows="3"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Rating (1-5)"
                  value={newVendor.rating}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                  className="w-full p-2 border rounded-lg"
                  min="1"
                  max="5"
                />
                <input
                  type="text"
                  placeholder="Delivery Time"
                  value={newVendor.deliveryTime}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, deliveryTime: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <input
                type="text"
                placeholder="Payment Terms"
                value={newVendor.paymentTerms}
                onChange={(e) => setNewVendor(prev => ({ ...prev, paymentTerms: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="flex space-x-2 mt-6">
              <button
                onClick={addVendor}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Add Vendor
              </button>
              <button
                onClick={() => setShowAddVendor(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Price Modal */}
      {showAddPrice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">Add Vendor Price</h3>
            
            <div className="space-y-4">
              <select
                value={newPrice.vendorId}
                onChange={(e) => setNewPrice(prev => ({ ...prev, vendorId: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select Vendor</option>
                {vendors.map(vendor => (
                  <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
                ))}
              </select>
              
              <select
                value={newPrice.inventoryItemId}
                onChange={(e) => setNewPrice(prev => ({ ...prev, inventoryItemId: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select Item</option>
                {inventory.map(item => (
                  <option key={item._id} value={item._id}>{item.name}</option>
                ))}
              </select>
              
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Price per unit"
                  value={newPrice.price}
                  onChange={(e) => setNewPrice(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  className="w-full p-2 border rounded-lg"
                  step="0.01"
                />
                <input
                  type="number"
                  placeholder="Min Order Qty"
                  value={newPrice.minOrderQty}
                  onChange={(e) => setNewPrice(prev => ({ ...prev, minOrderQty: parseInt(e.target.value) }))}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              
              <input
                type="date"
                value={newPrice.validUntil}
                onChange={(e) => setNewPrice(prev => ({ ...prev, validUntil: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="flex space-x-2 mt-6">
              <button
                onClick={addVendorPrice}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Add Price
              </button>
              <button
                onClick={() => setShowAddPrice(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Recommendations */}
      <div className="bg-white/20 backdrop-blur-2xl rounded-2xl animate-fadeIn">
        <div className="p-4 border-b border-white/30">
          <h3 className="font-medium text-white">Purchase Recommendations (Best Deals)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Item</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Current Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Best Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Savings</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Min Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {recommendations.slice(0, 10).map(rec => (
                <tr key={rec.item._id} className="hover:bg-white/10">
                  <td className="px-4 py-3 text-sm font-medium text-white">{rec.item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">₹{rec.currentCost.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-green-600 font-medium">
                    ₹{rec.bestPrice.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{rec.bestPrice.vendor?.name}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="text-green-600 font-medium">
                      ₹{rec.savings.toFixed(2)} ({rec.savingsPercent.toFixed(1)}%)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{rec.bestPrice.minOrderQty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor List */}
      <div className="bg-white/20 backdrop-blur-2xl rounded-2xl animate-fadeIn">
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

      <div className="bg-blue-50/20 p-4 rounded-lg border border-blue-200/30">
        <h3 className="font-medium text-blue-300 mb-2">Vendor Management Tips:</h3>
        <ul className="text-sm text-blue-200 space-y-1">
          <li>• Maintain relationships with multiple vendors for each item</li>
          <li>• Regularly update and compare prices</li>
          <li>• Consider delivery time and payment terms, not just price</li>
          <li>• Negotiate better rates for bulk orders</li>
        </ul>
      </div>
    </div>
  );
};

export default VendorComparison;