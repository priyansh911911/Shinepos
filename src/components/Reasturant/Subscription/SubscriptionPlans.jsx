import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCheck, FiClock, FiCalendar } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  useEffect(() => {
    if (!currentPlan?.endDate || currentPlan?.isExpired) return;

    const calculateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(currentPlan.endDate).getTime();
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
  }, [currentPlan]);

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
      const restaurantId = user?.id; // For restaurant admin, id is the restaurant ID
      if (!restaurantId) return;
      
      const response = await axios.get(
        `${API_URL}/api/subscription-plans/status/${restaurantId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentPlan(response.data.subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleRenew = async () => {
    if (!confirm('Renew subscription for another 30 days?')) return;

    setSubscribing(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      const restaurantId = user?.id;
      
      await axios.post(
        `${API_URL}/api/subscription-plans/renew`,
        {
          restaurantId,
          paymentMethod: 'card',
          transactionId: `TXN-${Date.now()}`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Subscription renewed successfully!');
      fetchCurrentSubscription();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to renew subscription');
    } finally {
      setSubscribing(false);
    }
  };

  const handleSubscribe = async (planName) => {
    if (!confirm(`Subscribe to ${planName} plan?`)) return;

    setSubscribing(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      const restaurantId = user?.id; // For restaurant admin, id is the restaurant ID
      
      await axios.post(
        `${API_URL}/api/subscription-plans/subscribe`,
        {
          restaurantId,
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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-1">Current Plan: {currentPlan.plan}</h3>
              <p className="text-sm text-blue-700 flex items-center">
                <FiCalendar className="mr-2" />
                {new Date(currentPlan.startDate).toLocaleDateString()} - {new Date(currentPlan.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full font-semibold ${
              currentPlan.paymentStatus === 'cancelled' ? 'bg-orange-100 text-orange-800' :
              currentPlan.isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {currentPlan.paymentStatus === 'cancelled' ? 'Cancelled' : currentPlan.isExpired ? 'Expired' : 'Active'}
            </div>
          </div>
          
          {!currentPlan.isExpired && currentPlan.paymentStatus === 'paid' && (
            <div className="bg-white rounded-lg p-4 mt-4">
              <div className="flex items-center mb-3">
                <FiClock className="text-indigo-600 mr-2" />
                <h4 className="font-semibold text-gray-800">Time Remaining</h4>
              </div>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-indigo-50 rounded-lg p-3">
                  <div className="text-3xl font-bold text-indigo-600">{countdown.days}</div>
                  <div className="text-xs text-gray-600 mt-1">Days</div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3">
                  <div className="text-3xl font-bold text-indigo-600">{countdown.hours}</div>
                  <div className="text-xs text-gray-600 mt-1">Hours</div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3">
                  <div className="text-3xl font-bold text-indigo-600">{countdown.minutes}</div>
                  <div className="text-xs text-gray-600 mt-1">Minutes</div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3">
                  <div className="text-3xl font-bold text-indigo-600">{countdown.seconds}</div>
                  <div className="text-xs text-gray-600 mt-1">Seconds</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200 hover:border-indigo-500 transition max-w-md mx-auto">
            <h3 className="text-2xl font-bold mb-2">{plan.displayName}</h3>
            <div className="text-3xl font-bold text-indigo-600 mb-4">
              ₹{plan.price}
              <span className="text-sm text-gray-500">/month</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features?.map((feature, index) => (
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
