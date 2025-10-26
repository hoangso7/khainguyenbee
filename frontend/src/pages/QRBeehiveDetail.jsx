import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Container,
  Paper,
  Divider,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack
} from '@mui/material';
import {
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  HealthAndSafety as HealthIcon,
  Notes as NotesIcon,
  Person as PersonIcon,
  QrCode as QRCodeIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { publicApi, api } from '../services/api';

const QRBeehiveDetail = () => {
  const { qrToken } = useParams();
  const navigate = useNavigate();
  const [beehive, setBeehive] = useState(null);
  const [owner, setOwner] = useState(null);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    importDate: '',
    splitDate: '',
    healthStatus: 'Tốt',
    notes: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    const fetchBeehiveData = async () => {
      try {
        setLoading(true);
        const response = await publicApi.get(`/beehive/${qrToken}`);
        setBeehive(response.data?.beehive || null);
        setOwner(response.data?.owner || null);
        setBusinessInfo(response.data?.business_info || null);
        
        // Initialize edit form data
        if (response.data?.beehive) {
          const beehiveData = response.data.beehive;
          setEditFormData({
            importDate: beehiveData.import_date ? new Date(beehiveData.import_date).toISOString().split('T')[0] : '',
            splitDate: beehiveData.split_date ? new Date(beehiveData.split_date).toISOString().split('T')[0] : '',
            healthStatus: beehiveData.health_status || 'Tốt',
            notes: beehiveData.notes || '',
          });
        }
      } catch (err) {
        setError('Không tìm thấy thông tin tổ ong');
        console.error('Error fetching beehive data:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
    if (qrToken) {
      fetchBeehiveData();
    }
  }, [qrToken]);

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'Tốt': return 'success';
      case 'Bình thường': return 'warning';
      case 'Yếu': return 'error';
      default: return 'default';
    }
  };

  const getHealthStatusIcon = (status) => {
    switch (status) {
      case 'Tốt': return '/static/icons/health/good.png';
      case 'Bình thường': return '/static/icons/health/normal.png';
      case 'Yếu': return '/static/icons/health/weak.png';
      default: return '/static/icons/health/normal.png';
    }
  };

  const healthStatusOptions = ['Tốt', 'Bình thường', 'Yếu'];

  const handleEditClick = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(window.location.pathname);
      navigate(`/login?returnUrl=${returnUrl}`);
      return;
    }
    setIsEditing(true);
    setUpdateError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdateError(null);
    setSuccess(null);
    // Reset form data to original values
    if (beehive) {
      setEditFormData({
        importDate: beehive.import_date ? new Date(beehive.import_date).toISOString().split('T')[0] : '',
        splitDate: beehive.split_date ? new Date(beehive.split_date).toISOString().split('T')[0] : '',
        healthStatus: beehive.health_status || 'Tốt',
        notes: beehive.notes || '',
      });
    }
  };

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (updateError) setUpdateError(null);
  };

  const handleSaveEdit = async () => {
    if (!beehive) return;

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const beehiveData = {
        import_date: editFormData.importDate,
        split_date: editFormData.splitDate || null,
        health_status: editFormData.healthStatus,
        notes: editFormData.notes,
      };

      const response = await api.put(`/beehives/${beehive.serial_number}`, beehiveData);
      
      // Update local state
      setBeehive(prev => ({
        ...prev,
        ...beehiveData
      }));
      
      setSuccess('Cập nhật thông tin tổ ong thành công!');
      setIsEditing(false);

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (error) {
      console.error('Failed to update beehive:', error);
      setUpdateError(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin tổ ong');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="400px"
          sx={{ 
            flexDirection: 'column',
            gap: 2,
            py: 4
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
          <Typography 
            variant="body1" 
            color="primary" 
            sx={{ 
              fontWeight: 500,
              opacity: 0.8
            }}
          >
            Đang tải thông tin tổ ong...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <QRCodeIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" color="primary">
              Thông tin tổ ong
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditClick}
            disabled={isUpdating}
          >
            {isAuthenticated ? 'Chỉnh sửa' : 'Đăng nhập để chỉnh sửa'}
          </Button>
        </Box>

        {/* Status Banner */}
        {beehive.is_sold && (
          <Alert 
            severity="info" 
            sx={{ mb: 3 }}
            icon={<QRCodeIcon />}
          >
            <Typography variant="body1" fontWeight="bold">
              Tổ ong đã được bán
            </Typography>
          </Alert>
        )}

        {/* Custom Message */}
        {beehive.is_sold && businessInfo?.qr_custom_message && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
          >
            <Typography variant="body1">
              {businessInfo.qr_custom_message || 'Thông điệp tùy chỉnh'}
            </Typography>
          </Alert>
        )}

        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Error Message */}
        {updateError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {updateError}
          </Alert>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Beehive Information */}
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  <HomeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Thông tin cơ bản
                </Typography>
                
                {isEditing ? (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Mã tổ ong"
                      value={beehive.serial_number || 'N/A'}
                      disabled
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Ngày nhập"
                      type="date"
                      value={editFormData.importDate}
                      onChange={(e) => handleInputChange('importDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Ngày tách"
                      type="date"
                      value={editFormData.splitDate}
                      onChange={(e) => handleInputChange('splitDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min: editFormData.importDate
                      }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Mã tổ ong:
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {beehive.serial_number || 'N/A'}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Ngày nhập:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {beehive.import_date ? new Date(beehive.import_date).toLocaleDateString('vi-VN') : 'N/A'}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Ngày tách:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {beehive.split_date 
                        ? new Date(beehive.split_date).toLocaleDateString('vi-VN')
                        : 'Chưa tách'
                      }
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Health Status */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  <HealthIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Tình trạng sức khỏe
                </Typography>
                
                {isEditing ? (
                  <Box sx={{ mt: 2 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Tình trạng sức khỏe</InputLabel>
                      <Select
                        value={editFormData.healthStatus}
                        onChange={(e) => handleInputChange('healthStatus', e.target.value)}
                        label="Tình trạng sức khỏe"
                      >
                        {healthStatusOptions.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Trạng thái"
                      value={beehive.is_sold ? 'Đã bán' : 'Đang quản lý'}
                      disabled
                    />
                  </Box>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Trạng thái sức khỏe:
                    </Typography>
                    <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                      <img 
                        src={getHealthStatusIcon(beehive.health_status || 'Unknown')} 
                        alt={beehive.health_status || 'Unknown'} 
                        style={{ 
                          width: 48, 
                          height: 48, 
                          marginRight: 12,
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }} 
                      />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {beehive.health_status || 'Unknown'}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Trạng thái:
                    </Typography>
                    <Chip
                      label={beehive.is_sold ? 'Đã bán' : 'Đang quản lý'}
                      color={beehive.is_sold ? 'default' : 'success'}
                      size="large"
                      sx={{ mb: 2 }}
                    />

                    {beehive.is_sold && beehive.sold_date && (
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Ngày bán:
                        </Typography>
                        <Typography variant="body1">
                          {new Date(beehive.sold_date).toLocaleDateString('vi-VN')}
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  <NotesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Ghi chú
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    label="Ghi chú"
                    multiline
                    rows={3}
                    value={editFormData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Nhập ghi chú về tổ ong..."
                  />
                ) : (
                  <Typography variant="body1">
                    {beehive.notes || 'Không có ghi chú'}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Farm Information - Only show for sold beehives */}
          {businessInfo && beehive.is_sold && businessInfo.qr_show_farm_info && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Thông tin trang trại
                  </Typography>
                  {businessInfo.farm_name && (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Tên trang trại:</strong> {businessInfo.farm_name || 'N/A'}
                    </Typography>
                  )}
                  {businessInfo.farm_address && (
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Địa chỉ:</strong> {businessInfo.farm_address || 'N/A'}
                    </Typography>
                  )}
                  {businessInfo.farm_phone && (
                    <Typography variant="body1">
                      <strong>Điện thoại:</strong> {businessInfo.farm_phone || 'N/A'}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Owner Information - Only show for sold beehives */}
          {owner && beehive.is_sold && businessInfo?.qr_show_owner_contact && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Thông tin chủ sở hữu
                  </Typography>
                  <Typography variant="body1">
                    <strong>Tên:</strong> {owner.username || 'N/A'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Email:</strong> {owner.email || 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Edit Actions */}
        {isEditing && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancelEdit}
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              startIcon={isUpdating ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSaveEdit}
              disabled={isUpdating}
            >
              {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </Box>
        )}

        {/* Footer */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {beehive.is_sold 
              ? (businessInfo?.qr_footer_text || 'Cảm ơn bạn đã tin tưởng sản phẩm của chúng tôi')
              : 'Quét mã QR để xem thông tin tổ ong'
            }
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default QRBeehiveDetail;
