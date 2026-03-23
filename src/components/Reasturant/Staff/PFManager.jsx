import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiUser, FiPercent, FiDollarSign, FiCheck, FiX, FiRefreshCw, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const PFManager = () => {
  const [staff, setStaff] = useState([]);
  const [pfRecords, setPfRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    isEnabled: false,
    notes: ''
  });

  useEffect(() => {
    fetchStaff();
    fetchPFRecords();
  }, []);

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
  };

  const fetchPFRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salary/pf/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPfRecords(data.records || []);
      }
    } catch (error) {
      console.error('Error fetching PF records:', error);
    }
    setLoading(false);
  };

  const setPFDeduction = async () => {
    if (!selectedStaff) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salary/pf/enable/${selectedStaff._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        setShowModal(false);
        setFormData({ isEnabled: false, notes: '' });
        fetchPFRecords();
        fetchStaff();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update PF settings');
      }
    } catch (error) {
      console.error('Error setting PF deduction:', error);
      alert('Error updating PF settings');
    }
  };

  const deductEmployerPF = async (staffId) => {
    if (!confirm('Are you sure you want to deduct employer PF contribution (2.5%)?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salary/pf/deduct-employer/${staffId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchPFRecords();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to deduct employer PF');
      }
    } catch (error) {
      console.error('Error deducting employer PF:', error);
    }
  };

  const markPFDeducted = async (recordId) => {
    if (!confirm('Are you sure you want to mark this PF as deducted?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salary/pf/mark-deducted/${recordId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('PF marked as deducted successfully!');
        fetchPFRecords();
      }
    } catch (error) {
      console.error('Error marking PF as deducted:', error);
    }
  };

  const openModal = (staffMember) => {
    setSelectedStaff(staffMember);
    setFormData({
      isEnabled: staffMember.pfDeduction?.isEnabled || false,
      notes: ''
    });
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/30 text-green-300';
      case 'deducted': return 'bg-blue-500/30 text-blue-300';
      case 'cancelled': return 'bg-red-500/30 text-red-300';
      default: return 'bg-gray-500/30 text-gray-300';
    }
  };

  const calculatePFAmount = (salary) => {
    const employeeDeduction = (salary * 2.5) / 100;
    const employerDeduction = (salary * 2.5) / 100;
    return { employeeDeduction, employerDeduction, total: employeeDeduction + employerDeduction };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <FiRefreshCw className="text-4xl mb-4 animate-spin mx-auto text-white" />
          <p className="text-white">Loading PF data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">PF Management</h2>
        <button
          onClick={fetchPFRecords}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center gap-2 transition-all border border-white/40"
        >
          <FiRefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {staff.map((member) => {
          const salary = member.salaryAmount || member.hourlyRate || member.dayRate || 0;
          const pfAmount = calculatePFAmount(salary);
          const isPFEnabled = member.pfDeduction?.isEnabled || false;
          
          return (
            <div key={member._id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/30">
              <div className="flex items-center gap-3 mb-3">
                <FiUser className="text-2xl text-white" />
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{member.name}</h3>
                  <p className="text-sm text-gray-300">{member.role}</p>
                </div>
                <div className="flex items-center gap-1">
                  {isPFEnabled ? (
                    <FiToggleRight className="text-2xl text-green-400" />
                  ) : (
                    <FiToggleLeft className="text-2xl text-gray-400" />
                  )}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Salary:</span>
                  <span className="text-white font-medium">₹{salary}</span>
                </div>
                
                {isPFEnabled && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Employee PF (2.5%):</span>
                      <span className="text-blue-300 font-medium">₹{pfAmount.employeeDeduction.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Employer PF (2.5%):</span>
                      <span className="text-green-300 font-medium">₹{pfAmount.employerDeduction.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-white/20 pt-2">
                      <span className="text-white font-medium">Total PF:</span>
                      <span className="text-yellow-300 font-bold">₹{pfAmount.total.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => openModal(member)}
                className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                  isPFEnabled
                    ? 'bg-white/20 hover:bg-white/30 text-gray-900 border-white/30'
                    : 'bg-white/20 hover:bg-white/30 text-gray-900 border-white/30'
                }`}
              >
                <FiPercent size={14} className="inline mr-1" />
                {isPFEnabled ? 'PF Enabled' : 'Enable PF'}
              </button>
            </div>
          );
        })}
      </div>

      {/* PF Records Table */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/30 overflow-hidden">
        <div className="p-4 border-b border-white/20">
          <h3 className="text-lg font-semibold text-white">PF Deduction Records</h3>
        </div>
        
        {pfRecords.length === 0 ? (
          <div className="p-8 text-center">
            <FiTrendingUp className="text-4xl mx-auto mb-4 text-gray-400" />
            <p className="text-gray-400">No PF records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20 bg-white/5">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Staff</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Month</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Salary</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Employee PF</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Employer PF</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pfRecords.map((record) => (
                  <tr key={record._id} className="border-b border-white/10 hover:bg-white/5 transition">
                    <td className="px-4 py-3 text-sm text-white">{record.staffName}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{record.month}</td>
                    <td className="px-4 py-3 text-sm text-white">₹{record.salaryAmount}</td>
                    <td className="px-4 py-3 text-sm text-blue-300">₹{record.employeeDeduction.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-green-300">
                      ₹{record.employerDeduction.toFixed(2)}
                      {!record.employerDeducted && (
                        <span className="ml-1 text-xs text-yellow-300">(Pending)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-yellow-300 font-semibold">
                      ₹{record.totalDeduction.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(record.status)}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-1">
                        {record.status === 'active' && !record.employerDeducted && (
                          <button
                            onClick={() => deductEmployerPF(record.staffId)}
                            className="px-2 py-1 bg-white/20 hover:bg-white/30 text-gray-900 rounded text-xs font-medium border border-white/30"
                            title="Deduct Employer PF"
                          >
                            <FiDollarSign size={12} />
                          </button>
                        )}
                        {record.status === 'active' && (
                          <button
                            onClick={() => markPFDeducted(record._id)}
                            className="px-2 py-1 bg-white/20 hover:bg-white/30 text-gray-900 rounded text-xs font-medium border border-white/30"
                            title="Mark as Deducted"
                          >
                            <FiCheck size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 w-96 shadow-2xl border border-white/40">
            <h3 className="text-xl font-bold text-gray-800 mb-4">PF Settings</h3>
            <p className="text-gray-600 mb-4">Staff: <span className="font-semibold">{selectedStaff?.name}</span></p>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">PF Calculation</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Salary:</span>
                    <span className="font-medium">₹{selectedStaff?.salaryAmount || selectedStaff?.hourlyRate || selectedStaff?.dayRate || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Employee PF (2.5%):</span>
                    <span className="font-medium text-blue-600">
                      ₹{calculatePFAmount(selectedStaff?.salaryAmount || selectedStaff?.hourlyRate || selectedStaff?.dayRate || 0).employeeDeduction.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Employer PF (2.5%):</span>
                    <span className="font-medium text-green-600">
                      ₹{calculatePFAmount(selectedStaff?.salaryAmount || selectedStaff?.hourlyRate || selectedStaff?.dayRate || 0).employerDeduction.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="font-semibold">Total PF:</span>
                    <span className="font-bold text-yellow-600">
                      ₹{calculatePFAmount(selectedStaff?.salaryAmount || selectedStaff?.hourlyRate || selectedStaff?.dayRate || 0).total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isEnabled}
                    onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">Enable PF Deduction</span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={setPFDeduction}
                className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 text-gray-900 rounded-lg font-medium border border-white/30"
              >
                Update PF Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PFManager;