import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  Divider
} from '@mui/material';
import {
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  HealthAndSafety as HealthIcon,
  Notes as NotesIcon,
  Person as PersonIcon,
  QrCode as QRCodeIcon
} from '@mui/icons-material';
import api from '../services/api';

const QRBeehiveDetail = () => {
  const { qrToken } = useParams();
  const [beehive, setBeehive] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBeehiveData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/beehive/${qrToken}`);
        setBeehive(response.data.beehive);
        setOwner(response.data.owner);
      } catch (err) {
        setError('Không tìm thấy thông tin tổ ong');
        console.error('Error fetching beehive data:', err);
      } finally {
        setLoading(false);
      }
    };

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

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
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
        <Box display="flex" alignItems="center" mb={3}>
          <QRCodeIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" color="primary">
            Thông tin tổ ong
          </Typography>
        </Box>

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
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Mã tổ ong:
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {beehive.serial_number}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Ngày nhập:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {new Date(beehive.import_date).toLocaleDateString('vi-VN')}
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
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Trạng thái sức khỏe:
                  </Typography>
                  <Chip
                    icon={<img src={getHealthStatusIcon(beehive.health_status)} alt={beehive.health_status} style={{ width: 16, height: 16 }} />}
                    label={beehive.health_status}
                    color={getHealthStatusColor(beehive.health_status)}
                    size="large"
                    sx={{ mb: 2 }}
                  />

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
              </CardContent>
            </Card>
          </Grid>

          {/* Notes */}
          {beehive.notes && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    <NotesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Ghi chú
                  </Typography>
                  <Typography variant="body1">
                    {beehive.notes}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Owner Information */}
          {owner && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Thông tin chủ sở hữu
                  </Typography>
                  <Typography variant="body1">
                    <strong>Tên:</strong> {owner.username}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Email:</strong> {owner.email}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Footer */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Quét mã QR để xem thông tin tổ ong
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default QRBeehiveDetail;
