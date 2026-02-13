import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ModuleProvider } from './context/ModuleContext';
import axios from 'axios';

// Global axios interceptor to handle invalid tokens
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/restaurant-login' && 
          window.location.pathname !== '/admin-login' && 
          window.location.pathname !== '/login') {
        window.location.href = '/restaurant-login';
      }
    }
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ModuleProvider>
    <App />
  </ModuleProvider>
);
