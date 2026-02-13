import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiPercent } from 'react-icons/fi';
import axios from 'axios';

const GeneralSettings = () => {
  const [marginCost, setMarginCost] = useState(40);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/restaurants/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMarginCost(data.marginCostPercentage);
    } catch (error) {
      console.error('Fetch settings error:', error);
    }
  };

  const handleSave = async () => {
    if (marginCost < 0 || marginCost > 100) {
      setMessage('Margin cost must be between 0 and 100');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/restaurants/settings`,
        { marginCostPercentage: marginCost },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Settings saved successfully');
      await fetchSettings();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
    >
      <h2 className="text-2xl font-bold text-white mb-6">General Settings</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-white mb-2 font-medium">
            Margin Cost Percentage
          </label>
          <p className="text-gray-300 text-sm mb-3">
            Set the cost percentage used for profit calculations in reports (e.g., 40% means cost is 40% of revenue)
          </p>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              value={marginCost}
              onChange={(e) => setMarginCost(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-orange-500"
            />
            <FiPercent className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-lg ${message.includes('success') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {message}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          <FiSave />
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </motion.div>
  );
};

export default GeneralSettings;
