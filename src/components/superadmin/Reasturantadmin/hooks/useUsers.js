import { useState, useEffect } from 'react';
import axios from 'axios';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllUsers();
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant === 'all') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user => String(user.restaurantId) === String(selectedRestaurant)));
    }
  }, [selectedRestaurant, users]);

  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/restaurants/all/restaurant`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRestaurants(response.data.restaurants || []);
    } catch (err) {
      console.error('Fetch restaurants error:', err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user-management/`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      setUsers(response.data.users || []);
      setFilteredUsers(response.data.users || []);
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (user) => {
    // Don't allow toggling restaurant admin status
    if (user._id.toString().endsWith('_admin')) {
      alert('Restaurant admin status cannot be changed from here. Please use restaurant management.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user-management/update/restaurants/users/${user.restaurantId}/${user._id}`,
        { isActive: !user.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUsers(prev => prev.map(u => 
        u._id === user._id ? { ...u, isActive: !u.isActive } : u
      ));
    } catch (err) {
      console.error('Toggle user status error:', err);
      alert('Failed to update user status');
    }
  };

  return {
    users,
    filteredUsers,
    restaurants,
    selectedRestaurant,
    setSelectedRestaurant,
    loading,
    error,
    toggleUserStatus
  };
};
