import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiEdit2, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CountdownTimer = ({ endDate, paymentStatus, pausedTimeRemaining }) => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (paymentStatus === 'cancelled' && pausedTimeRemaining) {
      const distance = pausedTimeRemaining;
      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
      return;
    }

    if (!endDate || paymentStatus !== 'paid') return;

    const calculateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const distance = end - now;

      if (distance < 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      };
    };

    setCountdown(calculateCountdown());

    const timer = setInterval(() => {
      setCountdown(calculateCountdown());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, paymentStatus, pausedTimeRemaining]);

  if (!endDate && !pausedTimeRemaining) return <span className="text-gray-400">-</span>;

  const color = paymentStatus === 'paid' ? 'text-indigo-600' : 'text-orange-600';

  return (
    <div className="flex items-center gap-1 text-sm">
      <FiClock className={color} />
      <span className={`font-semibold ${color}`}>
        {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
      </span>
      {paymentStatus === 'cancelled' && <span className="text-orange-600 text-xs">(Paused)</span>}
    </div>
  );
};

const Subscription = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/restaurants/all/restaurant`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRestaurants(response.data.restaurants);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (restaurantId, restaurantName) => {
    if (!confirm(`Renew subscription for ${restaurantName}?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/subscription-plans/renew`,
        {
          restaurantId,
          paymentMethod: 'admin',
          transactionId: `ADMIN-${Date.now()}`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Subscription renewed successfully');
      fetchRestaurants();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to renew subscription');
    }
  };

  const handleCancel = async (restaurantId, restaurantName) => {
    if (!confirm(`Cancel subscription for ${restaurantName}?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/subscription-plans/cancel/${restaurantId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Subscription cancelled successfully');
      fetchRestaurants();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to cancel subscription');
    }
  };

  const handleEdit = (restaurant) => {
    setEditingId(restaurant._id);
    setFormData({
      subscriptionPlan: restaurant.subscriptionPlan,
      subscriptionStartDate: restaurant.subscriptionStartDate?.split('T')[0] || '',
      subscriptionEndDate: restaurant.subscriptionEndDate?.split('T')[0] || ''
    });
  };

  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/api/restaurants/toggle-status/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingId(null);
      fetchRestaurants();
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"
        />
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid': return <FiCheckCircle className="text-green-500" />;
      case 'cancelled': return <FiAlertCircle className="text-orange-500" />;
      default: return <FiXCircle className="text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Subscription Management
        </h1>
        <p className="text-gray-600">Monitor and manage restaurant subscriptions</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Restaurant</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Time Left</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {restaurants.map((restaurant, index) => (
                <motion.tr
                  key={restaurant._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                        {restaurant.restaurantName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{restaurant.restaurantName}</div>
                        <div className="text-xs text-gray-500">{restaurant.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    {restaurant.ownerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === restaurant._id ? (
                      <select
                        value={formData.subscriptionPlan}
                        onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="standard">Standard</option>
                      </select>
                    ) : (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-700">
                        {restaurant.subscriptionPlan}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {editingId === restaurant._id ? (
                      <input
                        type="date"
                        value={formData.subscriptionStartDate}
                        onChange={(e) => setFormData({ ...formData, subscriptionStartDate: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      restaurant.subscriptionStartDate ? new Date(restaurant.subscriptionStartDate).toLocaleDateString() : '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {restaurant.subscriptionEndDate ? new Date(restaurant.subscriptionEndDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <CountdownTimer 
                      endDate={restaurant.subscriptionEndDate} 
                      paymentStatus={restaurant.paymentStatus}
                      pausedTimeRemaining={restaurant.pausedTimeRemaining}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(restaurant.paymentStatus)}
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        restaurant.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 
                        restaurant.paymentStatus === 'cancelled' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {restaurant.paymentStatus || 'pending'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      {restaurant.paymentStatus === 'paid' ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCancel(restaurant._id, restaurant.restaurantName)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
                        >
                          Cancel
                        </motion.button>
                      ) : restaurant.paymentStatus === 'expired' || restaurant.paymentStatus === 'cancelled' ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRenew(restaurant._id, restaurant.restaurantName)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
                        >
                          Renew
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRenew(restaurant._id, restaurant.restaurantName)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
                        >
                          Subscribe
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Subscription;
