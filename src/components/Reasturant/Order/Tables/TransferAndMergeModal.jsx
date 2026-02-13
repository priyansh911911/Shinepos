import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiAlertTriangle, FiArrowRight, FiLink, FiUsers } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TransferAndMergeModal = ({ brokenTable, onClose, onSuccess, mode = 'transfer' }) => {
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [replacementOptions, setReplacementOptions] = useState([]);
  const [selectedReplacement, setSelectedReplacement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(mode);
  const [showReplacementOptions, setShowReplacementOptions] = useState(false);

  useEffect(() => {
    fetchAvailableTables();
    if (brokenTable.status === 'MAINTENANCE') {
      checkReplacementOptions();
    }
  }, []);

  const fetchAvailableTables = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/table/tables`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const filteredTables = response.data.tables.filter(table => 
        table._id !== brokenTable._id && 
        (activeTab === 'merge' ? ['AVAILABLE', 'OCCUPIED'].includes(table.status) : table.status === 'AVAILABLE')
      );
      setAvailableTables(filteredTables);
    } catch (error) {
      console.error('Fetch tables error:', error);
    }
  };

  const checkReplacementOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/table/tables/replacement-options/${brokenTable._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.replacementOptions?.length > 0) {
        setReplacementOptions(response.data.replacementOptions.map(option => ({
          _id: option.id,
          tableNumber: option.number,
          capacity: option.capacity,
          location: option.location,
          status: 'AVAILABLE'
        })));
        setShowReplacementOptions(true);
        setActiveTab('replacement');
      }
    } catch (error) {
      console.error('Fetch replacement options error:', error);
    }
  };

  useEffect(() => {
    fetchAvailableTables();
  }, [activeTab]);

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

  const handleTransferAndMerge = async () => {
    if (activeTab === 'replacement' && !selectedReplacement) {
      setError('Please select a replacement table');
      return;
    }
    
    if (activeTab === 'transfer' && availableTables.length === 0) {
      setError('No available tables for transfer');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const replacementTableId = activeTab === 'replacement' 
        ? selectedReplacement._id 
        : availableTables[0]._id;
      
      const payload = {
        brokenTableId: brokenTable._id,
        replacementTableId
      };
      
      await axios.post(
        `${API_BASE_URL}/api/table/tables/transfer-and-merge`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to transfer and merge');
    } finally {
      setLoading(false);
    }
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
          primaryTableId: brokenTable._id,
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

  const totalCapacity = selectedTables.reduce((sum, table) => sum + table.capacity, brokenTable.capacity);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {activeTab === 'replacement' ? <FiAlertTriangle className="text-orange-500" /> :
             activeTab === 'transfer' ? <FiAlertTriangle className="text-red-500" /> : <FiLink className="text-blue-500" />}
            {activeTab === 'replacement' ? 'Replacement Options' :
             activeTab === 'transfer' ? 'Transfer & Merge' : 'Merge Tables'} - Table {brokenTable.tableNumber}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          {showReplacementOptions && (
            <button
              onClick={() => setActiveTab('replacement')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'replacement' 
                  ? 'bg-white text-orange-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Replacement Options
            </button>
          )}
          <button
            onClick={() => setActiveTab('transfer')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'transfer' 
                ? 'bg-white text-red-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Auto Transfer & Merge
          </button>
          <button
            onClick={() => setActiveTab('merge')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'merge' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Manual Merge
          </button>
        </div>

        {activeTab === 'replacement' ? (
          <div className="mb-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <p className="text-orange-700 text-sm">
                <strong>Replacement Available:</strong> Table {brokenTable.tableNumber} is part of a merged group. 
                Select a replacement table to transfer orders and maintain service.
              </p>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Broken Table:</span>
                <span className="text-red-600 font-bold">Table {brokenTable.tableNumber}</span>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto">
              <h4 className="font-medium text-gray-700 mb-3">Available Replacement Tables:</h4>
              <div className="grid grid-cols-1 gap-2">
                {replacementOptions.map(table => (
                  <button
                    key={table._id}
                    onClick={() => setSelectedReplacement(table)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedReplacement?._id === table._id
                        ? 'border-orange-500 bg-orange-50 text-orange-700' 
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Table {table.tableNumber}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                          <FiUsers className="inline mr-1" size={12} />
                          {table.capacity}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          table.status === 'AVAILABLE' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                        }`}>
                          {table.status}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'transfer' ? (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 text-sm">
                <strong>Warning:</strong> This will automatically transfer all orders from Table {brokenTable.tableNumber} 
                and merge them with orders from other available tables.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Source Table:</span>
                <span className="text-red-600 font-bold">Table {brokenTable.tableNumber}</span>
              </div>
              
              <div className="flex items-center justify-center text-gray-400">
                <FiArrowRight size={24} />
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-700">Available Tables for Transfer:</span>
                <div className="mt-2 text-sm text-green-600">
                  {availableTables.length > 0 ? (
                    availableTables.map(table => `Table ${table.tableNumber}`).join(', ')
                  ) : (
                    'No available tables found'
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-700 text-sm">
                <strong>Merge Tables:</strong> Select tables to merge with Table {brokenTable.tableNumber}. 
                All selected tables will be combined into one larger table.
              </p>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg mb-3">
                <span className="font-medium text-blue-700">Primary Table:</span>
                <div className="flex items-center gap-2">
                  <span className="text-blue-800 font-bold">Table {brokenTable.tableNumber}</span>
                  <span className="text-xs bg-blue-200 px-2 py-1 rounded">
                    <FiUsers className="inline mr-1" size={12} />
                    {brokenTable.capacity}
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
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300 text-gray-700'
                      }`}
                    >
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
        )}

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
            onClick={activeTab === 'merge' ? handleMergeTables : handleTransferAndMerge}
            disabled={loading || 
              (activeTab === 'merge' && selectedTables.length === 0) ||
              (activeTab === 'replacement' && !selectedReplacement) ||
              (activeTab === 'transfer' && availableTables.length === 0)
            }
            className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
              activeTab === 'replacement'
                ? 'bg-orange-600 hover:bg-orange-700'
                : activeTab === 'transfer' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Processing...' : 
              activeTab === 'replacement' ? 'Transfer to Replacement' :
              activeTab === 'transfer' ? 'Transfer & Merge' : `Merge ${selectedTables.length + 1} Tables`
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferAndMergeModal;
