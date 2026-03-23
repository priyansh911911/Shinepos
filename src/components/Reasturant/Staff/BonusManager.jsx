import React, { useState, useEffect } from 'react';
import { FiGift, FiUser, FiDollarSign, FiPercent, FiCheck, FiX, FiRefreshCw, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

const BonusManager = () => {
  const [staff, setStaff] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // add, edit, view
  const [formData, setFormData] = useState({
    bonusType: 'performance',
    amount: '',
    percentage: '',
    basedOnSalary: false,
    reason: '',
    description: '',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  const bonusTypes = [
    { value: 'performance', label: 'Performance Bonus' },
    { value: 'festival', label: 'Festival Bonus' },
    { value: 'annual', label: 'Annual Bonus' },
    { value: 'achievement', label: 'Achievement Bonus' },
    { value: 'overtime', label: 'Overtime Bonus' },
    { value: 'custom', label: 'Custom Bonus' }
  ];

  useEffect(() => {
    fetchStaff();
    fetchBonuses();
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

  const fetchBonuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salary/bonus/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBonuses(data.bonuses || []);
      }
    } catch (error) {
      console.error('Error fetching bonuses:', error);
    }
    setLoading(false);
  };

  const addBonus = async () => {
    if (!selectedStaff || !formData.reason) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salary/bonus/add/${selectedStaff._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Bonus added successfully! Amount: ₹${result.calculatedAmount}`);
        setShowModal(false);
        resetForm();
        fetchBonuses();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add bonus');
      }
    } catch (error) {
      console.error('Error adding bonus:', error);
      alert('Error adding bonus');
    }
  };

  const updateBonusStatus = async (bonusId, status, notes = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salary/bonus/status/${bonusId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, notes })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchBonuses();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update bonus status');
      }
    } catch (error) {
      console.error('Error updating bonus status:', error);
    }
  };

  const deleteBonus = async (bonusId) => {
    if (!confirm('Are you sure you want to delete this bonus?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/salary/bonus/${bonusId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Bonus deleted successfully!');
        fetchBonuses();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete bonus');
      }
    } catch (error) {
      console.error('Error deleting bonus:', error);
    }
  };

  const openModal = (type, staffMember = null, bonus = null) => {
    setModalType(type);
    setSelectedStaff(staffMember);
    setShowModal(true);
    
    if (type === 'add') {
      resetForm();
    } else if (type === 'edit' && bonus) {
      setFormData({
        bonusType: bonus.bonusType,
        amount: bonus.amount.toString(),
        percentage: bonus.percentage?.toString() || '',
        basedOnSalary: bonus.basedOnSalary,
        reason: bonus.reason,
        description: bonus.description,
        effectiveDate: new Date(bonus.effectiveDate).toISOString().split('T')[0]
      });
    }
  };

  const resetForm = () => {
    setFormData({
      bonusType: 'performance',
      amount: '',
      percentage: '',
      basedOnSalary: false,
      reason: '',
      description: '',
      effectiveDate: new Date().toISOString().split('T')[0]
    });
  };

  const calculateBonusAmount = () => {
    if (!selectedStaff || !formData.basedOnSalary || !formData.percentage) return 0;
    const salary = selectedStaff.salaryAmount || selectedStaff.hourlyRate || selectedStaff.dayRate || 0;
    return (salary * parseFloat(formData.percentage)) / 100;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/30 text-yellow-300';
      case 'approved': return 'bg-green-500/30 text-green-300';
      case 'paid': return 'bg-blue-500/30 text-blue-300';
      case 'cancelled': return 'bg-red-500/30 text-red-300';
      default: return 'bg-gray-500/30 text-gray-300';
    }
  };

  const getBonusTypeColor = (type) => {
    switch (type) {
      case 'performance': return 'bg-blue-100 text-blue-800';
      case 'festival': return 'bg-purple-100 text-purple-800';
      case 'annual': return 'bg-green-100 text-green-800';
      case 'achievement': return 'bg-yellow-100 text-yellow-800';
      case 'overtime': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <FiRefreshCw className="text-4xl mb-4 animate-spin mx-auto text-white" />
          <p className="text-white">Loading bonus data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Bonus Management</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchBonuses}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center gap-2 transition-all border border-white/40"
          >
            <FiRefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {staff.map((member) => {
          const memberBonuses = bonuses.filter(b => b.staffId === member._id);
          const totalBonuses = memberBonuses.reduce((sum, b) => sum + (b.status === 'approved' || b.status === 'paid' ? b.amount : 0), 0);
          
          return (
            <div key={member._id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/30">
              <div className="flex items-center gap-3 mb-3">
                <FiUser className="text-2xl text-white" />
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{member.name}</h3>
                  <p className="text-sm text-gray-300">{member.role}</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Salary:</span>
                  <span className="text-white font-medium">
                    ₹{member.salaryAmount || member.hourlyRate || member.dayRate || 0}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Total Bonuses:</span>
                  <span className="text-green-300 font-bold">₹{totalBonuses.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Bonus Count:</span>
                  <span className="text-blue-300 font-medium">{memberBonuses.length}</span>
                </div>
              </div>

              <button
                onClick={() => openModal('add', member)}
                className="w-full px-3 py-2 bg-white/20 hover:bg-white/30 text-gray-900 rounded-lg text-xs font-medium transition-all border border-white/30"
              >
                <FiPlus size={14} className="inline mr-1" />
                Add Bonus
              </button>
            </div>
          );
        })}
      </div>

      {/* Bonus Records Table */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/30 overflow-hidden">
        <div className="p-4 border-b border-white/20">
          <h3 className="text-lg font-semibold text-white">Bonus Records</h3>
        </div>
        
        {bonuses.length === 0 ? (
          <div className="p-8 text-center">
            <FiGift className="text-4xl mx-auto mb-4 text-gray-400" />
            <p className="text-gray-400">No bonus records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20 bg-white/5">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Staff</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Reason</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bonuses.map((bonus) => (
                  <tr key={bonus._id} className="border-b border-white/10 hover:bg-white/5 transition">
                    <td className="px-4 py-3 text-sm text-white">{bonus.staffName}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBonusTypeColor(bonus.bonusType)}`}>
                        {bonus.bonusType.charAt(0).toUpperCase() + bonus.bonusType.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white font-semibold">
                      ₹{bonus.amount}
                      {bonus.basedOnSalary && (
                        <span className="text-xs text-gray-400 ml-1">({bonus.percentage}%)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{bonus.reason}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(bonus.status)}`}>
                        {bonus.status.charAt(0).toUpperCase() + bonus.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {new Date(bonus.effectiveDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-1">
                        {bonus.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateBonusStatus(bonus._id, 'approved')}
                              className="px-2 py-1 bg-white/20 hover:bg-white/30 text-gray-900 rounded text-xs font-medium border border-white/30"
                              title="Approve"
                            >
                              <FiCheck size={12} />
                            </button>
                            <button
                              onClick={() => updateBonusStatus(bonus._id, 'cancelled')}
                              className="px-2 py-1 bg-white/20 hover:bg-white/30 text-gray-900 rounded text-xs font-medium border border-white/30"
                              title="Cancel"
                            >
                              <FiX size={12} />
                            </button>
                          </>
                        )}
                        {bonus.status === 'approved' && (
                          <button
                            onClick={() => updateBonusStatus(bonus._id, 'paid')}
                            className="px-2 py-1 bg-white/20 hover:bg-white/30 text-gray-900 rounded text-xs font-medium border border-white/30"
                            title="Mark as Paid"
                          >
                            <FiDollarSign size={12} />
                          </button>
                        )}
                        {bonus.status !== 'paid' && (
                          <button
                            onClick={() => deleteBonus(bonus._id)}
                            className="px-2 py-1 bg-white/20 hover:bg-white/30 text-gray-900 rounded text-xs font-medium border border-white/30"
                            title="Delete"
                          >
                            <FiTrash2 size={12} />
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
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 w-96 shadow-2xl border border-white/40 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {modalType === 'add' ? 'Add Bonus' : 'Edit Bonus'}
            </h3>
            <p className="text-gray-600 mb-4">Staff: <span className="font-semibold">{selectedStaff?.name}</span></p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bonus Type</label>
                <select
                  value={formData.bonusType}
                  onChange={(e) => setFormData({ ...formData, bonusType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {bonusTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.basedOnSalary}
                    onChange={(e) => setFormData({ ...formData, basedOnSalary: e.target.checked, amount: '' })}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-gray-700 font-medium">Calculate based on salary percentage</span>
                </label>
              </div>

              {formData.basedOnSalary ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Percentage (%)</label>
                  <input
                    type="number"
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                    placeholder="Enter percentage (e.g., 10)"
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {formData.percentage && (
                    <p className="text-sm text-green-600 mt-1">
                      Calculated Amount: ₹{calculateBonusAmount().toFixed(2)}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="Enter bonus amount"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Reason for bonus"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional description"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Effective Date</label>
                <input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
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
                onClick={addBonus}
                className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 text-gray-900 rounded-lg font-medium border border-white/30"
              >
                {modalType === 'add' ? 'Add Bonus' : 'Update Bonus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BonusManager;