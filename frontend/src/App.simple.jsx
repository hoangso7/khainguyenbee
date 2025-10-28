import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import Login from './pages/Login';
import BeehiveDetail from './pages/BeehiveDetail';
import EditBeehive from './pages/EditBeehive';
import './index.css';

// Simple test component
const TestComponent = () => {
  return (
    <div style={{ padding: '20px', fontSize: '18px' }}>
      <h1>Test Component</h1>
      <p>This is a simple test component to check if React is working.</p>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/beehive/:qrToken" element={<BeehiveDetail />} />
        <Route path="/edit-beehive/:serialNumber" element={<EditBeehive />} />
        <Route path="*" element={<TestComponent />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
