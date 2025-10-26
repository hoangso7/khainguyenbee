import React, { useState } from 'react';
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
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createBeehive } from '../store/slices/beehiveSlice';
import ValidatedTextField from '../components/common/ValidatedTextField';
import { VALIDATION_RULES, VALIDATION_SCHEMAS } from '../utils/formValidation';

const AddBeehive = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.beehives);

  const [formData, setFormData] = useState({
    importDate: new Date().toISOString().split('T')[0],
    splitDate: '',
    healthStatus: 'Tốt',
    notes: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const healthStatusOptions = ['Tốt', 'Bình thường', 'Yếu'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear errors when user starts typing
    if (error) setError(null);
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
    setError(null);
    setFieldErrors({});
    
    // Validation using schema
    const validationResult = VALIDATION_SCHEMAS.addBeehive;
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

    setIsCreating(true);
    setError(null);

    try {
      const beehiveData = {
        import_date: formData.importDate,
        split_date: formData.splitDate || null,
        health_status: formData.healthStatus,
        notes: formData.notes,
      };

      await dispatch(createBeehive(beehiveData)).unwrap();
      
      setSuccess('Tạo tổ ong thành công!');
      
      // Reset form
      setFormData({
        importDate: new Date().toISOString().split('T')[0],
        splitDate: '',
        healthStatus: 'Tốt',
        notes: '',
      });

      // Navigate back to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Failed to create beehive:', error);
      setError(error.message || 'Có lỗi xảy ra khi tạo tổ ong');
    } finally {
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

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
          Thêm tổ ong mới
        </Typography>
      </Box>

      {/* Success Message */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Thông tin tổ ong
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Import Date */}
              <Grid item xs={12} sm={6}>
                <ValidatedTextField
                  fullWidth
                  label="Ngày nhập"
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
              <Grid item xs={12} sm={6}>
                <ValidatedTextField
                  fullWidth
                  label="Ngày tách"
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
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tình trạng sức khỏe</InputLabel>
                  <Select
                    value={formData.healthStatus}
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
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <ValidatedTextField
                  fullWidth
                  label="Ghi chú"
                  name="notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  validationRules={[VALIDATION_RULES.MAX_LENGTH]}
                  validationOptions={{ maxLength: 500 }}
                  errorMessage={fieldErrors.notes}
                  placeholder="Nhập ghi chú về tổ ong (tùy chọn)"
                />
              </Grid>

              {/* Submit Buttons */}
              <Grid item xs={12}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={isCreating}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={isCreating ? <CircularProgress size={20} /> : <AddIcon />}
                    disabled={isCreating || Object.values(fieldErrors).some(error => error)}
                    sx={{ minWidth: 150 }}
                  >
                    {isCreating ? 'Đang tạo...' : 'Tạo tổ ong'}
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
            💡 Hướng dẫn
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

export default AddBeehive;