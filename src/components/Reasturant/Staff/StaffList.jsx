import React, { useState, useEffect } from 'react';
import { FiAward, FiBarChart2, FiDollarSign, FiUsers, FiUser, FiMail, FiPhone, FiCalendar, FiEdit2, FiTrash2, FiPlus, FiLoader, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';

const StaffList = ({ onAdd, onEdit }) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffCheckInStatus, setStaffCheckInStatus] = useState({});
  const [overtimeModal, setOvertimeModal] = useState({ show: false, staff: null, rate: '' });
  const [overtimeRecordModal, setOvertimeRecordModal] = useState({ 
    show: false, 
    staff: null, 
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    hours: '',
    notes: ''
  });
  const [recordTimers, setRecordTimers] = useState({});
  const [viewRecordsModal, setViewRecordsModal] = useState({ show: false, staff: null, records: [] });
  const [assignOvertimeModal, setAssignOvertimeModal] = useState({ 
    show: false, 
    staff: null, 
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    hours: '',
    reason: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimers = {};
      viewRecordsModal.records?.forEach(record => {
        if (record.status === 'accepted' && record.respondedAt) {
          try {
            const startTime = new Date(record.respondedAt);
            const now = new Date();
            let diff = Math.floor((now - startTime) / 1000);
            const maxSeconds = record.hours * 3600;
            if (diff >= maxSeconds) {
              newTimers[record._id] = 'over';
            } else {
              const h = Math.floor(diff / 3600);
              const m = Math.floor((diff % 3600) / 60);
              const s = diff % 60;
              newTimers[record._id] = `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            }
          } catch (e) {
            newTimers[record._id] = '0:00:00';
          }
        }
      });
      setRecordTimers(newTimers);
    }, 1000);
    return () => clearInterval(timer);
  }, [viewRecordsModal.records]);

  const formatTime12Hour = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/staff/all/staff`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Full API response:', data);
        
        // Handle different response structures
        let staffData = [];
        if (data.staff && Array.isArray(data.staff)) {
          staffData = data.staff;
        } else if (Array.isArray(data)) {
          staffData = data;
        } else if (data.data && Array.isArray(data.data)) {
          staffData = data.data;
        }
        
        console.log('Processed staff data:', staffData);
        setStaff(staffData.filter(member => member && member._id));
        
        const today = new Date().toISOString().split('T')[0];
        const checkInStatus = {};
        for (const member of data.staff || []) {
          try {
            const attendanceResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/attendance/staff/${member._id}?date=${today}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (attendanceResponse.ok) {
              const attendanceData = await attendanceResponse.json();
              const hasCheckedIn = attendanceData.attendance?.checkIn ? true : false;
              const hasCheckedOut = attendanceData.attendance?.checkOut ? true : false;
              checkInStatus[member._id] = hasCheckedIn && !hasCheckedOut;
            } else {
              checkInStatus[member._id] = false;
            }
          } catch (err) {
            console.error(`Error fetching attendance for ${member._id}:`, err);
            checkInStatus[member._id] = false;
          }
        }
        setStaffCheckInStatus(checkInStatus);
      } else {
        console.error('Failed to fetch staff:', response.status, response.statusText);
        const errorData = await response.text();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      alert('Failed to load staff data. Please check your connection and try again.');
    }
    setLoading(false);
  };

  const deleteStaff = async (id) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/staff/update/staff/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: false })
      });
      
      if (response.ok) {
        setStaff(staff.filter(member => member._id !== id));
        alert('Staff member deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  const setOvertimeRate = async () => {
    if (!overtimeModal.rate || Number(overtimeModal.rate) <= 0) {
      alert('Please enter a valid overtime rate');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      console.log('Sending overtime rate update:', { staffId: overtimeModal.staff._id, rate: Number(overtimeModal.rate) });
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/staff/set-overtime-rate/${overtimeModal.staff._id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ overtimeRate: Number(overtimeModal.rate) })
      });
      
      const result = await response.json();
      console.log('Set overtime rate response:', result);
      
      if (response.ok) {
        // Update local state immediately
        const updatedRate = Number(overtimeModal.rate);
        setStaff(prevStaff => 
          prevStaff.map(s => 
            s._id === overtimeModal.staff._id 
              ? { ...s, overtimeRate: updatedRate }
              : s
          )
        );
        setOvertimeModal({ show: false, staff: null, rate: '' });
        alert('Overtime rate updated to ₹' + updatedRate + '/hr');
      } else {
        alert(result.error || 'Failed to update overtime rate');
      }
    } catch (error) {
      console.error('Error setting overtime rate:', error);
      alert('Error setting overtime rate');
    }
  };

  const addOvertimeRecord = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/staff/overtime-record/${overtimeRecordModal.staff._id}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: overtimeRecordModal.date,
          startTime: overtimeRecordModal.startTime,
          endTime: overtimeRecordModal.endTime,
          hours: Number(overtimeRecordModal.hours),
          notes: overtimeRecordModal.notes
        })
      });
      
      if (response.ok) {
        alert('Overtime record added successfully!');
        setOvertimeRecordModal({ show: false, staff: null, date: '', startTime: '', endTime: '', hours: '', notes: '' });
      }
    } catch (error) {
      console.error('Error adding overtime record:', error);
    }
  };

  const completeOvertimeRecord = async (recordId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/staff/overtime/${recordId}/complete`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'completed' })
      });
      
      if (response.ok) {
        alert('Overtime marked as completed!');
        viewOvertimeRecords(viewRecordsModal.staff);
      }
    } catch (error) {
      console.error('Error completing overtime:', error);
    }
  };

  const declineOvertimeRecord = async (recordId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/staff/overtime/${recordId}/respond`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'declined' })
      });
      
      if (response.ok) {
        alert('Overtime declined!');
        viewOvertimeRecords(viewRecordsModal.staff);
      }
    } catch (error) {
      console.error('Error declining overtime:', error);
    }
  };

  const viewOvertimeRecords = async (member) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/staff/staff-overtime-records/${member._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setViewRecordsModal({ show: true, staff: member, records: data.records });
      }
    } catch (error) {
      console.error('Error fetching overtime records:', error);
    }
  };

  const calculateHours = (startTime, endTime) => {
    if (!startTime || !endTime) return '';
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    let diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffMinutes < 0) diffMinutes += 24 * 60;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}:${String(minutes).padStart(2, '0')}`;
  };

  const parseTimeFormat = (timeStr) => {
    const parts = timeStr.split(':');
    if (parts.length !== 2) return null;
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    if (isNaN(h) || isNaN(m) || m < 0 || m > 59) return null;
    return h + (m / 60);
  };

  const assignOvertimeRequest = async () => {
    if (!assignOvertimeModal.hours) {
      alert('Please enter valid hours');
      return;
    }
    
    const hours = parseTimeFormat(assignOvertimeModal.hours);
    if (hours === null || hours <= 0) {
      alert('Please enter hours in format H:MM (e.g., 1:30)');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/staff/assign-overtime/${assignOvertimeModal.staff._id}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: assignOvertimeModal.date,
          startTime: assignOvertimeModal.startTime,
          endTime: assignOvertimeModal.endTime,
          hours: hours,
          reason: assignOvertimeModal.reason
        })
      });
      
      if (response.ok) {
        alert('Overtime assigned successfully!');
        setAssignOvertimeModal({ show: false, staff: null, date: '', startTime: '', endTime: '', hours: '', reason: '' });
      }
    } catch (error) {
      console.error('Error assigning overtime:', error);
      alert('Error assigning overtime');
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'RESTAURANT_ADMIN': return <FiAward />;
      case 'MANAGER': return <FiBarChart2 />;
      case 'CASHIER': return <FiDollarSign />;
      case 'KITCHEN_STAFF': return <FiUsers />;
      case 'WAITER': return <FiUser />;
      default: return <FiUser />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <FiLoader className="text-6xl mb-4 animate-spin mx-auto text-orange-500" size={64} />
          <p className="mt-4 text-white font-medium">Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-end items-center mb-6">
        <button
          onClick={onAdd}
          className="px-6 py-3 bg-white/30 backdrop-blur-md hover:bg-white/40 text-white rounded-xl flex items-center space-x-2 font-medium transition-all border border-white/40"
        >
          <FiPlus />
          <span>Add Staff</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.filter(member => member && member._id && member.name).map((member, index) => (
          <div 
            key={member._id} 
            className="bg-white/30 backdrop-blur-md rounded-xl shadow-lg border border-white/40 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn overflow-hidden"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-4 border-b border-white/30">
              <div className="flex items-center gap-3">
                <div className="text-4xl text-white">{getRoleIcon(member.role)}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{member.name}</h3>
                  <p className="text-sm text-gray-200">{member.role.replace('_', ' ')}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                  member.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {member.isActive ? <><FiCheckCircle /> Active</> : <><FiXCircle /> Inactive</>}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FiMail className="text-lg text-white" />
                <span className="text-white font-medium">{member.email}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <FiPhone className="text-lg text-white" />
                <span className="text-white font-medium">{member.phone}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <FiDollarSign className="text-lg text-white" />
                <span className="text-white font-medium">
                  {member.salaryType === 'fixed' && `₹${member.salaryAmount || 0}/month`}
                  {member.salaryType === 'hourly' && `₹${member.hourlyRate || 0}/hr`}
                  {member.salaryType === 'daily' && `₹${member.dayRate || 0}/day`}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <FiClock className="text-lg text-white" />
                <span className={`font-medium ${member.overtimeRate > 0 ? 'text-white' : 'text-yellow-300'}`}>
                  OT: ₹{member.overtimeRate || 0}/hr {member.overtimeRate === 0 && '⚠️'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <FiCalendar className="text-lg text-white" />
                <span className="text-gray-200">Joined {new Date(member.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 pt-0 flex gap-2">
              <button
                onClick={() => onEdit(member)}
                className="flex-1 px-3 py-2 bg-white/30 backdrop-blur-md hover:bg-white/40 text-white rounded-lg text-xs font-medium transition-all border border-white/40 flex items-center justify-center gap-1"
              >
                <FiEdit2 size={14} /> Edit
              </button>
              <button
                onClick={() => {
                  if (!staffCheckInStatus[member._id]) {
                    alert('Staff member has not checked in today');
                    return;
                  }
                  setAssignOvertimeModal({ show: true, staff: member, date: new Date().toISOString().split('T')[0], startTime: member.shiftSchedule?.fixedShift?.endTime || '', endTime: '', hours: '', reason: '' });
                }}
                disabled={!staffCheckInStatus[member._id]}
                className={`flex-1 px-3 py-2 backdrop-blur-md text-white rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                  staffCheckInStatus[member._id]
                    ? 'bg-yellow-500/80 hover:bg-yellow-600'
                    : 'bg-gray-400/50 cursor-not-allowed'
                }`}
              >
                <FiClock size={14} /> Assign
              </button>
              <button
                onClick={() => viewOvertimeRecords(member)}
                className="flex-1 px-3 py-2 bg-purple-500/80 backdrop-blur-md hover:bg-purple-600 text-white rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
              >
                <FiBarChart2 size={14} /> View
              </button>
              <button
                onClick={() => deleteStaff(member._id)}
                className="flex-1 px-3 py-2 bg-red-500/80 backdrop-blur-md hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
              >
                <FiTrash2 size={14} /> Del
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {staff.length === 0 && (
        <div className="text-center py-16 bg-white/70 backdrop-blur-md rounded-2xl">
          <FiUsers className="text-6xl mb-4 mx-auto text-gray-400" size={64} />
          <p className="text-gray-500 text-lg font-medium">No staff members found</p>
          <p className="text-gray-400 text-sm mt-2">Add some staff to get started</p>
        </div>
      )}

      {/* Overtime Rate Modal */}
      {overtimeModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 w-96 shadow-2xl border border-white/40">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Set Overtime Rate</h3>
            <p className="text-gray-600 mb-2">Staff: <span className="font-semibold">{overtimeModal.staff?.name}</span></p>
            <p className="text-sm text-gray-500 mb-4">Current Rate: ₹{overtimeModal.staff?.overtimeRate || 0}/hr</p>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Overtime Rate (₹/hour)</label>
            <input
              type="number"
              value={overtimeModal.rate}
              onChange={(e) => setOvertimeModal({ ...overtimeModal, rate: e.target.value })}
              placeholder="Enter overtime rate (e.g., 150)"
              min="0"
              step="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setOvertimeModal({ show: false, staff: null, rate: '' })}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={setOvertimeRate}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Overtime Record Modal */}
      {overtimeRecordModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 w-96 shadow-2xl border border-white/40">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add Overtime Record</h3>
            <p className="text-gray-600 mb-2">Staff: <span className="font-semibold">{overtimeRecordModal.staff?.name}</span></p>
            <p className="text-sm text-blue-600 mb-2">Current OT Rate: ₹{overtimeRecordModal.staff?.overtimeRate || 0}/hr</p>
            {overtimeRecordModal.staff?.shiftSchedule?.fixedShift && (
              <p className="text-xs text-gray-500 mb-2">
                Shift ({formatTime12Hour(overtimeRecordModal.staff.shiftSchedule.fixedShift.startTime)} - {formatTime12Hour(overtimeRecordModal.staff.shiftSchedule.fixedShift.endTime)})
              </p>
            )}
            <p className="text-xs text-orange-600 mb-4">Overtime starts after shift end time</p>
            <div className="space-y-3">
              <input
                type="date"
                value={overtimeRecordModal.date}
                onChange={(e) => setOvertimeRecordModal({ ...overtimeRecordModal, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="time"
                value={overtimeRecordModal.startTime}
                onChange={(e) => setOvertimeRecordModal({ ...overtimeRecordModal, startTime: e.target.value })}
                placeholder="Start Time"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="time"
                value={overtimeRecordModal.endTime}
                onChange={(e) => setOvertimeRecordModal({ ...overtimeRecordModal, endTime: e.target.value })}
                placeholder="End Time"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                value={overtimeRecordModal.hours}
                onChange={(e) => setOvertimeRecordModal({ ...overtimeRecordModal, hours: e.target.value })}
                placeholder="Hours"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <textarea
                value={overtimeRecordModal.notes}
                onChange={(e) => setOvertimeRecordModal({ ...overtimeRecordModal, notes: e.target.value })}
                placeholder="Notes (optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="2"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setOvertimeRecordModal({ show: false, staff: null, date: '', startTime: '', endTime: '', hours: '', notes: '' })}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={addOvertimeRecord}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Overtime Modal */}
      {assignOvertimeModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 w-96 shadow-2xl border border-white/40">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Assign Overtime</h3>
            <p className="text-gray-600 mb-4">Staff: <span className="font-semibold">{assignOvertimeModal.staff?.name}</span></p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={assignOvertimeModal.date}
                  onChange={(e) => setAssignOvertimeModal({ ...assignOvertimeModal, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={assignOvertimeModal.startTime}
                  onChange={(e) => setAssignOvertimeModal({ ...assignOvertimeModal, startTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={assignOvertimeModal.endTime}
                  onChange={(e) => {
                    const newEndTime = e.target.value;
                    const calculatedHours = calculateHours(assignOvertimeModal.startTime, newEndTime);
                    setAssignOvertimeModal({ ...assignOvertimeModal, endTime: newEndTime, hours: calculatedHours });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                <input
                  type="text"
                  value={assignOvertimeModal.hours}
                  onChange={(e) => setAssignOvertimeModal({ ...assignOvertimeModal, hours: e.target.value })}
                  placeholder="Enter hours (e.g., 1:30)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <textarea
                  value={assignOvertimeModal.reason}
                  onChange={(e) => setAssignOvertimeModal({ ...assignOvertimeModal, reason: e.target.value })}
                  placeholder="Why is overtime needed?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  rows="2"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setAssignOvertimeModal({ show: false, staff: null, date: '', hours: '', reason: '' })}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={assignOvertimeRequest}
                className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Overtime Records Modal */}
      {viewRecordsModal.show && (() => {
        // Calculate total hours from all records
        const totalMinutes = viewRecordsModal.records.reduce((sum, record) => {
          // Handle both decimal hours (like 0.083) and time format (like "0:05")
          let hours = 0;
          if (typeof record.hours === 'string' && record.hours.includes(':')) {
            const [h, m] = record.hours.split(':').map(Number);
            hours = h + (m / 60);
          } else {
            hours = parseFloat(record.hours) || 0;
          }
          return sum + (hours * 60);
        }, 0);
        
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = Math.round(totalMinutes % 60);
        
        // Calculate total amount from completed records
        const totalAmount = viewRecordsModal.records
          .filter(record => record.status === 'completed' || record.status === 'accepted')
          .reduce((sum, record) => {
            const amount = parseFloat(record.amount) || 0;
            return sum + amount;
          }, 0);
        
        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 w-[600px] max-h-[80vh] overflow-y-auto shadow-2xl border border-white/40">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Overtime Records - {viewRecordsModal.staff?.name}</h3>
              <p className="text-sm text-blue-600 mb-4">Current OT Rate: ₹{viewRecordsModal.staff?.overtimeRate || 0}/hr</p>
              {viewRecordsModal.records.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No overtime records found</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {viewRecordsModal.records.map((record, idx) => (
                      <div key={idx} className="bg-white/50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-800">{new Date(record.date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600">{formatTime12Hour(record.startTime)} - {formatTime12Hour(record.endTime)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">₹{(parseFloat(record.amount) || 0).toFixed(2)}</p>
                            <p className="text-xs text-gray-500">
                              {typeof record.hours === 'string' && record.hours.includes(':') 
                                ? record.hours + 'h' 
                                : (parseFloat(record.hours) || 0).toFixed(2) + 'h'
                              } @ ₹{record.rate || 0}/h
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-xs text-gray-600 capitalize">Status: <span className={`font-semibold ${
                            record.status === 'completed' ? 'text-green-600' :
                            record.status === 'accepted' ? 'text-blue-600' :
                            record.status === 'pending' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>{record.status}</span></p>
                          {record.status === 'accepted' && recordTimers[record._id] === 'over' && (
                            <button
                              onClick={() => completeOvertimeRecord(record._id)}
                              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-bold"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                        {/* Show decline time calculation with rate */}
                        {record.status === 'declined' && record.createdAt && record.respondedAt && (
                          <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                            <p className="text-xs text-red-600">
                              ⏱️ Decline Duration: {' '}
                              <span className="font-medium">
                                {(() => {
                                  const assignedTime = new Date(record.createdAt);
                                  const declinedTime = new Date(record.respondedAt);
                                  const diffMs = declinedTime - assignedTime;
                                  const diffMinutes = Math.floor(diffMs / (1000 * 60));
                                  const diffHours = Math.floor(diffMinutes / 60);
                                  const remainingMinutes = diffMinutes % 60;
                                  
                                  if (diffHours > 0) {
                                    return `${diffHours}h ${remainingMinutes}m`;
                                  } else {
                                    return `${diffMinutes}m`;
                                  }
                                })()} 
                              </span>
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                              💰 Decline Rate Amount: {' '}
                              <span className="font-bold">
                                ₹{(() => {
                                  const assignedTime = new Date(record.createdAt);
                                  const declinedTime = new Date(record.respondedAt);
                                  const diffMs = declinedTime - assignedTime;
                                  const diffHours = diffMs / (1000 * 60 * 60); // Convert to hours
                                  const overtimeRate = viewRecordsModal.staff?.overtimeRate || 0;
                                  const declineAmount = diffHours * overtimeRate;
                                  return declineAmount.toFixed(2);
                                })()}
                              </span>
                              {' '}@ ₹{viewRecordsModal.staff?.overtimeRate || 0}/hr
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Declined at: {new Date(record.respondedAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {/* Show completion time calculation */}
                        {record.status === 'completed' && record.respondedAt && record.completedAt && (
                          <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                            <p className="text-xs text-green-600">
                              ⏱️ Work duration: {' '}
                              <span className="font-medium">
                                {(() => {
                                  const startTime = new Date(record.respondedAt);
                                  const endTime = new Date(record.completedAt);
                                  const diffMs = endTime - startTime;
                                  const diffMinutes = Math.floor(diffMs / (1000 * 60));
                                  const diffHours = Math.floor(diffMinutes / 60);
                                  const remainingMinutes = diffMinutes % 60;
                                  
                                  if (diffHours > 0) {
                                    return `${diffHours}h ${remainingMinutes}m`;
                                  } else {
                                    return `${diffMinutes}m`;
                                  }
                                })()} total work time
                              </span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Completed at: {new Date(record.completedAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 p-4 rounded-lg border border-orange-300 mb-4">
                    <h4 className="font-bold text-gray-800 mb-3">Total Overtime Summary</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Total Hours</p>
                        <p className="text-2xl font-bold text-orange-600">{totalHours}h {remainingMinutes}m</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Rate</p>
                        <p className="text-lg font-bold text-blue-600">₹{viewRecordsModal.staff?.overtimeRate || 0}/hr</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                        <p className="text-2xl font-bold text-green-600">₹{totalAmount.toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Decline Rate Amount</p>
                        <p className="text-lg font-bold text-red-600">
                          ₹{(() => {
                            const declinedRecords = viewRecordsModal.records.filter(r => 
                              r.status === 'declined' && r.createdAt && r.respondedAt
                            );
                            
                            if (declinedRecords.length === 0) return '0.00';
                            
                            const totalDeclineAmount = declinedRecords.reduce((sum, record) => {
                              const assignedTime = new Date(record.createdAt);
                              const declinedTime = new Date(record.respondedAt);
                              const diffMs = declinedTime - assignedTime;
                              const diffHours = diffMs / (1000 * 60 * 60); // Convert to hours
                              const overtimeRate = viewRecordsModal.staff?.overtimeRate || 0;
                              const declineAmount = diffHours * overtimeRate;
                              return sum + declineAmount;
                            }, 0);
                            
                            return totalDeclineAmount.toFixed(2);
                          })()} 
                        </p>
                        <p className="text-xs text-gray-500">
                          {viewRecordsModal.records.filter(r => r.status === 'declined').length} declined
                        </p>
                      </div>
                    </div>
                    {/* Decline Rate Analysis */}
                    {(() => {
                      const declinedRecords = viewRecordsModal.records.filter(r => 
                        r.status === 'declined' && r.createdAt && r.respondedAt
                      );
                      
                      if (declinedRecords.length > 0) {
                        const overtimeRate = viewRecordsModal.staff?.overtimeRate || 0;
                        
                        const declineData = declinedRecords.map(record => {
                          const assignedTime = new Date(record.createdAt);
                          const declinedTime = new Date(record.respondedAt);
                          const diffMs = declinedTime - assignedTime;
                          const diffHours = diffMs / (1000 * 60 * 60);
                          const amount = diffHours * overtimeRate;
                          return { minutes: Math.floor(diffMs / (1000 * 60)), amount };
                        });
                        
                        const fastDeclines = declineData.filter(d => d.minutes <= 5);
                        const mediumDeclines = declineData.filter(d => d.minutes > 5 && d.minutes <= 30);
                        const slowDeclines = declineData.filter(d => d.minutes > 30);
                        
                        const fastAmount = fastDeclines.reduce((sum, d) => sum + d.amount, 0);
                        const mediumAmount = mediumDeclines.reduce((sum, d) => sum + d.amount, 0);
                        const slowAmount = slowDeclines.reduce((sum, d) => sum + d.amount, 0);
                        
                        return (
                          <div className="mt-3 pt-3 border-t border-orange-300">
                            <p className="text-xs font-medium text-gray-700 mb-2">Decline Rate Breakdown:</p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="text-center bg-red-100 p-2 rounded">
                                <p className="font-bold text-red-600">₹{fastAmount.toFixed(2)}</p>
                                <p className="text-gray-600">Fast (≤ 5m)</p>
                                <p className="text-gray-500">{fastDeclines.length} declines</p>
                              </div>
                              <div className="text-center bg-yellow-100 p-2 rounded">
                                <p className="font-bold text-yellow-600">₹{mediumAmount.toFixed(2)}</p>
                                <p className="text-gray-600">Medium (5-30m)</p>
                                <p className="text-gray-500">{mediumDeclines.length} declines</p>
                              </div>
                              <div className="text-center bg-orange-100 p-2 rounded">
                                <p className="font-bold text-orange-600">₹{slowAmount.toFixed(2)}</p>
                                <p className="text-gray-600">Slow (>30m)</p>
                                <p className="text-gray-500">{slowDeclines.length} declines</p>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()
                    }
                  </div>
                </>
              )}
              <button
                onClick={() => setViewRecordsModal({ show: false, staff: null, records: [] })}
                className="w-full mt-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default StaffList;
