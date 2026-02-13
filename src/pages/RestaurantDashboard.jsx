import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MobileHeader from '../components/MobileHeader';
import RestaurantSidebar from './RestaurantSidebar';
import RestaurantDashboardHome from '../components/Reasturant/Dashboard/Dashboard';
import AnalyticsDashboard from '../components/Reasturant/Dashboard/AnalyticsDashboard';
import DashboardHeader from '../components/Reasturant/Dashboard/DashboardHeader';
import Category from '../components/Reasturant/Menu/Category/MainCategorys';
import Menu from '../components/Reasturant/Menu/menu/Menu';
import Addon from '../components/Reasturant/Menu/addon/Addon';
import Variation from '../components/Reasturant/Menu/variation/Variation';
import StaffList from '../components/Reasturant/Staff/Staff';
import Order from '../components/Reasturant/Order/Orders/Order';
import Tables from '../components/Reasturant/Order/Tables/Tables';
import KOT from '../components/Reasturant/Order/KOT/KOT';
import Inventory from '../components/Reasturant/Inventory/Inventory';
import SmartInventory from '../components/Reasturant/Inventory/SmartInventory';
import Vendor from '../components/Reasturant/Inventory/Vendor';
import SubscriptionPlans from '../components/Reasturant/Subscription/SubscriptionPlans';
import Settings from '../components/Reasturant/Settings/Settings';
import SubscriptionBlocker from './SubscriptionBlocker';
import Attendance from '../components/Reasturant/Attendance/Attendance';
import CRM from '../components/Reasturant/CRM/CRM';
import { getDefaultPage, hasAccess } from '../utils/rolePermissions';
import { useModules } from '../context/ModuleContext';

const ModuleDisabledMessage = ({ module }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20 max-w-md text-center">
      <div className="text-6xl mb-4">🔒</div>
      <h2 className="text-2xl font-bold text-white mb-2">Module Disabled</h2>
      <p className="text-gray-200 mb-4">
        The {module} module has been disabled by the restaurant owner.
      </p>
      <p className="text-sm text-gray-300">
        Contact your administrator to enable this feature.
      </p>
    </div>
  </div>
);

const RestaurantDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const defaultPage = getDefaultPage(user.role);
  const [activeTab, setActiveTab] = useState(defaultPage);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { isModuleEnabled } = useModules();

  const backgroundImages = {
    dashboard: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80',
    orders: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80',
    tables: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80',
    kot: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1920&q=80',
    menu: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&q=80',
    category: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1920&q=80',
    addons: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1920&q=80',
    variations: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1920&q=80',
    inventory: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1920&q=80',
    staff: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1920&q=80',
    crm: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=1920&q=80',
    subscription: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=80',
    settings: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1920&q=80'
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/restaurant-login');
  };

  // Redirect if user tries to access unauthorized page OR disabled module
  React.useEffect(() => {
    const moduleMap = {
      'orders': 'orderTaking',
      'kot': 'kot',
      'inventory': 'inventory',
      'add-inventory': 'inventory'
    };
    
    const requiredModule = moduleMap[activeTab];
    
    if (!hasAccess(user.role, activeTab) || (requiredModule && !isModuleEnabled(requiredModule))) {
      setActiveTab(defaultPage);
    }
  }, [activeTab, user.role, defaultPage, isModuleEnabled]);

  const renderContent = () => {
    const content = (() => {
      switch (activeTab) {
        case 'dashboard':
          return <RestaurantDashboardHome />;
        case 'analytics':
          return <AnalyticsDashboard />;
        case 'category':
          return <Category />;
        case 'menu':
          return <Menu />;
        case 'addons':
          return <Addon />;
        case 'variations':
          return <Variation />;
        case 'orders':
          return isModuleEnabled('orderTaking') ? <Order /> : <ModuleDisabledMessage module="Order Taking" />;
        case 'tables':
          return <Tables />;
        case 'kot':
          return isModuleEnabled('kot') ? <KOT /> : <ModuleDisabledMessage module="KOT" />;
        case 'inventory':
          return isModuleEnabled('inventory') ? <Inventory initialTab="list" /> : <ModuleDisabledMessage module="Inventory" />;
        case 'add-inventory':
          return isModuleEnabled('inventory') ? <Inventory initialTab="add" /> : <ModuleDisabledMessage module="Inventory" />;
        case 'smart-inventory':
          return isModuleEnabled('inventory') ? <SmartInventory /> : <ModuleDisabledMessage module="Inventory" />;
        case 'vendors':
          return isModuleEnabled('inventory') ? <Vendor /> : <ModuleDisabledMessage module="Inventory" />;
        case 'staff':
          return <StaffList />;
        case 'crm':
          return <CRM />;
        case 'attendance':
          return <Attendance />;
        case 'subscription':
          return <SubscriptionPlans />;
        case 'settings':
          return <Settings />;
        default:
          return <RestaurantDashboardHome />;
      }
    })();

    return (
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        {content}
      </motion.div>
    );
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      analytics: 'Analytics',
      category: 'Categories',
      menu: 'Menu Items',
      addons: 'Addons',
      variations: 'Variations',
      orders: 'Orders',
      tables: 'Tables',
      kot: 'Kitchen',
      inventory: 'Inventory',
      'add-inventory': 'Add Inventory',
      'smart-inventory': 'Smart Inventory',
      'vendors': 'Vendors',
      staff: 'Staff',
      crm: 'CRM',
      attendance: 'Attendance',
      subscription: 'Subscription',
      settings: 'Settings'
    };
    return titles[activeTab] || 'Restaurant POS';
  };

  return (
    <div className="flex h-screen bg-gray-900 relative overflow-hidden">
      {/* Mobile Header - Only show on mobile */}
      <div className="lg:hidden">
        <MobileHeader title={getPageTitle()} onMenuClick={() => setSidebarOpen(true)} />
      </div>
      
      <div 
        className="fixed inset-0 transition-opacity duration-700"
        style={{
          backgroundImage: `url(${backgroundImages[activeTab] || backgroundImages.dashboard})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.4)',
          transform: 'scale(1.1)',
          zIndex: 0
        }}
      />
      <SubscriptionBlocker />
      <RestaurantSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 bg-transparent">
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <DashboardHeader 
            title={getPageTitle()} 
            onMenuClick={() => setSidebarOpen(true)} 
            user={user}
          />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto pt-16 lg:pt-0">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
