import React, { useState, useEffect, useRef } from 'react';
import { FiClock, FiCalendar, FiAlertCircle, FiRefreshCw, FiX } from 'react-icons/fi';

const StaffDashboard = () => {
  const [overtimeRequests, setOvertimeRequests] = useState([]);
  const [overtimeRate, setOvertimeRate] = useState(0);
  const [salary, setSalary] = useState({ type: 'fixed', amount: 0 });
  const [loading, setLoading] = useState(true);
  const [timeStatus, setTimeStatus] = useState({});
  const [userRole, setUserRole] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStaffName, setFilterStaffName] = useState('');
  const [customHours, setCustomHours] = useState({});
  const [actualWorkedTime, setActualWorkedTime] = useState({});
  const requestsRef = useRef([]);
  const completedTimers = useRef(new Set());

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role);
    fetchOvertimeRequests();
  }, []);

  useEffect(() => {
    requestsRef.current = overtimeRequests;
  }, [overtimeRequests]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStatus(prevStatus => {
        const newStatus = { ...prevStatus };
        requestsRef.current.forEach(request => {
          const requestId = request._id;
          if (completedTimers.current.has(requestId)) {
            newStatus[requestId] = 'over';
            return;
          }
          if (request.status === 'accepted' && request.respondedAt) {
            try {
              const startTime = new Date(request.respondedAt);
              const now = new Date();
              let diff = Math.floor((now - startTime) / 1000);
              const hoursStr = request.hours;
              const [h, m] = hoursStr.split(':').map(Number);
              const maxSeconds = (h * 3600) + (m * 60);
              
              if (diff >= maxSeconds) {
                newStatus[requestId] = 'over';
                completedTimers.current.add(requestId);
              } else {
                const hrs = Math.floor(diff / 3600);
                const mins = Math.floor((diff % 3600) / 60);
                const secs = diff % 60;
                newStatus[requestId] = `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                const decimalHours = diff / 3600;
                setActualWorkedTime(prev => ({ ...prev, [requestId]: decimalHours }));
              }
            } catch (e) {
              newStatus[requestId] = '0:00:00';
            }
          }
        });
        return newStatus;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchOvertimeRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/staff/my-overtime`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Overtime data:', data);
        const requests = data.overtimeRequests || [];
        requests.forEach(req => {
          if (req.status === 'completed') {
            completedTimers.current.add(req._id);
          }
        });
        setOvertimeRequests(requests);
        setOvertimeRate(data.overtimeRate || 0);
        setSalary({
          type: data.salaryType,
          amount: data.salaryType === 'fixed' ? data.salaryAmount : (data.salaryType === 'hourly' ? data.hourlyRate : data.dayRate)
        });
      } else {
        console.error('Response not ok:', response.status);
      }
    } catch (error) {
      console.error('Error fetching overtime requests:', error);
    }
    setLoading(false);
  };

  const formatTime12Hour = (time24) => {
    if (!time24) return '';
    const [hours, mins] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${mins} ${ampm}`;
  };

  const formatDecimalToTime = (hours) => {
    if (typeof hours === 'string') {
      return hours;
    }
    const totalSeconds = Math.round(hours * 3600);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatElapsedTime = (timeStr) => {
    if (!timeStr && timeStr !== 0) return '00:00:00';
    
    // If it's a number (decimal hours)
    if (typeof timeStr === 'number') {
      const totalSeconds = Math.round(timeStr * 3600);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    
    // If it's a string
    if (typeof timeStr === 'string') {
      const parts = timeStr.split(':');
      if (parts.length === 2) {
        const h = parseInt(parts[0]) || 0;
        const m = parseInt(parts[1]) || 0;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
      }
      if (parts.length === 3) {
        return `${String(parseInt(parts[0])).padStart(2, '0')}:${String(parseInt(parts[1])).padStart(2, '0')}:${String(parseInt(parts[2])).padStart(2, '0')}`;
      }
    }
    return '00:00:00';
  };

  const respondToOvertime = async (requestId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/staff/overtime/${requestId}/respond`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, respondedAt: new Date().toISOString() })
      });
      
      if (response.ok) {
        alert(`Overtime ${status} successfully!`);
        fetchOvertimeRequests();
      }
    } catch (error) {
      console.error('Error responding to overtime:', error);
    }
  };

  const declineOvertime = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const actualHours = actualWorkedTime[requestId] || 0;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/staff/overtime/${requestId}/respond`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'declined', actualHoursWorked: actualHours })
      });
      
      if (response.ok) {
        alert('Overtime declined!');
        setActualWorkedTime({ ...actualWorkedTime, [requestId]: 0 });
        completedTimers.current.delete(requestId);
        fetchOvertimeRequests();
      }
    } catch (error) {
      console.error('Error declining overtime:', error);
    }
  };

  const completeOvertime = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const actualHours = actualWorkedTime[requestId] || 0;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/staff/overtime/${requestId}/complete`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'completed', actualHoursWorked: actualHours })
      });
      
      if (response.ok) {
        alert('Overtime marked as completed!');
        setActualWorkedTime({ ...actualWorkedTime, [requestId]: 0 });
        completedTimers.current.add(requestId);
        setTimeStatus(prev => ({ ...prev, [requestId]: 'over' }));
        fetchOvertimeRequests();
      }
    } catch (error) {
      console.error('Error completing overtime:', error);
    }
  };

  const stopOvertimeTimer = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/staff/overtime/${requestId}/stop`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Overtime stopped! Actual hours worked: ${data.actualHoursWorked}`);
        setActualWorkedTime({ ...actualWorkedTime, [requestId]: 0 });
        fetchOvertimeRequests();
      }
    } catch (error) {
      console.error('Error stopping overtime timer:', error);
    }
  };

  const updateCustomHours = async (requestId, hoursValue) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/staff/overtime/${requestId}/update-hours`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hours: hoursValue })
      });
      
      if (response.ok) {
        alert('Hours updated successfully!');
        setCustomHours({ ...customHours, [requestId]: '' });
        fetchOvertimeRequests();
      }
    } catch (error) {
      console.error('Error updating hours:', error);
    }
  };

  const getFilteredOvertimes = () => {
    let filtered = overtimeRequests;
    
    if (userRole === 'RESTAURANT_ADMIN') {
      if (filterDate) {
        filtered = filtered.filter(req => {
          const reqDate = new Date(req.date).toISOString().split('T')[0];
          return reqDate === filterDate;
        });
      }
      if (filterStaffName) {
        filtered = filtered.filter(req => 
          req.staffName.toLowerCase().includes(filterStaffName.toLowerCase())
        );
      }
    }
    return filtered;
  };

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  const filteredData = getFilteredOvertimes();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">My Overtime Assignments</h2>
        <button
          onClick={fetchOvertimeRequests}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center gap-2 transition-all border border-white/40"
        >
          <FiRefreshCw size={18} /> Refresh
        </button>
      </div>
      
      {userRole !== 'RESTAURANT_ADMIN' && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 border border-white/40">
            <p className="text-xs text-gray-300 mb-1">Monthly Salary</p>
            <p className="text-xl font-bold text-white">₹{salary.amount}</p>
            <p className="text-xs text-gray-400 mt-1">({salary.type})</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 border border-white/40">
            <p className="text-xs text-gray-300 mb-1">Overtime Rate</p>
            <p className="text-xl font-bold text-yellow-300">₹{overtimeRate}/hr</p>
          </div>
        </div>
      )}

      {userRole === 'RESTAURANT_ADMIN' && (
        <div className="mb-6 flex gap-4 items-end flex-wrap">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Filter by Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/20 border border-white/40 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Filter by Staff Name</label>
            <input
              type="text"
              placeholder="Search staff name..."
              value={filterStaffName}
              onChange={(e) => setFilterStaffName(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/20 border border-white/40 text-white placeholder-gray-400"
            />
          </div>
          {(filterDate || filterStaffName) && (
            <button
              onClick={() => {
                setFilterDate('');
                setFilterStaffName('');
              }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm flex items-center gap-2"
            >
              <FiX size={16} /> Clear
            </button>
          )}
        </div>
      )}
      
      {filteredData.length === 0 ? (
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-8 text-center">
          <FiAlertCircle className="text-4xl mx-auto mb-4 text-gray-300" />
          <p className="text-gray-300">No overtime assignments</p>
        </div>
      ) : (
        <div className="bg-white/20 backdrop-blur-md rounded-xl border border-white/40 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/40 bg-white/10">
                {userRole === 'RESTAURANT_ADMIN' && (
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Staff Name</th>
                )}
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Time</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Hours</th>
                {userRole === 'RESTAURANT_ADMIN' && (
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Amount</th>
                )}
                {userRole !== 'RESTAURANT_ADMIN' && (
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Reason</th>
                )}
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Result</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((request) => (
                <tr key={request._id} className="border-b border-white/20 hover:bg-white/10 transition">
                  {userRole === 'RESTAURANT_ADMIN' && (
                    <td className="px-6 py-4 text-sm text-white">{request.staffName}</td>
                  )}
                  <td className="px-6 py-4 text-sm text-white">{new Date(request.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-white">{formatTime12Hour(request.startTime)} - {formatTime12Hour(request.endTime)}</td>
                  <td className="px-6 py-4 text-sm text-white">{formatDecimalToTime(request.hours)}</td>
                  {userRole === 'RESTAURANT_ADMIN' && (
                    <td className="px-6 py-4 text-sm text-white font-semibold">₹{request.amount || 0}</td>
                  )}
                  {userRole !== 'RESTAURANT_ADMIN' && (
                    <td className="px-6 py-4 text-sm text-gray-300">{request.reason || '-'}</td>
                  )}
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      request.status === 'pending' ? 'bg-yellow-500/30 text-yellow-300' :
                      request.status === 'accepted' ? 'bg-green-500/30 text-green-300' :
                      'bg-red-500/30 text-red-300'
                    }`}>
                      {request.status === 'accepted' ? '✓ Accepted' : request.status === 'declined' ? '✗ Declined' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {userRole === 'RESTAURANT_ADMIN' && request.status === 'completed' && (
                      <span className="text-xs font-semibold text-green-300">✓ Complete {request.completedAt && new Date(request.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
                    )}
                    {userRole === 'RESTAURANT_ADMIN' && request.status === 'declined' && (
                      <span className="text-xs font-semibold text-red-300">✗ Decline {formatElapsedTime(request.actualHoursWorked)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {userRole === 'RESTAURANT_ADMIN' && request.status === 'accepted' && (
                      <div className="flex gap-2 items-center justify-center flex-wrap">
                        {timeStatus[request._id] === 'over' ? (
                          <button
                            onClick={() => completeOvertime(request._id)}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-bold whitespace-nowrap"
                          >
                            Complete
                          </button>
                        ) : (
                          <>
                            <span className="text-xs font-semibold text-green-300 whitespace-nowrap">
                              {timeStatus[request._id] || '0:00:00'}
                            </span>
                            <button
                              onClick={() => completeOvertime(request._id)}
                              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-bold whitespace-nowrap"
                            >
                              Complete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    {userRole !== 'RESTAURANT_ADMIN' && (
                      <>
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => respondToOvertime(request._id, 'accepted')}
                              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => respondToOvertime(request._id, 'declined')}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                        {request.status === 'accepted' && (
                          <div className="flex items-center gap-2">
                            {timeStatus[request._id] === 'over' ? (
                              <button
                                onClick={() => completeOvertime(request._id)}
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-bold"
                              >
                                Complete
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold text-green-300 whitespace-nowrap">
                                  Running: {timeStatus[request._id] || '0:00:00'}
                                </span>
                                <button
                                  onClick={() => declineOvertime(request._id)}
                                  className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold whitespace-nowrap"
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
