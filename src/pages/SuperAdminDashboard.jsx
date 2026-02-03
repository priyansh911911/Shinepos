import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Dashboard from '../components/superadmin/Dashboard/Dashboard';
import Restaurants from '../components/superadmin/Addreasturant/Restaurants';
import UsersList from '../components/superadmin/Reasturantadmin/usersList';
import Subscription from '../components/superadmin/Subscription/subscription';

const SuperAdminDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'dashboard');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin-login');
  };

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  return (
    <div className="flex bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <div className="flex-1 overflow-auto ml-72">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'restaurants' && <Restaurants />}
            {activeTab === 'subscriptions' && <Subscription />}
            {activeTab === 'users' && <UsersList />}
            {activeTab === 'settings' && <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1></div>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
