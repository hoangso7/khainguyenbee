import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../store/slices/authSlice';
import beeIcon from '../assets/bee-icon.png';
import ValidatedTextField from '../components/common/ValidatedTextField';
import { VALIDATION_RULES } from '../utils/formValidation';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // Check if setup is needed
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const response = await fetch('/api/auth/setup/check');
        const data = await response.json();
        
        if (data.setup_needed) {
          // No admin user exists, redirect to setup
          navigate('/setup', { replace: true });
        }
        // If setup is not needed, stay on login page
      } catch (error) {
        console.error('Setup check failed:', error);
        // If check fails, assume setup is needed and redirect
        navigate('/setup', { replace: true });
      }
    };

    checkSetup();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.username.trim()) {
      return;
    }
    if (!formData.password.trim()) {
      return;
    }
    
    try {
      const result = await dispatch(login(formData)).unwrap();
      localStorage.setItem('token', result.token);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #FFF8DC 0%, #ffffff 100%)',
        padding: 2,
        boxSizing: 'border-box',
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #D2691E, #FFD700)',
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
          },
          transition: 'all 0.3s ease-in-out',
        }}
      >
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 4,
                pt: 2,
              }}
            >
              <img
                src={beeIcon}
                alt="KhaiNguyenBee Logo"
                style={{ 
                  height: 80, 
                  width: 80, 
                  marginBottom: 16,
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                }}
              />
              <Typography 
                component="h1" 
                variant="h4" 
                fontWeight="bold" 
                color="primary"
                sx={{
                  background: 'linear-gradient(45deg, #D2691E, #FFD700)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                KhaiNguyenBee
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                align="center"
                sx={{ mt: 1, opacity: 0.8 }}
              >
                Hệ thống quản lý tổ ong thông minh
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <ValidatedTextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Tên đăng nhập"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                validationRules={[VALIDATION_RULES.REQUIRED]}
              />
              <ValidatedTextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Mật khẩu"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                validationRules={[VALIDATION_RULES.REQUIRED]}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
                  mb: 2, 
                  py: 1.5,
                  background: 'linear-gradient(45deg, #D2691E, #FFD700)',
                  boxShadow: '0 4px 12px rgba(210, 105, 30, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #B8860B, #DAA520)',
                    boxShadow: '0 6px 16px rgba(210, 105, 30, 0.4)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Đăng nhập'
                )}
              </Button>
            </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
