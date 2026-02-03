import React, { useState, useEffect } from 'react';
import { FiTrendingDown, FiDollarSign, FiAlertTriangle, FiPlus } from 'react-icons/fi';
import WastageTracking from './WastageTracking';
import StockPrediction from './StockPrediction';
import VendorComparison from './VendorComparison';

const SmartInventory = () => {
  const [activeTab, setActiveTab] = useState('wastage');
  const [smartAlerts, setSmartAlerts] = useState([]);
  const [showAddWastage, setShowAddWastage] = useState(false);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [showAddPrice, setShowAddPrice] = useState(false);

  const tabs = [
    { id: 'wastage', label: 'Wastage Tracking', icon: FiTrendingDown, component: WastageTracking },
    { id: 'prediction', label: 'Stock Prediction', icon: FiAlertTriangle, component: StockPrediction },
    { id: 'vendor', label: 'Vendor Comparison', icon: FiDollarSign, component: VendorComparison }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">🧠 Smart Inventory System</h1>
      </div>

      {smartAlerts.length > 0 && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800 mb-2">Smart Alerts</h3>
          {smartAlerts.map((alert, index) => (
            <div key={index} className="text-sm text-orange-700">{alert}</div>
          ))}
        </div>
      )}

      <div className="bg-white/20 backdrop-blur-2xl rounded-2xl animate-fadeIn">
        <div className="border-b border-white/30">
          <div className="flex justify-between items-center px-6 py-4">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
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
            <div className="flex space-x-2">
              {activeTab === 'wastage' && (
                <button
                  onClick={() => setShowAddWastage(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center space-x-2"
                >
                  <FiPlus />
                  <span>Record Wastage</span>
                </button>
              )}
              {activeTab === 'vendor' && (
                <>
                  <button
                    onClick={() => setShowAddVendor(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2"
                  >
                    <FiPlus />
                    <span>Add Vendor</span>
                  </button>
                  <button
                    onClick={() => setShowAddPrice(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2"
                  >
                    <FiDollarSign />
                    <span>Add Price</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {ActiveComponent && <ActiveComponent 
            onAlert={setSmartAlerts} 
            showAddWastage={showAddWastage}
            setShowAddWastage={setShowAddWastage}
            showAddVendor={showAddVendor}
            setShowAddVendor={setShowAddVendor}
            showAddPrice={showAddPrice}
            setShowAddPrice={setShowAddPrice}
          />}
        </div>
      </div>
    </div>
  );
};

export default SmartInventory;