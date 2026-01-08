import { useState } from 'react';

export const useRestaurant = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addRestaurant = async (restaurantData) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/restaurants/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: restaurantData.restaurantName,
          adminName: restaurantData.ownerName,
          adminEmail: restaurantData.email,
          adminPassword: restaurantData.password,
          phone: restaurantData.phone,
          slug: restaurantData.slug,
          restaurantPhone: restaurantData.restaurantPhone,
          pinCode: restaurantData.pinCode,
          city: restaurantData.city,
          state: restaurantData.state,
          address: restaurantData.address
        })
      });

      if (response.ok) {
        setLoading(false);
        return { success: true };
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
        setLoading(false);
        return { success: false, error: errorData.message };
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
      return { success: false, error: 'Network error' };
    }
  };

  const fetchRestaurants = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/restaurants/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setLoading(false);
      return { success: true, data: data.restaurants || [] };
    } catch (err) {
      setError('Error fetching restaurants');
      setLoading(false);
      return { success: false, error: 'Error fetching restaurants' };
    }
  };

  return {
    loading,
    error,
    addRestaurant,
    fetchRestaurants
  };
};
