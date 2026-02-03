import React, { useState } from 'react';
import { FiUsers, FiShoppingCart } from 'react-icons/fi';
import VendorCreate from './VendorCreate';
import VendorOrder from './VendorOrder';

const Vendor = () => {
  const [activeTab, setActiveTab] = useState('vendors');

  const tabs = [
    { id: 'vendors', label: 'Manage Vendors', icon: FiUsers, component: VendorCreate },
    { id: 'orders', label: 'Purchase Orders', icon: FiShoppingCart, component: VendorOrder }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Vendor Management</h1>
      </div>

      <div className="bg-white/20 backdrop-blur-2xl rounded-2xl animate-fadeIn">
        <div className="border-b border-white/30">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-white hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
};

export default Vendor;