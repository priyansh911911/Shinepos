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
    <div className="min-h-screen bg-transparent">
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-b-2 border-blue-400'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
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
