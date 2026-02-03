import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiRefreshCw } from 'react-icons/fi';
import DashboardCard, { getCards } from './dashboardcard';

const Dashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyGrowth: 0,
    activeUsers: 0,
    recentActivity: []
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/restaurants/all/restaurant`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setRestaurants(data.restaurants || []);
      
      // Calculate stats
      const active = data.restaurants?.filter(r => r.isActive).length || 0;
      const paid = data.restaurants?.filter(r => r.paymentStatus === 'paid').length || 0;
      setStats({
        totalRevenue: paid * 29,
        monthlyGrowth: 12.5,
        activeUsers: active,
        recentActivity: data.restaurants?.slice(0, 5) || []
      });
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Super Admin Dashboard
              </h1>
              <p className="text-gray-600">Monitor and manage your restaurant ecosystem</p>
            </div>
            <button
              onClick={fetchRestaurants}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-indigo-300"
            >
              <FiRefreshCw className="text-indigo-600" />
              <span className="text-gray-700 font-medium">Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getCards(restaurants).map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <DashboardCard
                title={card.title}
                count={card.count}
                bgColor={card.bgColor}
                icon={card.icon}
              />
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Monthly Revenue</h3>
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <FiTrendingUp />
                <span>{stats.monthlyGrowth}%</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-indigo-600 mb-2">
              ${stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">From active subscriptions</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Active Restaurants</h3>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-3xl font-bold text-emerald-600 mb-2">
              {stats.activeUsers}
            </div>
            <p className="text-sm text-gray-500">Currently operational</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Conversion Rate</h3>
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <FiTrendingUp />
                <span>8.2%</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {restaurants.length > 0 ? ((restaurants.filter(r => r.paymentStatus === 'paid').length / restaurants.length) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-sm text-gray-500">Trial to paid conversion</p>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Restaurants</h3>
          <div className="space-y-3">
            {stats.recentActivity.map((restaurant, index) => (
              <motion.div
                key={restaurant._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {restaurant.restaurantName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{restaurant.restaurantName}</h4>
                    <p className="text-sm text-gray-500">{restaurant.ownerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    restaurant.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                    restaurant.paymentStatus === 'cancelled' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {restaurant.paymentStatus || 'pending'}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${
                    restaurant.isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}></span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
