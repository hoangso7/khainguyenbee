import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';

const SetupRedirect = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const response = await fetch('/api/auth/setup/check');
        const data = await response.json();
        
        // If setup is needed (no admin user exists), redirect to setup
        if (data.setup_needed) {
          setNeedsSetup(true);
        }
      } catch (error) {
        console.error('Setup check failed:', error);
        // If check fails, assume setup is needed
        setNeedsSetup(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkSetupStatus();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-lg font-semibold text-gray-900">
                Đang kiểm tra...
              </h2>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (needsSetup) {
    return <Navigate to="/setup" replace />;
  }

  return children;
};

export default SetupRedirect;
