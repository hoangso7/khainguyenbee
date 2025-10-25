import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Paper,
  Stack,
} from '@mui/material';
import {
  Save as SaveIcon,
  Person as PersonIcon,
  QrCode as QrCodeIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ProfileSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    businessWebsite: '',
    qrDisplaySettings: {
      showBusinessInfo: true,
      showOwnerContact: true,
      showBeehiveHistory: true,
      showHealthStatus: true,
      customMessage: '',
      footerText: 'Cảm ơn bạn đã tin tưởng sản phẩm của chúng tôi',
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
        businessName: user.business_name || '',
        businessAddress: user.business_address || '',
        businessPhone: user.business_phone || '',
        businessEmail: user.business_email || '',
        businessWebsite: user.business_website || '',
        qrDisplaySettings: {
          showBusinessInfo: user.qr_show_business_info !== false,
          showOwnerContact: user.qr_show_owner_contact !== false,
          showBeehiveHistory: user.qr_show_beehive_history !== false,
          showHealthStatus: user.qr_show_health_status !== false,
          customMessage: user.qr_custom_message || '',
          footerText: user.qr_footer_text || 'Cảm ơn bạn đã tin tưởng sản phẩm của chúng tôi',
        }
      }));
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQrSettingChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      qrDisplaySettings: {
        ...prev.qrDisplaySettings,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.put('/auth/profile', profileData);
      
      if (response.status === 200) {
        setSuccess('Đã lưu cài đặt thành công!');
        // Update user data in store if needed
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Có lỗi xảy ra khi lưu cài đặt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Cài đặt hồ sơ
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý thông tin cá nhân và cài đặt hiển thị QR code
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Thông tin cá nhân
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tên đăng nhập"
                    value={profileData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    disabled
                    helperText="Không thể thay đổi tên đăng nhập"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Business Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Thông tin doanh nghiệp
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tên doanh nghiệp"
                    value={profileData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Địa chỉ"
                    multiline
                    rows={2}
                    value={profileData.businessAddress}
                    onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    value={profileData.businessPhone}
                    onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email doanh nghiệp"
                    type="email"
                    value={profileData.businessEmail}
                    onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Website"
                    value={profileData.businessWebsite}
                    onChange={(e) => handleInputChange('businessWebsite', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* QR Display Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <QrCodeIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Cài đặt hiển thị QR Code
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Các cài đặt này sẽ ảnh hưởng đến cách hiển thị thông tin khi khách hàng quét QR code của tổ ong đã bán
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Thông tin hiển thị
                    </Typography>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={profileData.qrDisplaySettings.showBusinessInfo}
                            onChange={(e) => handleQrSettingChange('showBusinessInfo', e.target.checked)}
                          />
                        }
                        label="Hiển thị thông tin doanh nghiệp"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={profileData.qrDisplaySettings.showOwnerContact}
                            onChange={(e) => handleQrSettingChange('showOwnerContact', e.target.checked)}
                          />
                        }
                        label="Hiển thị thông tin liên hệ chủ sở hữu"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={profileData.qrDisplaySettings.showBeehiveHistory}
                            onChange={(e) => handleQrSettingChange('showBeehiveHistory', e.target.checked)}
                          />
                        }
                        label="Hiển thị lịch sử tổ ong"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={profileData.qrDisplaySettings.showHealthStatus}
                            onChange={(e) => handleQrSettingChange('showHealthStatus', e.target.checked)}
                          />
                        }
                        label="Hiển thị tình trạng sức khỏe"
                      />
                    </FormGroup>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Thông điệp tùy chỉnh
                    </Typography>
                    <TextField
                      fullWidth
                      label="Lời nhắn tùy chỉnh"
                      multiline
                      rows={3}
                      value={profileData.qrDisplaySettings.customMessage}
                      onChange={(e) => handleQrSettingChange('customMessage', e.target.value)}
                      placeholder="Nhập lời nhắn sẽ hiển thị trên trang QR..."
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Văn bản chân trang"
                      value={profileData.qrDisplaySettings.footerText}
                      onChange={(e) => handleQrSettingChange('footerText', e.target.value)}
                      placeholder="Văn bản hiển thị ở cuối trang QR..."
                    />
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box mt={3} display="flex" justifyContent="space-between">
        <Button
          variant="outlined"
          onClick={() => navigate('/dashboard')}
        >
          Quay lại Dashboard
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
        </Button>
      </Box>
    </Box>
  );
};

export default ProfileSettings;
