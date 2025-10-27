import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import apiService from './lib/api.js';
import Login from './pages/Login';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import AddBeehive from './pages/AddBeehive';
import BulkAddBeehives from './pages/BulkAddBeehives';
import EditBeehive from './pages/EditBeehive';
import BeehiveDetail from './pages/BeehiveDetail';
import QRBeehiveDetail from './pages/QRBeehiveDetail';
import ExportQR from './pages/ExportQR';
import ExportPDF from './pages/ExportPDF';
import SoldBeehives from './pages/SoldBeehives';
import ProfileSettings from './pages/ProfileSettings';
import './index.css';

function ProtectedRoute({ children }) {
  const token = apiService.getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSetupAndRedirect = async () => {
      // Don't check on /setup or /qr routes
      if (location.pathname === '/setup' || location.pathname.startsWith('/qr/')) {
        setIsChecking(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/setup/check');
        const data = await response.json();
        
        if (data.setup_needed && location.pathname !== '/setup' && location.pathname !== '/login') {
          navigate('/setup', { replace: true });
        }
      } catch (error) {
        console.error('Setup check failed:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkSetupAndRedirect();
  }, [location.pathname, navigate]);

  if (isChecking && location.pathname !== '/setup' && location.pathname !== '/login' && !location.pathname.startsWith('/qr/')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra...</p>
        </div>
      </div>
    );
  }

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/qr/:token" element={<QRBeehiveDetail />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-beehive"
          element={
            <ProtectedRoute>
              <AddBeehive />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bulk-add"
          element={
            <ProtectedRoute>
              <BulkAddBeehives />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-beehive/:serialNumber"
          element={
            <ProtectedRoute>
              <EditBeehive />
            </ProtectedRoute>
          }
        />
        <Route
          path="/beehive/:serialNumber"
          element={
            <ProtectedRoute>
              <BeehiveDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/export-qr"
          element={
            <ProtectedRoute>
              <ExportQR />
            </ProtectedRoute>
          }
        />
        <Route
          path="/export-pdf"
          element={
            <ProtectedRoute>
              <ExportPDF />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sold"
          element={
            <ProtectedRoute>
              <SoldBeehives />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />
        
        {/* Catch-all route for unmatched paths */}
        <Route
          path="*"
          element={
            apiService.getToken() ? (
              <Navigate to="/" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;