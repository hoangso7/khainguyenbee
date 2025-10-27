import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { storage } from './lib/storage';
import { Login } from './components/Login';
import { Setup } from './components/Setup';
import { Dashboard } from './components/Dashboard';
import { AddBeehive } from './components/AddBeehive';
import { BulkAddBeehives } from './components/BulkAddBeehives';
import { EditBeehive } from './components/EditBeehive';
import { BeehiveDetail } from './components/BeehiveDetail';
import { QRBeehiveDetail } from './components/QRBeehiveDetail';
import { ExportQR } from './components/ExportQR';
import { ExportPDF } from './components/ExportPDF';
import { SoldBeehives } from './components/SoldBeehives';
import { ProfileSettings } from './components/ProfileSettings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = storage.getCurrentUser();
  if (!user) {
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
          path="/setup"
          element={
            <ProtectedRoute>
              <Setup />
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
            storage.getCurrentUser() ? (
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
