import React, { useState } from 'react';
import { FaUsers, FaStar, FaHistory, FaComment, FaBullhorn } from 'react-icons/fa';
import CustomerDatabase from './CustomerDatabase';
import LoyaltyProgram from './LoyaltyProgram';
import OrderHistory from './OrderHistory';
import FeedbackReviews from './FeedbackReviews';
import MarketingCampaigns from './MarketingCampaigns';

const CRM = () => {
  const [activeTab, setActiveTab] = useState('customers');

  const tabs = [
    { id: 'customers', label: 'Customers', icon: FaUsers, component: CustomerDatabase },
    { id: 'loyalty', label: 'Loyalty Program', icon: FaStar, component: LoyaltyProgram },
    { id: 'history', label: 'Order History', icon: FaHistory, component: OrderHistory },
    { id: 'feedback', label: 'Feedback', icon: FaComment, component: FeedbackReviews },
    { id: 'marketing', label: 'Marketing', icon: FaBullhorn, component: MarketingCampaigns }
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}>
                <Icon /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default CRM;
