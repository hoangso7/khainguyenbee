import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};
