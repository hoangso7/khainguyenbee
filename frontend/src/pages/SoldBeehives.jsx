import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Stack,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  QrCode as QrCodeIcon,
  AttachMoney as MoneyIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Undo as UndoIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchSoldBeehives,
  unsellBeehive,
  setFilters,
  setSort,
  setPage,
} from '../store/slices/beehiveSlice';
import StatsCard from '../components/Dashboard/StatsCard';
import BeehiveCard from '../components/Dashboard/BeehiveCard';
import DateInput from '../components/common/DateInput';

const SoldBeehives = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    soldBeehives,
    stats,
    pagination,
    filters,
    sort,
    loading,
    error,
  } = useSelector((state) => state.beehives);

  const [searchFilters, setSearchFilters] = useState({
    importDate: '',
    splitDate: '',
  });

  useEffect(() => {
    dispatch(fetchSoldBeehives());
  }, [dispatch]);

  const handleSearch = () => {
    dispatch(setFilters(searchFilters));
    dispatch(fetchSoldBeehives());
  };

  const handleClearSearch = () => {
    const clearedFilters = { importDate: '', splitDate: '' };
    setSearchFilters(clearedFilters);
    dispatch(setFilters(clearedFilters));
    dispatch(fetchSoldBeehives());
  };

  const handleSort = (field) => {
    const newSort = {
      field,
      direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc'
    };
    dispatch(setSort(newSort));
    dispatch(fetchSoldBeehives());
  };

  const handlePageChange = (event, page) => {
    dispatch(setPage(page));
    dispatch(fetchSoldBeehives());
  };

  const handleUnsellBeehive = async (serialNumber) => {
    if (window.confirm('Bạn có chắc chắn muốn hoàn trả tổ ong này về trạng thái đang quản lý?')) {
      try {
        await dispatch(unsellBeehive(serialNumber)).unwrap();
        dispatch(fetchSoldBeehives());
      } catch (error) {
        console.error('Error unselling beehive:', error);
      }
    }
  };

  const getSortIcon = (field) => {
    if (sort.field !== field) return null;
    return sort.direction === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />;
  };

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

  if (loading && soldBeehives.length === 0) {
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
          Đang tải danh sách tổ đã bán...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tổ ong đã bán
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý và theo dõi các tổ ong đã được bán
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={6} md={3}>
          <StatsCard
            title="Tổng số tổ đã bán"
            value={stats?.sold || 0}
            icon="💰"
            color="warning"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatsCard
            title="Tổng số tổ"
            value={stats?.total || 0}
            icon="🐝"
            color="primary"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatsCard
            title="Tỷ lệ bán"
            value={`${stats?.total ? Math.round((stats.sold / stats.total) * 100) : 0}%`}
            icon="📊"
            color="success"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatsCard
            title="Tổ đang quản lý"
            value={stats?.active || 0}
            icon="📈"
            color="info"
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h1">
              Danh sách tổ ong đã bán
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
            >
              Quay lại Dashboard
            </Button>
          </Box>

          {/* Search Form */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <DateInput
                fullWidth
                label="Tìm theo ngày nhập"
                value={searchFilters.importDate}
                onChange={(e) => setSearchFilters({ ...searchFilters, importDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DateInput
                fullWidth
                label="Tìm theo ngày tách"
                value={searchFilters.splitDate}
                onChange={(e) => setSearchFilters({ ...searchFilters, splitDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleSearch}
                >
                  Tìm kiếm
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearSearch}
                >
                  Xóa
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary" align="right">
                Hiển thị {soldBeehives.length}/{pagination?.total || 0} tổ ong
              </Typography>
            </Grid>
          </Grid>

          {/* Beehives List */}
          {isMobile ? (
            // Mobile Card View
            <Stack spacing={2}>
              {soldBeehives.map((beehive) => (
                <BeehiveCard
                  key={beehive.serial_number}
                  beehive={beehive}
                  onEdit={() => navigate(`/edit/${beehive.serial_number || ''}`)}
                  onViewQR={() => navigate(`/beehive/${beehive.qr_token || ''}`)}
                  onSell={() => handleUnsellBeehive(beehive.serial_number)}
                  onDelete={() => {}} // Không cho phép xóa tổ đã bán
                  isSold={true}
                />
              ))}
            </Stack>
          ) : (
            // Desktop Table View
            <TableContainer component={Paper}>
              <Table sx={{ tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '15%' }}>
                      <Button
                        onClick={() => handleSort('created_at')}
                        endIcon={getSortIcon('created_at')}
                        sx={{ textTransform: 'none' }}
                      >
                        Mã tổ
                      </Button>
                    </TableCell>
                    <TableCell sx={{ width: '15%' }}>
                      <Button
                        onClick={() => handleSort('import_date')}
                        endIcon={getSortIcon('import_date')}
                        sx={{ textTransform: 'none' }}
                      >
                        Ngày nhập
                      </Button>
                    </TableCell>
                    <TableCell sx={{ width: '15%' }}>
                      <Button
                        onClick={() => handleSort('split_date')}
                        endIcon={getSortIcon('split_date')}
                        sx={{ textTransform: 'none' }}
                      >
                        Ngày tách
                      </Button>
                    </TableCell>
                    <TableCell sx={{ width: '15%' }}>
                      <Button
                        onClick={() => handleSort('health_status')}
                        endIcon={getSortIcon('health_status')}
                        sx={{ textTransform: 'none' }}
                      >
                        Sức khỏe
                      </Button>
                    </TableCell>
                    <TableCell sx={{ width: '15%' }}>
                      <Button
                        onClick={() => handleSort('sold_date')}
                        endIcon={getSortIcon('sold_date')}
                        sx={{ textTransform: 'none' }}
                      >
                        Ngày bán
                      </Button>
                    </TableCell>
                    <TableCell sx={{ width: '25%' }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {soldBeehives.map((beehive) => (
                    <TableRow key={beehive.serial_number} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.875rem' }}>
                          {beehive.serial_number || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {beehive.import_date ? new Date(beehive.import_date).toLocaleDateString('vi-VN') : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {beehive.split_date 
                            ? new Date(beehive.split_date).toLocaleDateString('vi-VN')
                            : 'Chưa tách'
                          }
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<img src={getHealthStatusIcon(beehive.health_status || 'Unknown')} alt={beehive.health_status || 'Unknown'} style={{ width: 14, height: 14 }} />}
                          label={beehive.health_status || 'Unknown'}
                          color={getHealthStatusColor(beehive.health_status || 'Unknown')}
                          size="small"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {beehive.sold_date 
                            ? new Date(beehive.sold_date).toLocaleDateString('vi-VN')
                            : 'N/A'
                          }
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/edit/${beehive.serial_number || ''}`)}
                            title="Chỉnh sửa"
                            sx={{ p: 0.5 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/beehive/${beehive.qr_token || ''}`)}
                            title="Xem QR Code"
                            sx={{ p: 0.5 }}
                          >
                            <QrCodeIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleUnsellBeehive(beehive.serial_number)}
                            title="Hoàn trả về quản lý"
                            color="success"
                            sx={{ p: 0.5 }}
                          >
                            <UndoIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {pagination?.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={pagination?.totalPages || 1}
                page={pagination?.page || 1}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}

          {soldBeehives.length === 0 && !loading && (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có tổ ong nào đã bán
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Các tổ ong đã bán sẽ hiển thị ở đây
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/dashboard')}
                sx={{ mt: 2 }}
              >
                Quay lại Dashboard
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SoldBeehives;