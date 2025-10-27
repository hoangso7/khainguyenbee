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

function App() {
  return (
    <BrowserRouter>
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