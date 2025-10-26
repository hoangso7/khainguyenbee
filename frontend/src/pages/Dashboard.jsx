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
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchBeehives,
  fetchBeehiveStats,
  sellBeehive,
  deleteBeehive,
  setFilters,
  setSort,
  setPage,
} from '../store/slices/beehiveSlice';
import StatsCard from '../components/Dashboard/StatsCard';
import BeehiveCard from '../components/Dashboard/BeehiveCard';
import HealthChart from '../components/Dashboard/HealthChart';
import AccessibleIconButton from '../components/common/AccessibleIconButton';
import DateInput from '../components/common/DateInput';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const {
    activeBeehives,
    stats,
    healthStats,
    pagination,
    filters,
    sort,
    loading,
    error,
  } = useSelector((state) => state.beehives);

  const [searchFilters, setSearchFilters] = useState({
    importDate: filters.importDate,
    splitDate: filters.splitDate,
  });

  useEffect(() => {
    dispatch(fetchBeehives({ ...filters, ...sort, page: pagination.page }));
    dispatch(fetchBeehiveStats());
  }, [dispatch, filters, sort, pagination.page]);

  const handleSearch = () => {
    dispatch(setFilters(searchFilters));
    dispatch(setPage(1));
  };

  const handleClearSearch = () => {
    const clearedFilters = { importDate: '', splitDate: '' };
    setSearchFilters(clearedFilters);
    dispatch(setFilters(clearedFilters));
    dispatch(setPage(1));
  };

  const handleSort = (field) => {
    const newOrder = sort.field === field && sort.order === 'asc' ? 'desc' : 'asc';
    dispatch(setSort({ field, order: newOrder }));
    dispatch(setPage(1));
  };

  const handlePageChange = (event, page) => {
    dispatch(setPage(page));
  };

  const handleSellBeehive = async (serialNumber) => {
    if (window.confirm('Bạn có chắc muốn đánh dấu tổ này đã bán?')) {
      try {
        await dispatch(sellBeehive(serialNumber)).unwrap();
      } catch (error) {
        console.error('Failed to sell beehive:', error);
      }
    }
  };

  const handleDeleteBeehive = async (serialNumber) => {
    if (window.confirm('Bạn có chắc muốn xóa tổ ong này?')) {
      try {
        await dispatch(deleteBeehive(serialNumber)).unwrap();
      } catch (error) {
        console.error('Failed to delete beehive:', error);
      }
    }
  };

  const getSortIcon = (field) => {
    if (sort.field !== field) return null;
    return sort.order === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />;
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

  if (loading && activeBeehives.length === 0) {
    return (
      <Box 
        role="status"
        aria-live="polite"
        aria-label="Đang tải dữ liệu tổ ong"
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
          Đang tải dữ liệu tổ ong...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={6} md={3}>
          <StatsCard
            title="Tổng số tổ ong"
            value={stats?.total || 0}
            icon="🐝"
            color="primary"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatsCard
            title="Tổ đang quản lý"
            value={stats?.active || 0}
            icon="📊"
            color="info"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatsCard
            title="Tổ đã bán"
            value={stats?.sold || 0}
            icon="💰"
            color="warning"
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatsCard
            title="Tổ khỏe mạnh"
            value={stats?.healthy || 0}
            icon="💚"
            color="success"
          />
        </Grid>
      </Grid>

      {/* Health Chart */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <HealthChart data={healthStats} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                Thông tin chi tiết
              </Typography>
              {healthStats && Object.keys(healthStats).length > 0 ? (
                Object.entries(healthStats).map(([health, count]) => (
                  <Box key={health} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Chip
                      icon={<img src={getHealthStatusIcon(health || 'Unknown')} alt={health || 'Unknown'} style={{ width: 16, height: 16 }} />}
                      label={health || 'Unknown'}
                      color={getHealthStatusColor(health || 'Unknown')}
                      size="small"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    />
                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {count} tổ
                    </Typography>
                  </Box>
                ))
              ) : (
                <Box 
                  display="flex" 
                  justifyContent="center" 
                  alignItems="center" 
                  sx={{ 
                    flexDirection: 'column',
                    gap: 1,
                    py: 2
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Chưa có dữ liệu sức khỏe
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Dữ liệu sẽ hiển thị khi có tổ ong
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            mb={3}
            flexDirection={{ xs: 'column', sm: 'row' }}
            gap={{ xs: 2, sm: 0 }}
          >
            <Typography variant="h5" component="h1" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              Danh Sách Tổ Ong
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} width={{ xs: '100%', sm: 'auto' }}>
              <Button
                variant="contained"
                color="warning"
                startIcon={<MoneyIcon />}
                onClick={() => navigate('/sold')}
                fullWidth={isMobile ? true : false}
                size="small"
              >
                Tổ đã bán
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/add')}
                fullWidth={isMobile ? true : false}
                size="small"
              >
                Thêm tổ ong
              </Button>
            </Stack>
          </Box>

          {/* Search Form */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <DateInput
                fullWidth
                label="Tìm theo ngày nhập"
                value={searchFilters.importDate}
                onChange={(e) => setSearchFilters({ ...searchFilters, importDate: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DateInput
                fullWidth
                label="Tìm theo ngày tách"
                value={searchFilters.splitDate}
                onChange={(e) => setSearchFilters({ ...searchFilters, splitDate: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleSearch}
                  fullWidth={isMobile ? true : false}
                  size="small"
                >
                  Tìm kiếm
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearSearch}
                  fullWidth={isMobile ? true : false}
                  size="small"
                >
                  Xóa
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                align="right"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Hiển thị {activeBeehives.length}/{pagination?.total || 0} tổ ong
              </Typography>
            </Grid>
          </Grid>

          {/* Beehives List - Compact Table View for all devices */}
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <Button
                      onClick={() => handleSort('created_at')}
                      endIcon={getSortIcon('created_at')}
                      sx={{ 
                        textTransform: 'none', 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        minWidth: 'auto',
                        p: { xs: 0.5, sm: 1 }
                      }}
                    >
                      Mã tổ
                    </Button>
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <Button
                      onClick={() => handleSort('import_date')}
                      endIcon={getSortIcon('import_date')}
                      sx={{ 
                        textTransform: 'none', 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        minWidth: 'auto',
                        p: { xs: 0.5, sm: 1 }
                      }}
                    >
                      Ngày nhập
                    </Button>
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <Button
                      onClick={() => handleSort('split_date')}
                      endIcon={getSortIcon('split_date')}
                      sx={{ 
                        textTransform: 'none', 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        minWidth: 'auto',
                        p: { xs: 0.5, sm: 1 }
                      }}
                    >
                      Ngày tách
                    </Button>
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <Button
                      onClick={() => handleSort('health_status')}
                      endIcon={getSortIcon('health_status')}
                      sx={{ 
                        textTransform: 'none', 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        minWidth: 'auto',
                        p: { xs: 0.5, sm: 1 }
                      }}
                    >
                      Sức khỏe
                    </Button>
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <Button
                      onClick={() => handleSort('status')}
                      endIcon={getSortIcon('status')}
                      sx={{ 
                        textTransform: 'none', 
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        minWidth: 'auto',
                        p: { xs: 0.5, sm: 1 }
                      }}
                    >
                      Trạng thái
                    </Button>
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeBeehives.map((beehive) => (
                  <TableRow key={beehive.serial_number} hover>
                    <TableCell sx={{ py: { xs: 0.5, sm: 1 } }}>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {beehive.serial_number || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: { xs: 0.5, sm: 1 } }}>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {beehive.import_date ? new Date(beehive.import_date).toLocaleDateString('vi-VN') : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: { xs: 0.5, sm: 1 } }}>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {beehive.split_date 
                          ? new Date(beehive.split_date).toLocaleDateString('vi-VN')
                          : 'Chưa tách'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: { xs: 0.5, sm: 1 } }}>
                      <Chip
                        icon={<img src={getHealthStatusIcon(beehive.health_status || 'Unknown')} alt={`Tình trạng sức khỏe: ${beehive.health_status || 'Unknown'}`} style={{ width: 12, height: 12 }} />}
                        label={beehive.health_status || 'Unknown'}
                        color={getHealthStatusColor(beehive.health_status || 'Unknown')}
                        size="small"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: { xs: 0.5, sm: 1 } }}>
                      <Chip
                        label="Đang quản lý"
                        color="success"
                        size="small"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: { xs: 0.5, sm: 1 } }}>
                      <Stack direction="row" spacing={0.25}>
                        <AccessibleIconButton
                          ariaLabel={`Chỉnh sửa tổ ong ${beehive.serial_number || 'N/A'}`}
                          title="Chỉnh sửa"
                          onClick={() => navigate(`/edit/${beehive.serial_number || ''}`)}
                          icon={<EditIcon />}
                          size="small"
                          sx={{ p: { xs: 0.25, sm: 0.5 } }}
                        />
                        <AccessibleIconButton
                          ariaLabel={`Xem QR Code tổ ong ${beehive.serial_number || 'N/A'}`}
                          title="Xem QR Code"
                          onClick={() => navigate(`/beehive/${beehive.qr_token || ''}`)}
                          icon={<QrCodeIcon />}
                          size="small"
                          sx={{ p: { xs: 0.25, sm: 0.5 } }}
                        />
                        <AccessibleIconButton
                          ariaLabel={`Đánh dấu đã bán tổ ong ${beehive.serial_number || 'N/A'}`}
                          title="Đánh dấu đã bán"
                          onClick={() => handleSellBeehive(beehive.serial_number)}
                          icon={<MoneyIcon />}
                          color="warning"
                          size="small"
                          sx={{ p: { xs: 0.25, sm: 0.5 } }}
                        />
                        <AccessibleIconButton
                          ariaLabel={`Xóa tổ ong ${beehive.serial_number || 'N/A'}`}
                          title="Xóa"
                          onClick={() => handleDeleteBeehive(beehive.serial_number)}
                          icon={<DeleteIcon />}
                          color="error"
                          size="small"
                          sx={{ p: { xs: 0.25, sm: 0.5 } }}
                        />
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

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

          {activeBeehives.length === 0 && !loading && (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có tổ ong nào
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Hãy thêm tổ ong đầu tiên để bắt đầu quản lý!
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/add')}
                sx={{ mt: 2 }}
              >
                Thêm tổ ong đầu tiên
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
