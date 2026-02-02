import { useState, useEffect } from 'react';
import axios from 'axios';

export const useAnalytics = () => {
  const [timeRange, setTimeRange] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    revenue: { current: 0, previous: 0, growth: 0 },
    orders: { current: 0, previous: 0, growth: 0 },
    customers: { current: 0, previous: 0, growth: 0 },
    avgOrderValue: { current: 0, previous: 0, growth: 0 }
  });
  const [chartData, setChartData] = useState({
    hourlyRevenue: []
  });

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        let url = `${import.meta.env.VITE_API_URL}/api/dashboard/stats?filter=${timeRange}`;
        if (timeRange === 'custom' && startDate && endDate) {
          url += `&startDate=${startDate}&endDate=${endDate}`;
        }
        const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });

        if (response.data.success && mounted) {
          const { stats, analytics: analyticsData } = response.data;
          
          const hourlyData = analyticsData.hourlyRevenue
            .map((revenue, hour) => ({
              hour: `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`,
              revenue
            }))
            .filter(d => d.revenue > 0);

          setAnalytics({
            revenue: { current: stats.revenue, previous: 0, growth: 0 },
            orders: { current: stats.orders, previous: 0, growth: 0 },
            customers: { current: stats.orders, previous: 0, growth: 0 },
            avgOrderValue: { current: stats.avgOrderValue, previous: 0, growth: 0 }
          });

          setChartData({
            hourlyRevenue: hourlyData
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    
    loadData();
    return () => { mounted = false; };
  }, [timeRange, startDate, endDate]);

  const refreshData = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = `${import.meta.env.VITE_API_URL}/api/dashboard/stats?filter=${timeRange}`;
      if (timeRange === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });

      if (response.data.success) {
        const { stats, analytics: analyticsData } = response.data;
        
        const hourlyData = analyticsData.hourlyRevenue
          .map((revenue, hour) => ({
            hour: `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`,
            revenue
          }))
          .filter(d => d.revenue > 0);

        setAnalytics({
          revenue: { current: stats.revenue, previous: 0, growth: 0 },
          orders: { current: stats.orders, previous: 0, growth: 0 },
          customers: { current: stats.orders, previous: 0, growth: 0 },
          avgOrderValue: { current: stats.avgOrderValue, previous: 0, growth: 0 }
        });

        setChartData({
          hourlyRevenue: hourlyData
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const exportData = () => {
    console.log('Exporting analytics data...');
  };

  return {
    timeRange,
    setTimeRange,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isLoading,
    analytics,
    chartData,
    refreshData,
    exportData
  };
};
