import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ModuleProvider } from './context/ModuleContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ModuleProvider>
    <App />
  </ModuleProvider>
);