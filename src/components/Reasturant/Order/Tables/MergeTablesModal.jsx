import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiLink, FiUsers, FiCheck } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MergeTablesModal = ({ primaryTable, onClose, onSuccess }) => {
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailableTables();
  }, []);

  const fetchAvailableTables = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/table/tables`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const filteredTables = response.data.tables.filter(table => 
        table._id !== primaryTable._id && 
        ['AVAILABLE', 'OCCUPIED'].includes(table.status)
      );
      setAvailableTables(filteredTables);
    } catch (error) {
      console.error('Fetch tables error:', error);
    }
  };

  const handleTableSelection = (table) => {
    setSelectedTables(prev => {
      const isSelected = prev.find(t => t._id === table._id);
      if (isSelected) {
        return prev.filter(t => t._id !== table._id);
      } else {
        return [...prev, table];
      }
    });
  };

  const handleMergeTables = async () => {
    if (selectedTables.length === 0) {
      setError('Please select at least one table to merge with');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/table/tables/merge`,
        { 
          primaryTableId: primaryTable._id,
          tableIds: selectedTables.map(t => t._id)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to merge tables');
    } finally {
      setLoading(false);
    }
  };

  const totalCapacity = selectedTables.reduce((sum, table) => sum + table.capacity, primaryTable.capacity);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FiLink className="text-blue-500" />
            Merge Tables - Table {primaryTable.tableNumber}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-700 text-sm">
              <strong>Merge Tables:</strong> Select tables to merge with Table {primaryTable.tableNumber}. 
              All selected tables will be combined into one larger table.
            </p>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg mb-3">
              <span className="font-medium text-blue-700">Primary Table:</span>
              <div className="flex items-center gap-2">
                <span className="text-blue-800 font-bold">Table {primaryTable.tableNumber}</span>
                <span className="text-xs bg-blue-200 px-2 py-1 rounded">
                  <FiUsers className="inline mr-1" size={12} />
                  {primaryTable.capacity}
                </span>
              </div>
            </div>

            {selectedTables.length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg mb-3">
                <span className="font-medium text-green-700">Selected for Merge:</span>
                <div className="mt-2 space-y-1">
                  {selectedTables.map(table => (
                    <div key={table._id} className="flex items-center justify-between text-sm">
                      <span className="text-green-800">Table {table.tableNumber}</span>
                      <span className="text-xs bg-green-200 px-2 py-1 rounded">
                        <FiUsers className="inline mr-1" size={12} />
                        {table.capacity}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-green-200">
                  <span className="text-sm font-medium text-green-800">
                    Total Capacity: {totalCapacity} people
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto">
            <h4 className="font-medium text-gray-700 mb-3">Available Tables to Merge:</h4>
            <div className="grid grid-cols-2 gap-2">
              {availableTables.map(table => {
                const isSelected = selectedTables.find(t => t._id === table._id);
                return (
                  <button
                    key={table._id}
                    onClick={() => handleTableSelection(table)}
                    className={`p-3 rounded-lg border-2 transition-all text-left relative ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <FiCheck className="text-blue-600" size={16} />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Table {table.tableNumber}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        table.status === 'AVAILABLE' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {table.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                      <span><FiUsers className="inline mr-1" />{table.capacity}</span>
                      <span>{table.location}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            {availableTables.length === 0 && (
              <p className="text-gray-500 text-center py-4">No tables available for merging</p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleMergeTables}
            disabled={loading || selectedTables.length === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Merge ${selectedTables.length + 1} Tables`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MergeTablesModal;