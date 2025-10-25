import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Setup from './pages/Setup';
import BeehiveDetail from './pages/BeehiveDetail';
import QRBeehiveDetail from './pages/QRBeehiveDetail';
import SoldBeehives from './pages/SoldBeehives';
import AddBeehive from './pages/AddBeehive';
import BulkAddBeehives from './pages/BulkAddBeehives';
import EditBeehive from './pages/EditBeehive';
import ExportQR from './pages/ExportQR';
import SetupGuard from './components/SetupGuard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Honey-themed Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#D2691E', // Honey primary
      light: '#F4A460', // Honey secondary
      dark: '#8B4513', // Honey dark
    },
    secondary: {
      main: '#FFD700', // Honey accent
    },
    background: {
      default: '#FFF8DC', // Honey light
      paper: '#FFFFFF',
    },
    success: {
      main: '#228B22',
    },
    warning: {
      main: '#FF8C00',
    },
    error: {
      main: '#DC143C',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/setup" element={
                <SetupGuard>
                  <Setup />
                </SetupGuard>
              } />
              <Route path="/beehive/:qrToken" element={<QRBeehiveDetail />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="sold" element={<SoldBeehives />} />
                <Route path="add" element={<AddBeehive />} />
                <Route path="bulk-add" element={<BulkAddBeehives />} />
                <Route path="export" element={<ExportQR />} />
                <Route path="edit/:serialNumber" element={<EditBeehive />} />
                <Route path="detail/:qrToken" element={<BeehiveDetail />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;