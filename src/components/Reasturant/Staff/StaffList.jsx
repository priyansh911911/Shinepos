import React, { useState, useEffect } from 'react';
import { FiAward, FiBarChart2, FiDollarSign, FiUsers, FiUser, FiMail, FiPhone, FiCalendar, FiEdit2, FiTrash2, FiPlus, FiLoader, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const StaffList = ({ onAdd, onEdit }) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
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
        {staff.map((member, index) => (
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
                <span className="text-white font-medium">₹{member.hourlyRate || 0}/hr</span>
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
                className="flex-1 px-4 py-2 bg-white/30 backdrop-blur-md hover:bg-white/40 text-white rounded-lg text-sm font-medium transition-all border border-white/40 flex items-center justify-center gap-2"
              >
                <FiEdit2 /> Edit
              </button>
              <button
                onClick={() => deleteStaff(member._id)}
                className="flex-1 px-4 py-2 bg-red-500/80 backdrop-blur-md hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                <FiTrash2 /> Delete
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
    </div>
  );
};

export default StaffList;
