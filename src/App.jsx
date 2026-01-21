import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SuperAdminLogin from './pages/SuperAdminLogin';
import RestaurantLogin from './pages/RestaurantLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import RestaurantDashboard from './pages/RestaurantDashboard';
import EditRestaurant from './components/superadmin/Addreasturant/EditRestaurantInline';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<SuperAdminLogin />} />
          <Route path="/restaurant-login" element={<RestaurantLogin />} />
          <Route path="/super-admin" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/superadmin/restaurants/edit/:id" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <EditRestaurant />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/restaurant-dashboard" element={
            <ProtectedRoute allowedRoles={['RESTAURANT_ADMIN', 'MANAGER', 'CHEF', 'WAITER', 'CASHIER']}>
              <RestaurantDashboard />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/restaurant-login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
