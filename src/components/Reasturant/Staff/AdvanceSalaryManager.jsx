import React, { useState, useEffect } from 'react';
import { FiCreditCard, FiUser, FiCalendar, FiDollarSign, FiCheck, FiX, FiEye, FiRefreshCw } from 'react-icons/fi';

const AdvanceSalaryManager = () => {
  const [staff, setStaff] = useState([]);
  const [advanceRecords, setAdvanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('hold'); // hold, give, view
  const [formData, setFormData] = useState({
    amount: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchStaff();
    fetchAdvanceRecords();
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

  const fetchAdvanceRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salary/advance/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdvanceRecords(data.records || []);
      }
    } catch (error) {
      console.error('Error fetching advance records:', error);
    }
    setLoading(false);
  };

  const giveAdvanceSalary = async () => {
    if (!formData.amount || !selectedStaff) return;

    try {
      const token = localStorage.getItem('token');
      // Use the hold endpoint but immediately release it to simulate "giving"
      const holdResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/salary/advance/hold/${selectedStaff._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          notes: `${formData.notes} [Given directly]`
        })
      });

      if (holdResponse.ok) {
        const holdResult = await holdResponse.json();
        
        // Immediately release it to mark as "given"
        const releaseResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/salary/advance/release/${holdResult.record._id}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (releaseResponse.ok) {
          alert('Advance salary given successfully!');
          setShowModal(false);
          setFormData({ amount: '', reason: '', notes: '' });
          fetchAdvanceRecords();
          fetchStaff();
        } else {
          alert('Advance held but failed to mark as given');
        }
      } else {
        const error = await holdResponse.json();
        alert(error.error || 'Failed to give advance salary');
      }
    } catch (error) {
      console.error('Error giving advance salary:', error);
      alert('Error giving advance salary');
    }
  };

  const holdAdvanceSalary = async () => {
    if (!formData.amount || !selectedStaff) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salary/advance/hold/${selectedStaff._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Advance salary held successfully!');
        setShowModal(false);
        setFormData({ amount: '', reason: '', notes: '' });
        fetchAdvanceRecords();
        fetchStaff();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to hold advance salary');
      }
    } catch (error) {
      console.error('Error holding advance salary:', error);
      alert('Error holding advance salary');
    }
  };

  const releaseAdvanceSalary = async (recordId) => {
    if (!confirm('Are you sure you want to release this advance salary?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salary/advance/release/${recordId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Advance salary released successfully!');
        fetchAdvanceRecords();
        fetchStaff();
      }
    } catch (error) {
      console.error('Error releasing advance salary:', error);
    }
  };

  const deductAdvanceSalary = async (recordId) => {
    if (!confirm('Are you sure you want to mark this advance as deducted?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salary/advance/deduct/${recordId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Advance salary marked as deducted!');
        fetchAdvanceRecords();
        fetchStaff();
      }
    } catch (error) {
      console.error('Error deducting advance salary:', error);
    }
  };

  const openModal = (type, staffMember = null) => {
    setModalType(type);
    setSelectedStaff(staffMember);
    setShowModal(true);
    if (type === 'hold') {
      setFormData({ amount: '', reason: '', notes: '' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'held': return 'bg-yellow-500/30 text-yellow-300';
      case 'released': return 'bg-green-500/30 text-green-300';
      case 'deducted': return 'bg-blue-500/30 text-blue-300';
      default: return 'bg-gray-500/30 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <FiRefreshCw className="text-4xl mb-4 animate-spin mx-auto text-white" />
          <p className="text-white">Loading advance salary data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Advance Salary Management</h2>
        <button
          onClick={fetchAdvanceRecords}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center gap-2 transition-all border border-white/40"
        >
          <FiRefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {staff.map((member) => (
          <div key={member._id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/30">
            <div className="flex items-center gap-3 mb-3">
              <FiUser className="text-2xl text-white" />
              <div>
                <h3 className="font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-gray-300">{member.role}</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Salary:</span>
                <span className="text-white font-medium">
                  ₹{member.salaryAmount || member.hourlyRate || member.dayRate || 0}
                  /{member.salaryType === 'fixed' ? 'month' : member.salaryType === 'hourly' ? 'hr' : 'day'}
                </span>
              </div>
              
              {member.advanceSalary?.isHeld && (
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-300">Advance Held:</span>
                  <span className="text-yellow-300 font-bold">₹{member.advanceSalary.amount}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openModal('hold', member)}
                disabled={member.advanceSalary?.isHeld}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  member.advanceSalary?.isHeld
                    ? 'bg-gray-600/50 text-gray-300 cursor-not-allowed border border-gray-500/50'
                    : 'bg-white/20 hover:bg-white/30 text-gray-900 border border-white/30'
                }`}
              >
                <FiCreditCard size={14} className="inline mr-1" />
                {member.advanceSalary?.isHeld ? 'Held' : 'Hold'}
              </button>
              
              <button
                onClick={() => openModal('give', member)}
                className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 text-gray-900 rounded-lg text-xs font-medium transition-all border border-white/30"
              >
                <FiDollarSign size={14} className="inline mr-1" />
                Give
              </button>
              
              <button
                onClick={() => openModal('view', member)}
                className="px-3 py-2 bg-white/20 hover:bg-white/30 text-gray-900 rounded-lg text-xs font-medium transition-all border border-white/30"
              >
                <FiEye size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Advance Records Table */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/30 overflow-hidden">
        <div className="p-4 border-b border-white/20">
          <h3 className="text-lg font-semibold text-white">Advance Salary Records</h3>
        </div>
        
        {advanceRecords.length === 0 ? (
          <div className="p-8 text-center">
            <FiCreditCard className="text-4xl mx-auto mb-4 text-gray-400" />
            <p className="text-gray-400">No advance salary records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20 bg-white/5">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Staff</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Reason</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {advanceRecords.map((record) => (
                  <tr key={record._id} className="border-b border-white/10 hover:bg-white/5 transition">
                    <td className="px-4 py-3 text-sm text-white">{record.staffName}</td>
                    <td className="px-4 py-3 text-sm text-white font-semibold">₹{record.amount}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{record.reason || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(record.status)}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {new Date(record.heldAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-1">
                        {record.status === 'held' && (
                          <>
                            <button
                              onClick={() => releaseAdvanceSalary(record._id)}
                              className="px-2 py-1 bg-white/20 hover:bg-white/30 text-gray-900 rounded text-xs font-medium border border-white/30"
                              title="Release"
                            >
                              <FiCheck size={12} />
                            </button>
                            <button
                              onClick={() => deductAdvanceSalary(record._id)}
                              className="px-2 py-1 bg-white/20 hover:bg-white/30 text-gray-900 rounded text-xs font-medium border border-white/30"
                              title="Mark as Deducted"
                            >
                              <FiDollarSign size={12} />
                            </button>
                          </>
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
            {modalType === 'hold' ? (
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Hold Advance Salary</h3>
                <p className="text-gray-600 mb-4">Staff: <span className="font-semibold">{selectedStaff?.name}</span></p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="Enter advance amount"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                    <input
                      type="text"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Reason for advance"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes"
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                    onClick={holdAdvanceSalary}
                    className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 text-gray-900 rounded-lg font-medium border border-white/30"
                  >
                    Hold Advance
                  </button>
                </div>
              </>
            ) : modalType === 'give' ? (
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Give Advance Salary</h3>
                <p className="text-gray-600 mb-4">Staff: <span className="font-semibold">{selectedStaff?.name}</span></p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="Enter advance amount"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                    <input
                      type="text"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Reason for advance"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes"
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    onClick={giveAdvanceSalary}
                    className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 text-gray-900 rounded-lg font-medium border border-white/30"
                  >
                    Give Advance
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Staff Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold">{selectedStaff?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-semibold">{selectedStaff?.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Salary:</span>
                    <span className="font-semibold">
                      ₹{selectedStaff?.salaryAmount || selectedStaff?.hourlyRate || selectedStaff?.dayRate || 0}
                    </span>
                  </div>
                  {selectedStaff?.advanceSalary?.isHeld && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Advance Held:</span>
                        <span className="font-semibold text-yellow-600">₹{selectedStaff.advanceSalary.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reason:</span>
                        <span className="font-semibold">{selectedStaff.advanceSalary.reason || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Held Date:</span>
                        <span className="font-semibold">
                          {new Date(selectedStaff.advanceSalary.heldAt).toLocaleDateString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full mt-6 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvanceSalaryManager;