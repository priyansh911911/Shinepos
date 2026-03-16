import React, { useState, useEffect } from 'react';
import { FiBell, FiX } from 'react-icons/fi';

const OvertimeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [seenIds, setSeenIds] = useState(new Set());

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/staff/overtime-responses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          data.responses?.forEach(resp => {
            const id = `${resp.staffId}-${resp.respondedAt}`;
            if (!seenIds.has(id)) {
              const notification = {
                id,
                staffName: resp.staffName,
                status: resp.status,
                date: new Date(resp.date).toLocaleDateString(),
                time: `${resp.startTime} - ${resp.endTime}`,
                hours: resp.hours
              };
              
              setNotifications(prev => [notification, ...prev]);
              setSeenIds(prev => new Set([...prev, id]));
              
              setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
              }, 5000);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching overtime responses:', error);
      }
    };

    const interval = setInterval(fetchResponses, 3000);
    fetchResponses();
    return () => clearInterval(interval);
  }, [seenIds]);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notif => (
        <div
          key={notif.id}
          className={`bg-white/90 backdrop-blur-md rounded-lg p-4 shadow-lg border-l-4 border-green-500`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <FiBell className="text-green-500" />
              <div>
                <p className="font-semibold text-gray-800">{notif.staffName}</p>
                <p className="text-sm text-gray-600">
                  ✓ Accepted overtime
                </p>
                <p className="text-xs text-gray-500 mt-1">{notif.date} • {notif.time}</p>
                <p className="text-xs text-gray-500">{notif.hours} hours</p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OvertimeNotifications;
