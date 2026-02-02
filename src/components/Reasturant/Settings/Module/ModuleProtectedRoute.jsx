import React from 'react';
import { Navigate } from 'react-router-dom';
import { useModules } from '../../../../context/ModuleContext';

const ModuleProtectedRoute = ({ children, module, redirectTo = '/dashboard' }) => {
  const { isModuleEnabled, loading } = useModules();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isModuleEnabled(module)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Module Disabled</h2>
          <p className="text-gray-600 mb-6">
            The {module} module has been disabled by the restaurant owner.
          </p>
          <button
            onClick={() => window.location.href = redirectTo}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ModuleProtectedRoute;
