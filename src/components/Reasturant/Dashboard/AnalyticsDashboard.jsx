import React from "react";
import { motion } from "framer-motion";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDownload,
  FiRefreshCw,
  FiLoader,
} from "react-icons/fi";
import { useAnalytics } from "./hook/useAnalytics";

const AnalyticsDashboard = () => {
  const {
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
    exportData,
  } = useAnalytics();

  const timeRanges = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "custom", label: "Custom Range" },
  ];

  const MetricCard = ({
    title,
    current,
    previous,
    growth,
    prefix = "",
    suffix = "",
  }) => (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-200 text-sm font-medium">{title}</h3>
        <div
          className={`flex items-center gap-1 text-xs ${
            growth >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {growth >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
          {Math.abs(growth).toFixed(1)}%
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">
        {prefix}
        {current.toLocaleString()}
        {suffix}
      </div>
      <div className="text-xs text-gray-400">
        vs {prefix}
        {previous.toLocaleString()}
        {suffix} {timeRange === "today" ? "yesterday" : "last period"}
      </div>
    </motion.div>
  );

  const SimpleBarChart = ({ data, height = 200 }) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center text-gray-400 py-8">No data available</div>
      );
    }

    const maxValue = Math.max(...data.map((d) => d.revenue));
    if (maxValue === 0) {
      return (
        <div className="text-center text-gray-400 py-8">No revenue data</div>
      );
    }

    return (
      <div className="flex items-end justify-start gap-3 h-48 px-4 overflow-x-auto">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-2 flex-shrink-0"
          >
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.revenue / maxValue) * 160}px` }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm w-12 relative group"
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ₹{Math.round(item.revenue)}
              </div>
            </motion.div>
            <span className="text-xs text-gray-300 whitespace-nowrap">
              {item.hour}
            </span>
          </div>
        ))}
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
          <h1 className="text-3xl font-bold text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-200">
            Track your restaurant's performance and insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {timeRanges.map((range) => (
              <option
                key={range.value}
                value={range.value}
                className="bg-gray-800"
              >
                {range.label}
              </option>
            ))}
          </select>

          {timeRange === "custom" && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}

          <button
            onClick={refreshData}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
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
      {!isLoading && (
        <div className="grid grid-cols-1 gap-6 max-w-[500px]">
          {/* Revenue Chart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 w-full"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Hourly Revenue
            </h3>
            <SimpleBarChart data={chartData.hourlyRevenue} />
          </motion.div>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <FiLoader
              className="text-6xl mb-4 animate-spin mx-auto text-orange-500"
              size={64}
            />
            <p className="mt-4 text-white font-medium">Loading analytics...</p>
          </div>
        </div>
      )}

      {/* Performance Insights */}
      {!isLoading && chartData.hourlyRevenue.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Performance Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {chartData.hourlyRevenue.length > 0 &&
              (() => {
                const peakHour = chartData.hourlyRevenue.reduce((max, curr) =>
                  curr.revenue > max.revenue ? curr : max,
                );
                return (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                    <div className="text-green-400 font-semibold mb-1">
                      Peak Hours
                    </div>
                    <div className="text-white text-sm">
                      {peakHour.hour} generates highest revenue (₹
                      {Math.round(peakHour.revenue)})
                    </div>
                  </div>
                );
              })()}
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="text-yellow-400 font-semibold mb-1">
                Total Revenue
              </div>
              <div className="text-white text-sm">
                ₹{analytics.revenue.current.toLocaleString()} in selected period
              </div>
            </div>
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
              <div className="text-purple-400 font-semibold mb-1">
                Total Orders
              </div>
              <div className="text-white text-sm">
                {analytics.orders.current} orders processed
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnalyticsDashboard;
