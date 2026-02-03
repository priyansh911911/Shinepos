import React from 'react';
import { motion } from 'framer-motion';

const DashboardCard = ({ title, count, icon, bgColor }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`${bgColor} rounded-2xl shadow-lg hover:shadow-2xl p-6 text-white transition-all border border-white/20`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90 mb-2">{title}</p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold"
          >
            {count}
          </motion.p>
        </div>
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
          className="bg-white bg-opacity-30 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
        >
          {icon}
        </motion.div>
      </div>
    </motion.div>
  );
};

export const getCards = (restaurants) => [
  {
    title: "Active Restaurants",
    count: restaurants.filter(r => r.isActive).length,
    bgColor: "bg-gradient-to-r from-emerald-500 to-emerald-600",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    title: "Total Restaurants",
    count: restaurants.length,
    bgColor: "bg-gradient-to-r from-indigo-500 to-indigo-600",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
      </svg>
    )
  },
  {
    title: "Trial Restaurants",
    count: restaurants.filter(r => r.subscriptionPlan === 'trial').length,
    bgColor: "bg-gradient-to-r from-amber-500 to-amber-600",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    title: "Subscribed",
    count: restaurants.filter(r => r.subscriptionPlan === 'subscription').length,
    bgColor: "bg-gradient-to-r from-purple-500 to-purple-600",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    title: "Cancelled",
    count: restaurants.filter(r => r.subscriptionPlan === 'cancelled').length,
    bgColor: "bg-gradient-to-r from-red-500 to-red-600",
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    )
  }
];

export default DashboardCard;
