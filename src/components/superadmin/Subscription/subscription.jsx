import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2 } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
                  {editingId === restaurant._id ? (
                    <input
                      type="date"
                      value={formData.subscriptionEndDate}
                      onChange={(e) => setFormData({ ...formData, subscriptionEndDate: e.target.value })}
                      className="border rounded px-2 py-1 text-sm"
                    />
                  ) : (
                    restaurant.subscriptionEndDate ? new Date(restaurant.subscriptionEndDate).toLocaleDateString() : '-'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {editingId === restaurant._id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdate(restaurant._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(restaurant)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FiEdit2 className="inline" /> Edit
                    </button>
                  )}
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
