import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from '../components/superadmin/Dashboard/Dashboard';
import Restaurants from '../components/superadmin/Addreasturant/Restaurants';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <div className="flex-1">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'restaurants' && <Restaurants />}
        {activeTab === 'subscriptions' && <div className="p-6"><h1 className="text-2xl font-bold">Subscriptions</h1></div>}
        {activeTab === 'users' && <div className="p-6"><h1 className="text-2xl font-bold">Users</h1></div>}
        {activeTab === 'settings' && <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1></div>}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
