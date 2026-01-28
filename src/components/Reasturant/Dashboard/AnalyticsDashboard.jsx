import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiCalendar, FiFilter, FiDownload, FiRefreshCw } from 'react-icons/fi';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('today');
  const [isLoading, setIsLoading] = useState(false);
  const [analytics, setAnalytics] = useState({
    revenue: {
      current: 12450,
      previous: 11200,
      growth: 11.2
    },
    orders: {
      current: 47,
      previous: 42,
      growth: 11.9
    },
    customers: {
      current: 38,
      previous: 35,
      growth: 8.6
    },
    avgOrderValue: {
      current: 264,
      previous: 267,
      growth: -1.1
    }
  });

  const [chartData, setChartData] = useState({
    hourlyRevenue: [
      { hour: '9 AM', revenue: 450 },
      { hour: '10 AM', revenue: 680 },
      { hour: '11 AM', revenue: 920 },
      { hour: '12 PM', revenue: 1450 },
      { hour: '1 PM', revenue: 1890 },
      { hour: '2 PM', revenue: 1650 },
      { hour: '3 PM', revenue: 1200 },
      { hour: '4 PM', revenue: 980 },
      { hour: '5 PM', revenue: 1350 },
      { hour: '6 PM', revenue: 1780 },
      { hour: '7 PM', revenue: 2100 },
      { hour: '8 PM', revenue: 1950 }
    ],
    categoryBreakdown: [
      { category: 'Main Course', percentage: 45, amount: 5602 },
      { category: 'Beverages', percentage: 25, amount: 3112 },
      { category: 'Appetizers', percentage: 20, amount: 2490 },
      { category: 'Desserts', percentage: 10, amount: 1246 }
    ]
  });

  const timeRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  const refreshData = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const exportData = () => {
    console.log('Exporting analytics data...');
  };

  const MetricCard = ({ title, current, previous, growth, prefix = '', suffix = '' }) => (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-200 text-sm font-medium">{title}</h3>
        <div className={`flex items-center gap-1 text-xs ${
          growth >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {growth >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
          {Math.abs(growth).toFixed(1)}%
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">
        {prefix}{current.toLocaleString()}{suffix}
      </div>
      <div className="text-xs text-gray-400">
        vs {prefix}{previous.toLocaleString()}{suffix} {timeRange === 'today' ? 'yesterday' : 'last period'}
      </div>
    </motion.div>
  );

  const SimpleBarChart = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.map(d => d.revenue));
    
    return (
      <div className="flex items-end justify-between h-48 px-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.revenue / maxValue) * 160}px` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm min-w-[20px] relative group"
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                ₹{item.revenue}
              </div>
            </motion.div>
            <span className="text-xs text-gray-400 transform -rotate-45 origin-center">
              {item.hour}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const DonutChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.percentage, 0);
    let cumulativePercentage = 0;
    
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
    
    return (
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            {data.map((item, index) => {
              const strokeDasharray = `${item.percentage * 2.51} 251`;
              const strokeDashoffset = -cumulativePercentage * 2.51;
              cumulativePercentage += item.percentage;
              
              return (
                <motion.circle
                  key={index}
                  cx="64"
                  cy="64"
                  r="40"
                  fill="transparent"
                  stroke={colors[index]}
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  initial={{ strokeDasharray: '0 251' }}
                  animate={{ strokeDasharray: strokeDasharray }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-white">₹{analytics.revenue.current.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-transparent min-h-screen space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-200">Track your restaurant's performance and insights</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value} className="bg-gray-800">
                {range.label}
              </option>
            ))}
          </select>
          
          <button 
            onClick={refreshData}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          
          <button 
            onClick={exportData}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <FiDownload />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Revenue" 
          current={analytics.revenue.current} 
          previous={analytics.revenue.previous}
          growth={analytics.revenue.growth}
          prefix="₹"
        />
        <MetricCard 
          title="Orders" 
          current={analytics.orders.current} 
          previous={analytics.orders.previous}
          growth={analytics.orders.growth}
        />
        <MetricCard 
          title="Customers" 
          current={analytics.customers.current} 
          previous={analytics.customers.previous}
          growth={analytics.customers.growth}
        />
        <MetricCard 
          title="Avg Order Value" 
          current={analytics.avgOrderValue.current} 
          previous={analytics.avgOrderValue.previous}
          growth={analytics.avgOrderValue.growth}
          prefix="₹"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Hourly Revenue</h3>
          <SimpleBarChart data={chartData.hourlyRevenue} />
        </motion.div>

        {/* Category Breakdown */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Sales by Category</h3>
          <div className="flex items-center justify-between">
            <DonutChart data={chartData.categoryBreakdown} />
            <div className="space-y-2">
              {chartData.categoryBreakdown.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index] }}
                  />
                  <div className="text-sm">
                    <div className="text-white font-medium">{item.category}</div>
                    <div className="text-gray-400">{item.percentage}% • ₹{item.amount.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance Insights */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <div className="text-green-400 font-semibold mb-1">Peak Hours</div>
            <div className="text-white text-sm">7-8 PM generates highest revenue (₹2,100)</div>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <div className="text-blue-400 font-semibold mb-1">Best Category</div>
            <div className="text-white text-sm">Main Course leads with 45% of total sales</div>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="text-yellow-400 font-semibold mb-1">Growth Trend</div>
            <div className="text-white text-sm">Revenue up 11.2% compared to yesterday</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnalyticsDashboard;