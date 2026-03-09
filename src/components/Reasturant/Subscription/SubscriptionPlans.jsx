import React from 'react';
import { FiCheck, FiClock, FiCalendar, FiLoader, FiGift, FiPackage, FiStar, FiAward, FiAlertTriangle, FiXCircle, FiCheckCircle, FiZap } from 'react-icons/fi';
import { useSubscription } from './hooks/useSubscription';

const SubscriptionPlans = () => {
  const {
    plans,
    currentPlan,
    loading,
    subscribing,
    error,
    countdown,
    handleRenew,
    handleSubscribe
  } = useSubscription();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <FiLoader className="text-6xl mb-4 animate-spin mx-auto text-orange-500" size={64} />
          <p className="mt-4 text-white font-medium">Loading plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/80 backdrop-blur-md border border-red-600/50 text-white px-4 py-3 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fadeIn">
      {/* <h1 className="text-3xl font-bold text-gray-900 mb-6">💳 Subscription Plans</h1> */}

      {currentPlan && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Current Plan: {currentPlan.plan}</h3>
              <p className="text-sm text-gray-200 flex items-center">
                <FiCalendar className="mr-2" />
                {new Date(currentPlan.startDate).toLocaleDateString()} - {new Date(currentPlan.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 ${
              currentPlan.paymentStatus === 'cancelled' ? 'bg-orange-500 text-white' :
              currentPlan.isExpired ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}>
              {currentPlan.paymentStatus === 'cancelled' ? (
                <><FiAlertTriangle /> Cancelled</>
              ) : currentPlan.isExpired ? (
                <><FiXCircle /> Expired</>
              ) : (
                <><FiCheckCircle /> Active</>
              )}
            </div>
          </div>
          
          {!currentPlan.isExpired && currentPlan.paymentStatus === 'paid' && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mt-4 border border-white/20">
              <div className="flex items-center mb-3">
                <FiClock className="text-white mr-2" />
                <h4 className="font-semibold text-white">Time Remaining</h4>
              </div>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                  <div className="text-3xl font-bold text-white">{countdown.days}</div>
                  <div className="text-xs text-gray-200 mt-1">Days</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                  <div className="text-3xl font-bold text-white">{countdown.hours}</div>
                  <div className="text-xs text-gray-200 mt-1">Hours</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                  <div className="text-3xl font-bold text-white">{countdown.minutes}</div>
                  <div className="text-xs text-gray-200 mt-1">Minutes</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                  <div className="text-3xl font-bold text-white">{countdown.seconds}</div>
                  <div className="text-xs text-gray-200 mt-1">Seconds</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, index) => (
          <div 
            key={plan.name} 
            className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-2 text-white">
                {plan.name === 'TRIAL' ? <FiGift className="mx-auto" /> : 
                 plan.name === 'BASIC' ? <FiPackage className="mx-auto" /> : 
                 plan.name === 'PREMIUM' ? <FiStar className="mx-auto" /> : <FiAward className="mx-auto" />}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{plan.displayName}</h3>
              <div className="text-3xl font-bold text-white mb-1">
                ₹{plan.price}
              </div>
              <span className="text-sm text-gray-200">/month</span>
            </div>

            <ul className="space-y-2 mb-6">
              {plan.features?.map((feature, idx) => (
                <li key={idx} className="flex items-start text-sm text-white">
                  <FiCheck className="text-green-600 mr-2 mt-1 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.name)}
              disabled={subscribing || currentPlan?.plan === plan.name}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                currentPlan?.plan === plan.name
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : 'bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20'
              } disabled:opacity-50`}
            >
              {currentPlan?.plan === plan.name ? (
                <><FiCheckCircle /> Current Plan</>
              ) : (
                <><FiZap /> Subscribe</>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
