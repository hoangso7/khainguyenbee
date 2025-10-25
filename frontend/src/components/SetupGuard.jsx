import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

const SetupGuard = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const response = await fetch('/api/setup/check');
        const data = await response.json();
        
        // If setup is not needed (admin user exists), redirect to login
        if (!data.setup_needed) {
          setShouldRedirect(true);
        }
      } catch (error) {
        console.error('Setup check failed:', error);
        // If check fails, allow access to setup page
      } finally {
        setIsChecking(false);
      }
    };

    checkSetupStatus();
  }, []);

  if (isChecking) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="100vh"
      >
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Đang kiểm tra trạng thái setup...
        </Typography>
      </Box>
    );
  }

  if (shouldRedirect) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default SetupGuard;
