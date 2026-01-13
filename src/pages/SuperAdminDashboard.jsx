import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from '../components/superadmin/Dashboard/Dashboard';
import Restaurants from '../components/superadmin/Addreasturant/Restaurants';
import UsersList from '../components/superadmin/Reasturantadmin/usersList';

const SuperAdminDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'dashboard');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  return (
    <div className="flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <div className="flex-1">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'restaurants' && <Restaurants />}
        {activeTab === 'subscriptions' && <div className="p-6"><h1 className="text-2xl font-bold">Subscriptions</h1></div>}
        {activeTab === 'users' && <UsersList />}
        {activeTab === 'settings' && <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1></div>}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
