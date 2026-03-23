import React, { useState, useEffect } from 'react';
import { FiUser, FiDollarSign, FiTrendingUp, FiClock, FiRefreshCw, FiDownload, FiCheck } from 'react-icons/fi';

const SalaryCalculator = () => {
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [salaryBreakdown, setSalaryBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [overtimeTotal, setOvertimeTotal] = useState(0);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchOvertimeTotal = async (staffId) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching overtime for staff ID:', staffId);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/staff/staff-overtime-records/${staffId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      console.log('Overtime API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Overtime API data:', data);
        const total = data.records?.reduce((sum, record) => {
          const amount = parseFloat(record.amount) || 0;
          console.log('Processing record:', record, 'Amount:', amount);
          return sum + amount;
        }, 0) || 0;
        console.log('Calculated total:', total);
        setOvertimeTotal(total);
      } else {
        console.error('API response not ok:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching overtime total:', error);
      setOvertimeTotal(0);
    }
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/staff/all/staff`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStaff(data.staff || []);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
    setLoading(false);
  };

  const calculateSalary = async (staffId) => {
    if (!staffId) return;
    
    setCalculating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/salary/calculate/${staffId}?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSalaryBreakdown(data.salaryBreakdown);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to calculate salary');
      }
    } catch (error) {
      console.error('Error calculating salary:', error);
      alert('Error calculating salary');
    }
    setCalculating(false);
  };

  const processSalary = async (staffId, autoDeductAdvances = true) => {
    if (!confirm(`Are you sure you want to process salary for ${selectedStaff?.name}?`)) return;
    
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salary/process/${staffId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
          autoDeductAdvances
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        // Refresh the calculation after processing
        calculateSalary(staffId);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to process salary');
      }
    } catch (error) {
      console.error('Error processing salary:', error);
      alert('Error processing salary');
    }
    setProcessing(false);
  };

  const selectStaff = (member) => {
    setSelectedStaff(member);
    setSalaryBreakdown(null);
    setOvertimeTotal(0);
    calculateSalary(member._id);
    fetchOvertimeTotal(member._id);
  };

  const generateMonthOptions = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months.map((month, index) => (
      <option key={index + 1} value={index + 1}>{month}</option>
    ));
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years.map(year => (
      <option key={year} value={year}>{year}</option>
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <FiRefreshCw className="text-4xl mb-4 animate-spin mx-auto text-white" />
          <p className="text-white">Loading salary calculator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Salary Calculator</h2>
        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 bg-white/20 backdrop-blur-md border-2 border-white/30 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {generateMonthOptions()}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 bg-white/20 backdrop-blur-md border-2 border-white/30 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {generateYearOptions()}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff List */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg rounded-xl border-2 border-white/30 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/20">
              <h3 className="text-lg font-semibold text-gray-900">Select Staff</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {staff.map((member) => (
                <div
                  key={member._id}
                  onClick={() => selectStaff(member)}
                  className={`p-4 border-b border-white/10 cursor-pointer transition-colors ${
                    selectedStaff?._id === member._id
                      ? 'bg-white/20'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FiUser className="text-xl text-gray-800" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{member.name}</h4>
                      <p className="text-sm text-gray-700">{member.role}</p>
                      <p className="text-xs text-gray-600">
                        ₹{member.salaryAmount || member.hourlyRate || member.dayRate || 0}
                        /{member.salaryType === 'fixed' ? 'month' : member.salaryType === 'hourly' ? 'hr' : 'day'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Salary Breakdown */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg rounded-xl border-2 border-white/30 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/20">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedStaff ? `Salary Breakdown - ${selectedStaff.name}` : 'Select a staff member'}
                </h3>
                {selectedStaff && (
                  <button
                    onClick={() => calculateSalary(selectedStaff._id)}
                    disabled={calculating}
                    className="px-3 py-2 bg-blue-500/80 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                  >
                    {calculating ? <FiRefreshCw className="animate-spin" size={16} /> : <FiDollarSign size={16} />}
                    {calculating ? ' Calculating...' : ' Recalculate'}
                  </button>
                )}
              </div>
            </div>

            {!selectedStaff ? (
              <div className="p-8 text-center">
                <FiDollarSign className="text-4xl mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400">Select a staff member to calculate salary</p>
              </div>
            ) : calculating ? (
              <div className="p-8 text-center">
                <FiRefreshCw className="text-4xl mb-4 animate-spin mx-auto text-white" />
                <p className="text-white">Calculating salary...</p>
              </div>
            ) : salaryBreakdown ? (
              <div className="p-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/30">
                    <div className="flex items-center gap-2 mb-2">
                      <FiTrendingUp className="text-gray-800" />
                      <span className="text-sm text-gray-800">Gross Salary</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">₹{salaryBreakdown.grossSalary}</p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/30">
                    <div className="flex items-center gap-2 mb-2">
                      <FiDollarSign className="text-gray-800" />
                      <span className="text-sm text-gray-800">Advance Salary</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">₹{salaryBreakdown.deductions.advanceSalary}</p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/30">
                    <div className="flex items-center gap-2 mb-2">
                      <FiClock className="text-gray-800" />
                      <span className="text-sm text-gray-800">Total Overtime</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">₹{overtimeTotal}</p>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/30 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiDollarSign className="text-gray-800" />
                    <span className="text-lg text-gray-800 font-semibold">Net Salary</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">₹{salaryBreakdown.grossSalary + overtimeTotal - salaryBreakdown.deductions.advanceSalary}</p>
                </div>

                {/* Detailed Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Earnings */}
                  <div className="bg-white/40 backdrop-blur-sm rounded-lg p-4 border border-white/40">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Earnings</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-800">Base Salary:</span>
                        <span className="text-gray-900 font-medium">₹{salaryBreakdown.baseSalary}</span>
                      </div>
                      
                      {salaryBreakdown.bonuses.total > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-800">Bonuses:</span>
                            <span className="text-gray-900 font-medium">₹{salaryBreakdown.bonuses.total}</span>
                          </div>
                          {salaryBreakdown.bonuses.details.map((bonus, index) => (
                            <div key={index} className="flex justify-between text-sm ml-4">
                              <span className="text-gray-700">• {bonus.type}:</span>
                              <span className="text-gray-900">₹{bonus.amount}</span>
                            </div>
                          ))}
                        </>
                      )}
                      
                      <div className="border-t border-white/20 pt-3">
                        <div className="flex justify-between font-semibold">
                          <span className="text-gray-900">Gross Salary:</span>
                          <span className="text-gray-900">₹{salaryBreakdown.grossSalary}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="bg-white/40 backdrop-blur-sm rounded-lg p-4 border border-white/40">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Deductions</h4>
                    <div className="space-y-3">
                      {salaryBreakdown.deductions.advanceSalary > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-800">Advance Salary:</span>
                          <span className="text-gray-900 font-medium">₹{salaryBreakdown.deductions.advanceSalary}</span>
                        </div>
                      )}
                      
                      {salaryBreakdown.deductions.pfDeduction > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-800">PF Deduction:</span>
                          <span className="text-gray-900 font-medium">₹{salaryBreakdown.deductions.pfDeduction}</span>
                        </div>
                      )}
                      
                      <div className="border-t border-white/20 pt-3">
                        <div className="flex justify-between font-semibold">
                          <span className="text-gray-900">Total Deductions:</span>
                          <span className="text-gray-900">₹{salaryBreakdown.deductions.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pending Advances */}
                {salaryBreakdown.pendingAdvances && salaryBreakdown.pendingAdvances.length > 0 && (
                  <div className="bg-white/30 rounded-lg p-4 border border-gray-400">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Pending Advances</h4>
                    <div className="space-y-2">
                      {salaryBreakdown.pendingAdvances.map((advance, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-800">
                            {advance.reason || 'Advance'} ({new Date(advance.heldAt).toLocaleDateString()}):
                          </span>
                          <span className="text-gray-900 font-medium">₹{advance.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t border-white/20">
                  <button
                    onClick={() => processSalary(selectedStaff._id, true)}
                    disabled={processing}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-3 border border-gray-500 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {processing ? (
                      <FiRefreshCw className="animate-spin" size={20} />
                    ) : (
                      <FiCheck size={20} />
                    )}
                    {processing ? 'Processing...' : 'Process Salary (Auto-deduct Advances)'}
                  </button>
                  
                  <button
                    onClick={() => processSalary(selectedStaff._id, false)}
                    disabled={processing}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-3 border border-gray-500 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {processing ? (
                      <FiRefreshCw className="animate-spin" size={20} />
                    ) : (
                      <FiDollarSign size={20} />
                    )}
                    {processing ? 'Processing...' : 'Process Salary (Keep Advances)'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <FiDollarSign className="text-4xl mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400">Click "Calculate" to view salary breakdown</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryCalculator;