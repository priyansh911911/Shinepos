import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    totalMenuItems: 0,
    activeStaff: 0
  });

  useEffect(() => {
    // Fetch dashboard stats
    // TODO: Implement API call
    setStats({
      todayOrders: 0,
      todayRevenue: 0,
      totalMenuItems: 0,
      activeStaff: 0
    });
  }, []);

  const cards = [
    { title: "Today's Orders", value: stats.todayOrders, icon: '📦', color: 'bg-blue-500' },
    { title: "Today's Revenue", value: `₹${stats.todayRevenue}`, icon: '💰', color: 'bg-green-500' },
    { title: 'Menu Items', value: stats.totalMenuItems, icon: '🍽️', color: 'bg-purple-500' },
    { title: 'Active Staff', value: stats.activeStaff, icon: '👥', color: 'bg-orange-500' }
  ];

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-6">Restaurant Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white/10 backdrop-blur-md rounded-lg shadow-md p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-200 text-sm">{card.title}</p>
                <p className="text-2xl font-bold text-white mt-2">{card.value}</p>
              </div>
              <div className={`${card.color} w-12 h-12 rounded-full flex items-center justify-center text-2xl`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white/10 backdrop-blur-md rounded-lg shadow-md p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">Recent Orders</h2>
        <p className="text-gray-300">No orders yet</p>
      </div>
    </div>
  );
};

export default Dashboard;
