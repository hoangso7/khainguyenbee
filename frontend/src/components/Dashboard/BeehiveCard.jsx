import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  IconButton,
  Divider,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  QrCode as QrCodeIcon,
  AttachMoney as MoneyIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const BeehiveCard = ({ beehive, onEdit, onViewQR, onSell, onDelete }) => {
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

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        borderLeft: '4px solid #D2691E',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #D2691E 0%, #CD853F 100%)',
            color: 'white',
            padding: 2,
            margin: -2,
            marginBottom: 2,
            borderRadius: '12px 12px 0 0',
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            {beehive.serial_number || 'N/A'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Nhập: {beehive.import_date ? new Date(beehive.import_date).toLocaleDateString('vi-VN') : 'N/A'}
          </Typography>
        </Box>

        {/* Content */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Ngày tách:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {beehive.split_date 
                ? new Date(beehive.split_date).toLocaleDateString('vi-VN')
                : 'Chưa tách'
              }
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Sức khỏe:
            </Typography>
            <Chip
              icon={<img src={getHealthStatusIcon(beehive.health_status || 'Unknown')} alt={beehive.health_status || 'Unknown'} style={{ width: 16, height: 16 }} />}
              label={beehive.health_status || 'Unknown'}
              color={getHealthStatusColor(beehive.health_status || 'Unknown')}
              size="small"
            />
          </Grid>
        </Grid>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Trạng thái:
          </Typography>
          <Chip
            label="Đang quản lý"
            color="success"
            size="small"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Actions */}
        <Stack direction="row" spacing={1} justifyContent="center">
          <IconButton
            size="small"
            onClick={onEdit}
            title="Chỉnh sửa"
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={onViewQR}
            title="Xem QR Code"
            sx={{ 
              bgcolor: 'info.main', 
              color: 'white',
              '&:hover': { bgcolor: 'info.dark' }
            }}
          >
            <QrCodeIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={onSell}
            title="Đánh dấu đã bán"
            sx={{ 
              bgcolor: 'warning.main', 
              color: 'white',
              '&:hover': { bgcolor: 'warning.dark' }
            }}
          >
            <MoneyIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={onDelete}
            title="Xóa"
            sx={{ 
              bgcolor: 'error.main', 
              color: 'white',
              '&:hover': { bgcolor: 'error.dark' }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default BeehiveCard;
