import React, { useState, useEffect } from 'react';
import { FiTag, FiEdit2, FiTrash2 } from 'react-icons/fi';

const CouponManagement = () => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'coupon',
    discountType: 'percentage',
    value: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    applyToAll: true,
    usageLimit: '',
    perUserLimit: '',
    validFrom: '',
    validUntil: '',
    isActive: true,
    timeSlots: [{ startTime: '', endTime: '', daysOfWeek: [] }]
  });
  const [coupons, setCoupons] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/discounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (err) {
      console.error('Failed to fetch coupons');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const url = editingId 
        ? `${import.meta.env.VITE_API_URL}/api/discounts/${editingId}`
        : `${import.meta.env.VITE_API_URL}/api/discounts`;
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess(editingId ? 'Coupon updated successfully!' : 'Coupon created successfully!');
        setFormData({
          name: '', code: '', type: 'coupon', discountType: 'percentage',
          value: '', minOrderAmount: '', maxDiscountAmount: '', applyToAll: true,
          usageLimit: '', perUserLimit: '', validFrom: '', validUntil: '', isActive: true,
          timeSlots: [{ startTime: '', endTime: '', daysOfWeek: [] }]
        });
        setEditingId(null);
        fetchCoupons();
      } else {
        const data = await res.json();
        setError(data.error || `Failed to ${editingId ? 'update' : 'create'} coupon`);
      }
    } catch (err) {
      setError(`Failed to ${editingId ? 'update' : 'create'} coupon`);
    }
  };

  const handleEdit = (coupon) => {
    setFormData({
      name: coupon.name,
      code: coupon.code,
      type: coupon.type || 'coupon',
      discountType: coupon.discountType,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount || '',
      maxDiscountAmount: coupon.maxDiscountAmount || '',
      applyToAll: coupon.applyToAll ?? true,
      usageLimit: coupon.usageLimit || '',
      perUserLimit: coupon.perUserLimit || '',
      validFrom: coupon.validFrom?.split('T')[0] || '',
      validUntil: coupon.validUntil?.split('T')[0] || '',
      isActive: coupon.isActive ?? true,
      timeSlots: coupon.timeSlots || [{ startTime: '', endTime: '', daysOfWeek: [] }]
    });
    setEditingId(coupon._id);
    setSuccess('');
    setError('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/discounts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setSuccess('Coupon deleted successfully!');
        fetchCoupons();
      } else {
        setError('Failed to delete coupon');
      }
    } catch (err) {
      setError('Failed to delete coupon');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '', code: '', type: 'coupon', discountType: 'percentage',
      value: '', minOrderAmount: '', maxDiscountAmount: '', applyToAll: true,
      usageLimit: '', perUserLimit: '', validFrom: '', validUntil: '', isActive: true,
      timeSlots: [{ startTime: '', endTime: '', daysOfWeek: [] }]
    });
    setEditingId(null);
    setError('');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FiTag className="text-blue-400" size={32} />
        <h2 className="text-2xl font-bold text-white">{editingId ? 'Edit Coupon' : 'Create Coupon'}</h2>
      </div>

      {success && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Coupon Name *" required value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400" />
          <input type="text" placeholder="Code (e.g., SAVE20) *" required={formData.type !== 'happy_hour'} value={formData.code}
            onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400" />
          
          <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white">
            <option value="coupon">Coupon</option>
            <option value="happy_hour">Happy Hour</option>
          </select>
          <select value={formData.discountType} onChange={(e) => setFormData({...formData, discountType: e.target.value})}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white">
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
          <input type="number" placeholder="Value *" required value={formData.value}
            onChange={(e) => setFormData({...formData, value: e.target.value})}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400" />
          
          <input type="number" placeholder="Min Order Amount" value={formData.minOrderAmount}
            onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400" />
          <input type="number" placeholder="Max Discount Amount" value={formData.maxDiscountAmount}
            onChange={(e) => setFormData({...formData, maxDiscountAmount: e.target.value})}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400" />
          
          <input type="number" placeholder="Usage Limit" value={formData.usageLimit}
            onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400" />
          <input type="number" placeholder="Per User Limit" value={formData.perUserLimit}
            onChange={(e) => setFormData({...formData, perUserLimit: e.target.value})}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400" />
          
          <input type="date" placeholder="Valid From *" required value={formData.validFrom}
            onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white" />
          <input type="date" placeholder="Valid Until *" required value={formData.validUntil}
            onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white" />
        </div>
        
        {formData.type === 'happy_hour' && (
          <div className="space-y-3">
            <h4 className="text-white font-medium">⏰ Time Slots</h4>
            {formData.timeSlots.map((slot, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="time" value={slot.startTime}
                    onChange={(e) => {
                      const newSlots = [...formData.timeSlots];
                      newSlots[idx].startTime = e.target.value;
                      setFormData({...formData, timeSlots: newSlots});
                    }}
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white" placeholder="Start Time" />
                  <input type="time" value={slot.endTime}
                    onChange={(e) => {
                      const newSlots = [...formData.timeSlots];
                      newSlots[idx].endTime = e.target.value;
                      setFormData({...formData, timeSlots: newSlots});
                    }}
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white" placeholder="End Time" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dayIdx) => (
                    <label key={dayIdx} className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/20">
                      <input type="checkbox"
                        checked={slot.daysOfWeek.includes(dayIdx)}
                        onChange={(e) => {
                          const newSlots = [...formData.timeSlots];
                          if (e.target.checked) {
                            newSlots[idx].daysOfWeek = [...newSlots[idx].daysOfWeek, dayIdx];
                          } else {
                            newSlots[idx].daysOfWeek = newSlots[idx].daysOfWeek.filter(d => d !== dayIdx);
                          }
                          setFormData({...formData, timeSlots: newSlots});
                        }}
                        className="w-4 h-4" />
                      <span className="text-white text-sm">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <label className="flex items-center gap-2 text-white">
          <input type="checkbox" checked={formData.isActive}
            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
            className="w-4 h-4" />
          Active
        </label>

        <div className="flex gap-2">
          <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-medium">
            {editingId ? 'Update Coupon' : 'Create Coupon'}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancel} className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Existing Coupons</h3>
        {coupons.length === 0 ? (
          <p className="text-gray-400">No coupons found</p>
        ) : (
          <div className="space-y-3">
            {coupons.map((coupon) => (
              <div key={coupon._id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-white">{coupon.name}</h4>
                    <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-mono">{coupon.code}</span>
                    <span className={`px-2 py-1 rounded text-xs ${coupon.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>Discount: {coupon.discountType === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}</p>
                    {coupon.minOrderAmount && <p>Min Order: ₹{coupon.minOrderAmount}</p>}
                    {coupon.maxDiscountAmount && <p>Max Discount: ₹{coupon.maxDiscountAmount}</p>}
                    <p>Valid: {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}</p>
                    {coupon.usageLimit && <p>Usage Limit: {coupon.currentUsage || 0}/{coupon.usageLimit}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(coupon)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30">
                    <FiEdit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(coupon._id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponManagement;
