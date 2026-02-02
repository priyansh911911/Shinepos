// ============================================
// FRONTEND INTEGRATION GUIDE
// ============================================

// Step 1: Wrap App with ModuleProvider
// ============================================
// File: src/main.jsx or src/App.jsx

import { ModuleProvider } from './context/ModuleContext';

function App() {
  return (
    <ModuleProvider>
      {/* Your existing app structure */}
      <Router>
        <Routes>
          {/* ... */}
        </Routes>
      </Router>
    </ModuleProvider>
  );
}

// Step 2: Protect Routes
// ============================================
// File: Your routing file

import ModuleProtectedRoute from './components/ModuleProtectedRoute';

<Route 
  path="/inventory" 
  element={
    <ModuleProtectedRoute module="inventory">
      <InventoryPage />
    </ModuleProtectedRoute>
  } 
/>

<Route 
  path="/orders" 
  element={
    <ModuleProtectedRoute module="orderTaking">
      <OrdersPage />
    </ModuleProtectedRoute>
  } 
/>

<Route 
  path="/kot" 
  element={
    <ModuleProtectedRoute module="kot">
      <KOTPage />
    </ModuleProtectedRoute>
  } 
/>

// Step 3: Conditionally Show Navigation Items
// ============================================
// File: Your Sidebar/Navigation component

import { useModules } from './context/ModuleContext';

function Sidebar() {
  const { isModuleEnabled } = useModules();

  return (
    <nav>
      {isModuleEnabled('orderTaking') && (
        <NavLink to="/orders">Orders</NavLink>
      )}
      
      {isModuleEnabled('kot') && (
        <NavLink to="/kot">KOT</NavLink>
      )}
      
      {isModuleEnabled('inventory') && (
        <NavLink to="/inventory">Inventory</NavLink>
      )}
    </nav>
  );
}

// Step 4: Add Settings Page (Admin Only)
// ============================================
// File: Your routing file

import ModuleSettings from './components/ModuleSettings';

<Route 
  path="/settings/modules" 
  element={
    <ProtectedRoute requiredRole="RESTAURANT_ADMIN">
      <ModuleSettings />
    </ProtectedRoute>
  } 
/>

// Step 5: Conditional Logic in Components
// ============================================
// Example: Order creation with conditional inventory

import { useModules } from './context/ModuleContext';

function CreateOrder() {
  const { isModuleEnabled } = useModules();

  const handleSubmit = async (orderData) => {
    try {
      const response = await axios.post('/api/orders', orderData);
      
      // Show different message based on inventory module
      if (isModuleEnabled('inventory')) {
        toast.success('Order created and inventory updated');
      } else {
        toast.success('Order created');
      }
    } catch (error) {
      if (error.response?.data?.module) {
        toast.error(`${error.response.data.module} module is disabled`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Order form */}
    </form>
  );
}

// Step 6: Handle API Errors
// ============================================
// Add global axios interceptor

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403 && error.response?.data?.module) {
      // Module disabled error
      toast.error(error.response.data.message);
      // Optionally redirect
      window.location.href = '/dashboard';
    }
    return Promise.reject(error);
  }
);
