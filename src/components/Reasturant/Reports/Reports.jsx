import React, { useState } from 'react';
import { FiTrendingUp, FiPieChart, FiUsers, FiClock, FiFileText, FiBarChart } from 'react-icons/fi';
import SalesReport from './SalesReport';
import ItemAnalysis from './ItemAnalysis';
import StaffPerformance from './StaffPerformance';
import PeakHours from './PeakHours';
import TaxReports from './TaxReports';
import ProfitLoss from './ProfitLoss';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales');

  const tabs = [
    { id: 'sales', label: 'Sales Report', icon: FiTrendingUp, component: SalesReport },
    { id: 'items', label: 'Item Analysis', icon: FiPieChart, component: ItemAnalysis },
    { id: 'staff', label: 'Staff Performance', icon: FiUsers, component: StaffPerformance },
    { id: 'peak', label: 'Peak Hours', icon: FiClock, component: PeakHours },
    { id: 'tax', label: 'Tax Reports', icon: FiFileText, component: TaxReports },
    { id: 'pl', label: 'P&L Statement', icon: FiBarChart, component: ProfitLoss }
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

export default Reports;
