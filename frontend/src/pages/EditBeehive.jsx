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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchBeehive, updateBeehive } from '../store/slices/beehiveSlice';
import ValidatedTextField from '../components/common/ValidatedTextField';
import { VALIDATION_RULES } from '../utils/formValidation';

const EditBeehive = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { serialNumber } = useParams();
  const { currentBeehive, loading, error } = useSelector((state) => state.beehives);

  const [formData, setFormData] = useState({
    importDate: '',
    splitDate: '',
    healthStatus: 'Tốt',
    notes: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const healthStatusOptions = ['Tốt', 'Bình thường', 'Yếu'];

  useEffect(() => {
    if (serialNumber) {
      dispatch(fetchBeehive(serialNumber));
    }
  }, [dispatch, serialNumber]);

  useEffect(() => {
    if (currentBeehive) {
      setFormData({
        importDate: currentBeehive.import_date ? new Date(currentBeehive.import_date).toISOString().split('T')[0] : '',
        splitDate: currentBeehive.split_date ? new Date(currentBeehive.split_date).toISOString().split('T')[0] : '',
        healthStatus: currentBeehive.health_status || 'Tốt',
        notes: currentBeehive.notes || '',
      });
    }
  }, [currentBeehive]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear errors when user starts typing
    if (updateError) setUpdateError(null);
    // Clear field-specific errors
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setUpdateError(null);
    setFieldErrors({});
    
    // Validation
    const errors = {};
    let hasErrors = false;
    
    // Validate import date
    if (!formData.importDate) {
      errors.importDate = 'Ngày nhập là bắt buộc';
      hasErrors = true;
    }
    
    // Validate split date if provided
    if (formData.splitDate && formData.splitDate < formData.importDate) {
      errors.splitDate = 'Ngày tách không thể sớm hơn ngày nhập';
      hasErrors = true;
    }
    
    if (hasErrors) {
      setFieldErrors(errors);
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const beehiveData = {
        import_date: formData.importDate,
        split_date: formData.splitDate || null,
        health_status: formData.healthStatus,
        notes: formData.notes,
      };

      await dispatch(updateBeehive({ serialNumber, data: beehiveData })).unwrap();
      
      setSuccess('Cập nhật tổ ong thành công!');

      // Navigate back to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Failed to update beehive:', error);
      setUpdateError(error.message || 'Có lỗi xảy ra khi cập nhật tổ ong');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
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
          alt="Đang tải dữ liệu..." 
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
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Quay lại Dashboard
        </Button>
      </Box>
    );
  }

  if (!currentBeehive) {
    return (
      <Box p={3}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Không tìm thấy tổ ong với mã số: {serialNumber}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Quay lại Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Quay lại
        </Button>
        <Typography variant="h4" component="h1" color="primary">
          Chỉnh sửa tổ ong #{currentBeehive.serial_number}
        </Typography>
      </Box>

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

      {/* Form */}
      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 4, textAlign: 'center', color: 'primary.main' }}>
            Chỉnh sửa thông tin tổ ong
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ margin: 0 }}>
              {/* Serial Number (Read-only) */}
              <Grid item xs={12} sm={6} sx={{ padding: '4px' }}>
                <TextField
                  fullWidth
                  label="Mã số tổ ong"
                  value={currentBeehive.serial_number || 'N/A'}
                  disabled
                  InputLabelProps={{ shrink: true }}
                  sx={{ 
                    '& .MuiInputBase-input': { 
                      fontWeight: 'bold',
                      color: 'primary.main'
                    }
                  }}
                />
              </Grid>

              {/* Import Date */}
              <Grid item xs={12} sm={6} sx={{ padding: '4px' }}>
                <ValidatedTextField
                  fullWidth
                  label="Ngày nhập tổ"
                  name="importDate"
                  type="date"
                  value={formData.importDate}
                  onChange={(e) => handleInputChange('importDate', e.target.value)}
                  validationRules={[VALIDATION_RULES.REQUIRED, VALIDATION_RULES.DATE]}
                  errorMessage={fieldErrors.importDate}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Split Date */}
              <Grid item xs={12} sm={6} sx={{ padding: '4px' }}>
                <ValidatedTextField
                  fullWidth
                  label="Ngày tách tổ"
                  name="splitDate"
                  type="date"
                  value={formData.splitDate}
                  onChange={(e) => handleInputChange('splitDate', e.target.value)}
                  validationRules={[VALIDATION_RULES.DATE_RANGE]}
                  validationOptions={{ minDate: formData.importDate }}
                  errorMessage={fieldErrors.splitDate}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: formData.importDate
                  }}
                />
              </Grid>

              {/* Health Status */}
              <Grid item xs={12} sm={6} sx={{ padding: '4px' }}>
                <FormControl fullWidth>
                  <InputLabel>Tình trạng</InputLabel>
                  <Select
                    value={formData.healthStatus}
                    onChange={(e) => handleInputChange('healthStatus', e.target.value)}
                    label="Tình trạng"
                  >
                    {healthStatusOptions.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <ValidatedTextField
                  fullWidth
                  label="Nhập ghi chú"
                  name="notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  validationRules={[VALIDATION_RULES.MAX_LENGTH]}
                  validationOptions={{ maxLength: 500 }}
                  errorMessage={fieldErrors.notes}
                  placeholder="Nhập ghi chú"
                />
              </Grid>

              {/* Submit Buttons */}
              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={isUpdating}
                    size="large"
                    sx={{ minWidth: 120 }}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={isUpdating ? <CircularProgress size={20} /> : <EditIcon />}
                    disabled={isUpdating || Object.values(fieldErrors).some(error => error)}
                    size="large"
                    sx={{ minWidth: 150 }}
                  >
                    {isUpdating ? 'Đang cập nhật...' : 'Cập nhật tổ ong'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card sx={{ mt: 3, bgcolor: 'background.paper' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            💡 Hướng dẫn chỉnh sửa
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • <strong>Mã số tổ ong:</strong> Không thể thay đổi (tự động tạo)
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • <strong>QR Token:</strong> Không thể thay đổi (tự động tạo)
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • <strong>Ngày nhập:</strong> Ngày bạn nhập tổ ong vào trang trại (bắt buộc)
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • <strong>Ngày tách:</strong> Ngày bạn tách tổ ong thành nhiều tổ nhỏ (tùy chọn)
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            • <strong>Tình trạng sức khỏe:</strong> Đánh giá sức khỏe hiện tại của tổ ong
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong>Ghi chú:</strong> Thông tin bổ sung về tổ ong (tùy chọn)
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EditBeehive;
