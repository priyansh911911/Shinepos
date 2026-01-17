import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2 } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CountdownTimer = ({ endDate, paymentStatus }) => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
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

    // Set initial value immediately
    setCountdown(calculateCountdown());

    const timer = setInterval(() => {
      setCountdown(calculateCountdown());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, paymentStatus]);

  if (paymentStatus !== 'paid') return <span className="text-gray-500">-</span>;

  return (
    <div className="text-xs">
      <span className="font-semibold text-indigo-600">{countdown.days}d</span> :
      <span className="font-semibold text-indigo-600"> {countdown.hours}h</span> :
      <span className="font-semibold text-indigo-600"> {countdown.minutes}m</span> :
      <span className="font-semibold text-indigo-600"> {countdown.seconds}s</span>
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Subscription Management</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time Left</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {restaurants.map((restaurant) => (
              <tr key={restaurant._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{restaurant.restaurantName}</div>
                  <div className="text-sm text-gray-500">{restaurant.slug}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {restaurant.ownerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === restaurant._id ? (
                    <select
                      value={formData.subscriptionPlan}
                      onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="standard">Standard</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800`}>
                      {restaurant.subscriptionPlan}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === restaurant._id ? (
                    <input
                      type="date"
                      value={formData.subscriptionStartDate}
                      onChange={(e) => setFormData({ ...formData, subscriptionStartDate: e.target.value })}
                      className="border rounded px-2 py-1 text-sm"
                    />
                  ) : (
                    restaurant.subscriptionStartDate ? new Date(restaurant.subscriptionStartDate).toLocaleDateString() : '-'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {restaurant.subscriptionEndDate ? new Date(restaurant.subscriptionEndDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <CountdownTimer 
                    endDate={restaurant.subscriptionEndDate} 
                    paymentStatus={restaurant.paymentStatus}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    restaurant.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                    restaurant.paymentStatus === 'cancelled' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {restaurant.paymentStatus || 'pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    {restaurant.paymentStatus === 'paid' ? (
                      <button
                        onClick={() => handleCancel(restaurant._id, restaurant.restaurantName)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRenew(restaurant._id, restaurant.restaurantName)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Renew
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Subscription;
