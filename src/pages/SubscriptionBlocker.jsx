import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiClock, FiLock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SubscriptionBlocker = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      
      // Only check for restaurant users
      if (!user || user.role === 'SUPER_ADMIN') {
        setLoading(false);
        return;
      }

      const restaurantId = user?.id;
      if (!restaurantId) {
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/subscription-plans/status/${restaurantId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const subscription = response.data.subscription;
      
      // Check if subscription is expired or cancelled
      if (subscription.isExpired || subscription.paymentStatus === 'cancelled' || subscription.paymentStatus !== 'paid') {
        setIsBlocked(true);
        setSubscriptionData(subscription);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToSubscription = () => {
    navigate('/restaurant-dashboard/subscription');
  };

  if (loading) return null;
  if (!isBlocked) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-10 relative">
        {/* Lock Icon */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <div className="bg-red-500 rounded-full p-6 shadow-2xl">
            <FiLock className="text-white text-5xl" />
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Access Restricted
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your subscription has {subscriptionData?.paymentStatus === 'cancelled' ? 'been cancelled' : 'expired'}
          </p>

          {/* Status Card */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <FiAlertCircle className="text-red-600 text-3xl mr-3" />
              <h2 className="text-2xl font-bold text-red-900">Subscription Inactive</h2>
            </div>
            
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex justify-between items-center bg-white bg-opacity-60 rounded-lg p-3">
                <span className="text-gray-700 font-medium">Status:</span>
                <span className={`px-4 py-1 rounded-full text-sm font-bold ${
                  subscriptionData?.paymentStatus === 'cancelled' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {subscriptionData?.paymentStatus?.toUpperCase()}
                </span>
              </div>
              
              {subscriptionData?.endDate && (
                <div className="flex justify-between items-center bg-white bg-opacity-60 rounded-lg p-3">
                  <span className="text-gray-700 font-medium">Expired On:</span>
                  <span className="text-gray-900 font-semibold flex items-center">
                    <FiClock className="mr-2" />
                    {new Date(subscriptionData.endDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Blocked Features */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Blocked Features</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center text-gray-600">
                <span className="text-red-500 mr-2">✕</span> Create Orders
              </div>
              <div className="flex items-center text-gray-600">
                <span className="text-red-500 mr-2">✕</span> Manage Menu
              </div>
              <div className="flex items-center text-gray-600">
                <span className="text-red-500 mr-2">✕</span> Add Staff
              </div>
              <div className="flex items-center text-gray-600">
                <span className="text-red-500 mr-2">✕</span> View Reports
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-8">
            <p className="text-blue-900 font-semibold mb-2">
              💡 Renew your subscription to continue using the POS system
            </p>
            <p className="text-blue-700 text-sm">
              Contact your administrator or renew your plan to restore full access
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleGoToSubscription}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-8 rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            View Subscription & Renew
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBlocker;
