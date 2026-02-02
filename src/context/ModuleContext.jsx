import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ModuleContext = createContext();

export const useModules = () => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useModules must be used within ModuleProvider');
  }
  return context;
};

export const ModuleProvider = ({ children }) => {
  const [modules, setModules] = useState({
    inventory: { enabled: true },
    orderTaking: { enabled: true },
    kot: { enabled: true }
  });
  const [loading, setLoading] = useState(true);

  const fetchModuleConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/modules/config`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setModules(response.data.modules);
      }
    } catch (error) {
      console.error('Failed to fetch module config:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateModule = async (moduleName, enabled) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/modules/config`,
        { moduleName, enabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setModules(response.data.modules);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update module:', error);
      return false;
    }
  };

  const isModuleEnabled = (moduleName) => {
    return modules[moduleName]?.enabled ?? true;
  };

  useEffect(() => {
    fetchModuleConfig();
  }, []);

  return (
    <ModuleContext.Provider value={{ 
      modules, 
      loading, 
      isModuleEnabled, 
      updateModule,
      refreshModules: fetchModuleConfig 
    }}>
      {children}
    </ModuleContext.Provider>
  );
};
