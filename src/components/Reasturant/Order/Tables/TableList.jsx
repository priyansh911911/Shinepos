import React, { useState } from 'react';
import { FiLink, FiCheckCircle, FiXCircle, FiAlertCircle, FiTool, FiUsers, FiMapPin, FiEdit2 } from 'react-icons/fi';
import TransferAndMergeModal from './TransferAndMergeModal';
import MergeTablesModal from './MergeTablesModal';

const TableList = ({ tables, onUpdateStatus, onEdit }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showTransferMergeModal, setShowTransferMergeModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  const statuses = [
    { value: 'AVAILABLE', label: 'Available', icon: <FiCheckCircle /> },
    { value: 'OCCUPIED', label: 'Occupied', icon: <FiXCircle /> },
    { value: 'RESERVED', label: 'Reserved', icon: <FiAlertCircle /> },
    { value: 'MAINTENANCE', label: 'Maintenance', icon: <FiTool /> }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-500';
      case 'OCCUPIED': return 'bg-red-500';
      case 'RESERVED': return 'bg-yellow-500';
      case 'MAINTENANCE': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'AVAILABLE': return <FiCheckCircle />;
      case 'OCCUPIED': return <FiXCircle />;
      case 'RESERVED': return <FiAlertCircle />;
      case 'MAINTENANCE': return <FiTool />;
      default: return <FiAlertCircle />;
    }
  };

  return (
    <div className="flex flex-wrap gap-4 p-4 items-start">
      {tables.map((table) => (
        <div 
          key={table._id} 
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)] xl:w-[calc(25%-0.75rem)]"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-2xl font-bold text-white">{table.tableNumber}</h3>
            <span className={`${getStatusColor(table.status)} px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1`}>
              {getStatusIcon(table.status)}
              {table.status}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <FiUsers size={16} />
              <span>Capacity: {table.capacity}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <FiMapPin size={16} />
              <span>Location: {table.location}</span>
            </div>
            {table.mergedWith && table.mergedWith.length > 0 && (
              <div className="bg-purple-500/20 rounded-lg p-2 border border-purple-400/30">
                <div className="flex items-center gap-1 text-xs font-bold text-purple-300 mb-1">
                  <FiLink size={12} />
                  Merged with:
                </div>
                <div className="text-xs text-purple-200">
                  {table.mergedWith.map(id => {
                    const mergedTable = tables.find(t => t._id === id);
                    return mergedTable?.tableNumber;
                  }).filter(Boolean).join(', ')}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setOpenDropdown(openDropdown === table._id ? null : table._id)}
              className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium text-white transition-colors"
            >
              Change Status
            </button>
            <button
              onClick={() => {
                setSelectedTable(table);
                setShowMergeModal(true);
              }}
              className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
            >
              <FiLink size={16} className="text-blue-300" />
            </button>
            <button
              onClick={() => onEdit(table)}
              className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors"
            >
              <FiEdit2 size={16} className="text-purple-300" />
            </button>
          </div>

          {openDropdown === table._id && (
            <div className="mt-3 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 overflow-hidden">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  onClick={() => {
                    onUpdateStatus(table._id, status.value);
                    setOpenDropdown(null);
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-white hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  {status.icon}
                  {status.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      
      {showTransferMergeModal && selectedTable && (
        <TransferAndMergeModal
          brokenTable={selectedTable}
          onClose={() => {
            setShowTransferMergeModal(false);
            setSelectedTable(null);
          }}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
      
      {showMergeModal && selectedTable && (
        <MergeTablesModal
          primaryTable={selectedTable}
          onClose={() => {
            setShowMergeModal(false);
            setSelectedTable(null);
          }}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default TableList;
