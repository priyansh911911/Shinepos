import React, { useState, useEffect } from 'react';
import { FaStar, FaGift, FaTrophy, FaCoins } from 'react-icons/fa';
import axios from 'axios';

const LoyaltyProgram = () => {
  const [customers, setCustomers] = useState([]);
  const [settings, setSettings] = useState({ pointsPerRupee: 1, redeemRate: 10 });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchSettings();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/customers/loyalty`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/loyalty/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data) setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const updateSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/loyalty/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowSettings(false);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const getTier = (points) => {
    if (points >= 5000) return { name: 'Platinum', color: 'text-purple-400', icon: FaTrophy };
    if (points >= 2000) return { name: 'Gold', color: 'text-yellow-400', icon: FaStar };
    if (points >= 500) return { name: 'Silver', color: 'text-gray-400', icon: FaStar };
    return { name: 'Bronze', color: 'text-orange-400', icon: FaStar };
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Loyalty & Rewards Program</h2>
        <button onClick={() => setShowSettings(true)} className="bg-blue-600 text-white px-4 py-2 rounded">Settings</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FaTrophy className="text-3xl text-white" />
            <div>
              <p className="text-purple-200 text-sm">Total Members</p>
              <p className="text-2xl font-bold text-white">{customers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FaCoins className="text-3xl text-white" />
            <div>
              <p className="text-yellow-200 text-sm">Points Issued</p>
              <p className="text-2xl font-bold text-white">{customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-600 to-green-800 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <FaGift className="text-3xl text-white" />
            <div>
              <p className="text-green-200 text-sm">Points Redeemed</p>
              <p className="text-2xl font-bold text-white">{customers.reduce((sum, c) => sum + (c.redeemedPoints || 0), 0)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-white">Customer</th>
              <th className="px-4 py-3 text-left text-white">Tier</th>
              <th className="px-4 py-3 text-left text-white">Points</th>
              <th className="px-4 py-3 text-left text-white">Redeemed</th>
              <th className="px-4 py-3 text-left text-white">Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const tier = getTier(customer.loyaltyPoints || 0);
              const TierIcon = tier.icon;
              return (
                <tr key={customer._id} className="border-t border-gray-700 hover:bg-gray-700">
                  <td className="px-4 py-3 text-white">{customer.name}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-2 ${tier.color}`}>
                      <TierIcon /> {tier.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">{customer.loyaltyPoints || 0}</td>
                  <td className="px-4 py-3 text-white">{customer.redeemedPoints || 0}</td>
                  <td className="px-4 py-3 text-white">₹{customer.totalSpent || 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold text-white mb-4">Loyalty Settings</h3>
            <div className="mb-4">
              <label className="text-white block mb-2">Points per ₹1 spent</label>
              <input type="number" value={settings.pointsPerRupee} onChange={(e) => setSettings({ ...settings, pointsPerRupee: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded" />
            </div>
            <div className="mb-4">
              <label className="text-white block mb-2">Points needed for ₹1 discount</label>
              <input type="number" value={settings.redeemRate} onChange={(e) => setSettings({ ...settings, redeemRate: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded" />
            </div>
            <div className="flex gap-2">
              <button onClick={updateSettings} className="flex-1 bg-blue-600 text-white py-2 rounded">Save</button>
              <button onClick={() => setShowSettings(false)} className="flex-1 bg-gray-600 text-white py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyProgram;
