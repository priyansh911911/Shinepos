import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiHome, FiGrid, FiUsers, FiCreditCard, FiClipboard, FiPackage, FiShoppingBag, FiTag, FiStar, FiTarget, FiList, FiPlus, FiSettings, FiLogOut, FiChevronDown, FiMenu, FiX, FiBarChart, FiClock, FiCpu, FiTruck, FiFileText, FiTrendingUp, FiPieChart, FiDownload, FiUserCheck } from 'react-icons/fi';
import { hasAccess } from '../utils/rolePermissions';
import { useModules } from '../context/ModuleContext';

const RestaurantSidebar = ({ activeTab, setActiveTab, onLogout, sidebarOpen, setSidebarOpen }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user.role;
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(userRole === 'CHEF');
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const { isModuleEnabled } = useModules();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiHome /> },
    { id: 'analytics', label: 'Analytics', icon: <FiBarChart /> },
    { id: 'tables', label: 'Tables', icon: <FiGrid /> },
    { id: 'crm', label: 'CRM', icon: <FiUserCheck /> },
    { id: 'staff', label: 'Staff', icon: <FiUsers /> },
    { id: 'attendance', label: 'Attendance', icon: <FiClock /> },
    { id: 'subscription', label: 'Subscription', icon: <FiCreditCard /> }
  ];

  const orderSubItems = [
    { id: 'orders', label: 'Orders', icon: <FiClipboard />, module: 'orderTaking' },
    { id: 'kot', label: 'Kitchen (KOT)', icon: <FiPackage />, module: 'kot' }
  ];

  const inventorySubItems = [
    { id: 'inventory', label: 'Inventory List', icon: <FiList />, module: 'inventory' },
    { id: 'add-inventory', label: 'Add Item', icon: <FiPlus />, module: 'inventory' },
    { id: 'vendors', label: 'Vendors', icon: <FiTruck />, module: 'inventory' }
  ];

  const menuSubItems = [
    { id: 'category', label: 'Category', icon: <FiTag /> },
    { id: 'menu', label: 'Menu Items', icon: <FiShoppingBag /> },
    { id: 'addons', label: 'Addons', icon: <FiStar /> },
    { id: 'variations', label: 'Variations', icon: <FiTarget /> }
  ];

  const reportsSubItems = [
    { id: 'sales-report', label: 'Sales Report', icon: <FiTrendingUp /> },
    { id: 'item-analysis', label: 'Item Analysis', icon: <FiPieChart /> },
    { id: 'staff-performance', label: 'Staff Performance', icon: <FiUsers /> },
    { id: 'peak-hours', label: 'Peak Hours', icon: <FiClock /> },
    { id: 'tax-reports', label: 'Tax Reports', icon: <FiFileText /> },
    { id: 'profit-loss', label: 'P&L Statement', icon: <FiBarChart /> }
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  // Filter menu items based on role permissions AND module status
  const filteredMenuItems = menuItems.filter(item => hasAccess(userRole, item.id));
  const filteredOrderSubItems = orderSubItems.filter(item => {
    const hasRoleAccess = hasAccess(userRole, item.id);
    const moduleEnabled = item.module ? isModuleEnabled(item.module) : true;
    return hasRoleAccess && moduleEnabled;
  });
  const filteredInventorySubItems = inventorySubItems.filter(item => 
    hasAccess(userRole, item.id) && isModuleEnabled(item.module)
  );
  const filteredMenuSubItems = menuSubItems.filter(item => hasAccess(userRole, item.id));
  const filteredReportsSubItems = reportsSubItems.filter(item => hasAccess(userRole, 'reports'));

  // Check if dropdowns should be shown
  const showOrdersDropdown = filteredOrderSubItems.length > 0;
  const showInventoryDropdown = filteredInventorySubItems.length > 0;
  const showMenuDropdown = filteredMenuSubItems.length > 0;
  const showReportsDropdown = filteredReportsSubItems.length > 0;

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar */}
      <motion.div 
        initial={false}
        animate={{ 
          x: window.innerWidth >= 1024 ? 0 : (sidebarOpen ? 0 : -264)
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed lg:relative w-64 h-screen flex flex-col overflow-hidden z-40"
        style={{ opacity: window.innerWidth >= 1024 ? 1 : (sidebarOpen ? 1 : 0) }}
      >
        {/* Background with blur */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-red-500/20 to-pink-500/20"
          style={{ backdropFilter: 'blur(100px)' }}
        />
        
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-2xl border-r border-white/20" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="text-4xl text-gray-900">🍽️</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Restaurant POS</h2>
                  <p className="text-xs text-gray-700">{user.name || 'Admin'}</p>
                </div>
              </div>
              {/* Close button inside sidebar on mobile */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FiX size={24} className="text-gray-900" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {filteredMenuItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-white/40 backdrop-blur-lg text-black shadow-lg'
                    : 'text-black hover:bg-white/20 backdrop-blur-md'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}

            {/* Orders Dropdown */}
            {showOrdersDropdown && (
            <div className="pt-2">
              <button
                onClick={() => setOrderOpen(!orderOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  orderOpen ? 'bg-white/40 backdrop-blur-lg text-black' : 'text-black hover:bg-white/20 backdrop-blur-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg"><FiClipboard /></span>
                  <span>Orders</span>
                </div>
                <FiChevronDown className={`transition-transform ${orderOpen ? 'rotate-180' : ''}`} />
              </button>
              {orderOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="ml-6 mt-1 space-y-1"
                >
                  {filteredOrderSubItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => handleNavClick(subItem.id)}
                      className={`w-full flex items-center gap-2 text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === subItem.id
                          ? 'bg-white/40 backdrop-blur-lg text-black shadow-md'
                          : 'text-black hover:bg-white/20 backdrop-blur-md'
                      }`}
                    >
                      <span className="text-lg">{subItem.icon}</span>
                      <span>{subItem.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
            )}

            {/* Inventory Dropdown */}
            {showInventoryDropdown && (
            <div>
              <button
                onClick={() => setInventoryOpen(!inventoryOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  inventoryOpen ? 'bg-white/40 backdrop-blur-lg text-black' : 'text-black hover:bg-white/20 backdrop-blur-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg"><FiPackage /></span>
                  <span>Inventory</span>
                </div>
                <FiChevronDown className={`transition-transform ${inventoryOpen ? 'rotate-180' : ''}`} />
              </button>
              {inventoryOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="ml-6 mt-1 space-y-1"
                >
                  {filteredInventorySubItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => handleNavClick(subItem.id)}
                      className={`w-full flex items-center gap-2 text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === subItem.id
                          ? 'bg-white/40 backdrop-blur-lg text-black shadow-md'
                          : 'text-black hover:bg-white/20 backdrop-blur-md'
                      }`}
                    >
                      <span className="text-lg">{subItem.icon}</span>
                      <span>{subItem.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
            )}

            {/* Menu Dropdown */}
            {showMenuDropdown && (
            <div>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  menuOpen ? 'bg-white/40 backdrop-blur-lg text-black' : 'text-black hover:bg-white/20 backdrop-blur-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg"><FiShoppingBag /></span>
                  <span>Menu</span>
                </div>
                <FiChevronDown className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              {menuOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="ml-6 mt-1 space-y-1"
                >
                  {filteredMenuSubItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => handleNavClick(subItem.id)}
                      className={`w-full flex items-center gap-2 text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === subItem.id
                          ? 'bg-white/40 backdrop-blur-lg text-black shadow-md'
                          : 'text-black hover:bg-white/20 backdrop-blur-md'
                      }`}
                    >
                      <span className="text-lg">{subItem.icon}</span>
                      <span>{subItem.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
            )}
            {/* Reports Dropdown */}
            {showReportsDropdown && (
            <div>
              <button
                onClick={() => setReportsOpen(!reportsOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  reportsOpen ? 'bg-white/40 backdrop-blur-lg text-black' : 'text-black hover:bg-white/20 backdrop-blur-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg"><FiFileText /></span>
                  <span>Reports</span>
                </div>
                <FiChevronDown className={`transition-transform ${reportsOpen ? 'rotate-180' : ''}`} />
              </button>
              {reportsOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="ml-6 mt-1 space-y-1"
                >
                  {filteredReportsSubItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => handleNavClick(subItem.id)}
                      className={`w-full flex items-center gap-2 text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === subItem.id
                          ? 'bg-white/40 backdrop-blur-lg text-black shadow-md'
                          : 'text-black hover:bg-white/20 backdrop-blur-md'
                      }`}
                    >
                      <span className="text-lg">{subItem.icon}</span>
                      <span>{subItem.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
            )}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/20 space-y-2">
            {hasAccess(userRole, 'settings') && (
            <button
              onClick={() => handleNavClick('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-white/40 backdrop-blur-lg text-black shadow-lg'
                  : 'text-black hover:bg-white/20 backdrop-blur-md'
              }`}
            >
              <span className="text-lg"><FiSettings /></span>
              <span>Settings</span>
            </button>
            )}
            
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg transition-all"
            >
              <FiLogOut className="text-lg" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default RestaurantSidebar;
