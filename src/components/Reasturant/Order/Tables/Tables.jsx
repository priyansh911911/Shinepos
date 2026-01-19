import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiCalendar } from 'react-icons/fi';
import TableList from './TableList';
import AddTable from './AddTable';
import BookingList from './BookingList';
import AddBooking from './AddBooking';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tables');
  const [showAddTable, setShowAddTable] = useState(false);
  const [showAddBooking, setShowAddBooking] = useState(false);

  useEffect(() => {
    fetchTables();
    fetchBookings();
  }, []);

  const fetchTables = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/tables/tables`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTables(response.data.tables);
    } catch (error) {
      console.error('Fetch tables error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/tables/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Fetch bookings error:', error);
    }
  };

  const handleAddTable = async (tableData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/tables/tables`, tableData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTables(prev => [...prev, response.data.table]);
      setShowAddTable(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to add table' };
    }
  };

  const handleUpdateTableStatus = async (tableId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/api/tables/tables/${tableId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTables(prev => prev.map(table => 
        table._id === tableId ? { ...table, status } : table
      ));
    } catch (error) {
      console.error('Update table status error:', error);
    }
  };

  const handleAddBooking = async (bookingData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/tables/bookings`, bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(prev => [...prev, response.data.booking]);
      setShowAddBooking(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to add booking' };
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Table Management</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'tables' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Tables
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === 'bookings' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            <FiCalendar />
            <span>Bookings</span>
          </button>
        </div>
      </div>

      {activeTab === 'tables' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowAddTable(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2"
            >
              <FiPlus />
              <span>Add Table</span>
            </button>
          </div>
          <TableList tables={tables} onUpdateStatus={handleUpdateTableStatus} />
        </div>
      )}

      {activeTab === 'bookings' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowAddBooking(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2"
            >
              <FiPlus />
              <span>Add Booking</span>
            </button>
          </div>
          <BookingList bookings={bookings} />
        </div>
      )}

      {showAddTable && (
        <AddTable
          onAdd={handleAddTable}
          onClose={() => setShowAddTable(false)}
        />
      )}

      {showAddBooking && (
        <AddBooking
          tables={tables}
          onAdd={handleAddBooking}
          onClose={() => setShowAddBooking(false)}
        />
      )}
    </div>
  );
};

export default Tables;