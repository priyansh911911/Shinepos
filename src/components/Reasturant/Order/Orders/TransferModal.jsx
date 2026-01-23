import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiArrowRight, FiCheck } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TransferModal = ({ order, onClose, onSuccess }) => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailableTables();
  }, []);

  const fetchAvailableTables = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/table/available/table`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTables(response.data.tables);
    } catch (error) {
      console.error('Fetch tables error:', error);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/table/transfer`,
        { orderId: order._id, newTableId: selectedTable },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to transfer table');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-gray-900">Transfer Order to New Table</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 transition-colors">
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-white/40 backdrop-blur-md rounded-xl border border-white/30">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-700">Order Number</p>
                <p className="font-semibold text-gray-900">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-700">Current Table</p>
                <p className="font-semibold text-gray-900">{order.tableNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-700">Customer</p>
                <p className="font-semibold text-gray-900">{order.customerName}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center text-gray-700 mb-4">
            <FiArrowRight size={24} />
            <span className="ml-2 text-sm font-medium">Select New Table</span>
          </div>

          {tables.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No available tables found
            </div>
          ) : (
            <form onSubmit={handleTransfer}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {tables.map((table) => (
                  <div
                    key={table._id}
                    onClick={() => setSelectedTable(table._id)}
                    className={`relative p-4 rounded-xl cursor-pointer transition-all ${
                      selectedTable === table._id
                        ? 'bg-white/60 backdrop-blur-lg shadow-lg border-2 border-purple-500'
                        : 'bg-white/30 backdrop-blur-md hover:bg-white/40 border-2 border-white/30'
                    }`}
                  >
                    {selectedTable === table._id && (
                      <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-1">
                        <FiCheck size={14} />
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {table.tableNumber}
                      </div>
                      <div className="text-xs text-gray-700 mb-1">
                        {table.location}
                      </div>
                      <div className="text-xs text-gray-600">
                        Capacity: {table.capacity}
                      </div>
                      <div className="mt-2">
                        <span className="px-2 py-1 bg-green-500/80 text-white rounded-full text-xs font-medium">
                          Available
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="bg-red-500/80 backdrop-blur-md text-white p-3 rounded-xl text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-white/30 backdrop-blur-md border border-white/30 rounded-xl hover:bg-white/40 text-gray-900 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedTable}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
                >
                  {loading ? 'Transferring...' : 'Transfer to Selected Table'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferModal;
