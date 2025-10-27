import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const Setup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: 'admin',
    email: 'admin@kbee.com',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkingSetup, setCheckingSetup] = useState(true);

  // Check if setup is already completed
  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const response = await fetch('/api/auth/setup/check');
        const data = await response.json();
        
        if (!data.setup_needed) {
          // Admin user already exists, redirect to login
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Setup check failed:', error);
        setError('Không thể kiểm tra trạng thái setup');
      } finally {
        setCheckingSetup(false);
      }
    };

    checkSetupStatus();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.password) {
      setError('Mật khẩu là bắt buộc');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Tài khoản admin "${formData.username}" đã được tạo thành công!`);
        // Redirect immediately to login after successful setup
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1500);
      } else {
        setError(data.message || 'Có lỗi xảy ra khi tạo tài khoản');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking setup status
  if (checkingSetup) {
    return (
      <Container maxWidth="sm" sx={{ px: { xs: 1, sm: 2 } }}>
        <StyledPaper elevation={3}>
          <Box 
            textAlign="center" 
            py={4}
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            <img 
              src="/bee.gif" 
              alt="Loading..." 
              style={{ 
                width: '80px', 
                height: '80px',
                borderRadius: '50%',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
              }} 
            />
            <Typography variant="h6" color="primary" sx={{ fontWeight: 500 }}>
              Đang kiểm tra trạng thái setup...
            </Typography>
          </Box>
        </StyledPaper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <StyledPaper elevation={3}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            🐝 KhaiNguyenBee
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Thiết lập ban đầu
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tạo tài khoản quản trị viên đầu tiên
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Tên đăng nhập"
                name="username"
                value={formData.username}
                onChange={handleChange}
                margin="normal"
                required
                disabled={loading}
                helperText="Tên đăng nhập cho tài khoản quản trị"
              />

              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                disabled={loading}
                helperText="Địa chỉ email của quản trị viên"
              />

              <TextField
                fullWidth
                label="Mật khẩu"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                disabled={loading}
                helperText="Mật khẩu phải có ít nhất 6 ký tự"
              />

              <TextField
                fullWidth
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                margin="normal"
                required
                disabled={loading}
                helperText="Nhập lại mật khẩu để xác nhận"
              />

              <Box mt={3} textAlign="center">
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                  sx={{ minWidth: 200 }}
                >
                  {loading ? 'Đang tạo...' : 'Tạo tài khoản Admin'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Box mt={3} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Sau khi tạo tài khoản, bạn sẽ được chuyển đến trang đăng nhập
          </Typography>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default Setup;
