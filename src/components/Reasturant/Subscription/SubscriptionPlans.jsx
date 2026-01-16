import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCheck } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/subscription-plans/plans`);
      setPlans(response.data.plans || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      if (!user?.restaurantId) return;
      
      const response = await axios.get(
        `${API_URL}/api/subscription-plans/status/${user.restaurantId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentPlan(response.data.subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleSubscribe = async (planName) => {
    if (!confirm(`Subscribe to ${planName} plan?`)) return;

    setSubscribing(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${API_URL}/api/subscription-plans/subscribe`,
        {
          restaurantId: user.restaurantId,
          planName,
          paymentMethod: 'card',
          transactionId: `TXN-${Date.now()}`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Subscription activated successfully!');
      fetchCurrentSubscription();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to subscribe');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Subscription Plans</h1>

      {currentPlan && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900">Current Plan: {currentPlan.plan}</h3>
          <p className="text-sm text-blue-700">
            {currentPlan.isExpired ? 'Expired' : `${currentPlan.daysRemaining} days remaining`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div key={plan._id} className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200 hover:border-indigo-500 transition">
            <h3 className="text-2xl font-bold mb-2">{plan.displayName}</h3>
            <div className="text-3xl font-bold text-indigo-600 mb-4">
              ₹{plan.price}
              <span className="text-sm text-gray-500">/month</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <FiCheck className="text-green-500 mr-2 mt-1" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.name)}
              disabled={subscribing || currentPlan?.plan === plan.name}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {currentPlan?.plan === plan.name ? 'Current Plan' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
