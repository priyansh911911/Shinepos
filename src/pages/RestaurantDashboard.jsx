import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantSidebar from './RestaurantSidebar';
import RestaurantDashboardHome from '../components/Reasturant/Dashboard/Dashboard';
import Category from '../components/Reasturant/Menu/Category/MainCategorys';
import MainItems from '../components/Reasturant/Menu/Items/MainItems';

const RestaurantDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <RestaurantDashboardHome />;

      case 'category':
        return <Category />;
      case 'menu':
        return <MainItems />;
      case 'orders':
        return <div className="p-6"><h2 className="text-2xl font-bold">Orders</h2></div>;
      case 'staff':
        return <div className="p-6"><h2 className="text-2xl font-bold">Staff Management</h2></div>;
      case 'settings':
        return <div className="p-6"><h2 className="text-2xl font-bold">Settings</h2></div>;
      default:
        return <RestaurantDashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <RestaurantSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default RestaurantDashboard;
