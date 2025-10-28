import React, { useEffect, useState, createContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from '../store/slices/authSlice';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          await dispatch(checkAuth()).unwrap();
        } catch {
          localStorage.removeItem('auth_token');
        }
      }
      setInitialLoading(false);
    };

    initAuth();
  }, [dispatch]);

  const value = {
    user,
    isAuthenticated,
    loading: loading || initialLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
