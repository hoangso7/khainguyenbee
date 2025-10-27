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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import UnifiedStatsCard from '../components/Dashboard/UnifiedStatsCard';
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
    serialNumber: '',
    dateType: 'import_date',
    date: '',
  });

  useEffect(() => {
    dispatch(fetchBeehives({ 
      ...filters, 
      sort_field: sort.field,
      sort_order: sort.order,
      page: pagination.page 
    }));
    dispatch(fetchBeehiveStats());
  }, [dispatch, filters, sort, pagination.page]);

  const handleSearch = () => {
    const newFilters = {
      serialNumber: searchFilters.serialNumber,
      [searchFilters.dateType]: searchFilters.date,
    };
    dispatch(setFilters(newFilters));
    dispatch(setPage(1));
  };

  const handleClearSearch = () => {
    const clearedFilters = { serialNumber: '', dateType: 'import_date', date: '' };
    setSearchFilters(clearedFilters);
    dispatch(setFilters({ serialNumber: '', import_date: '', split_date: '' }));
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

      {/* Unified Stats Card */}
      <Box sx={{ mb: 3 }}>
        <UnifiedStatsCard stats={stats} />
      </Box>


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
          <Grid container spacing={1} sx={{ mb: 3, margin: 0 }}>
            <Grid item xs={12} sm={6} md={3} sx={{ padding: '4px' }}>
              <TextField
                fullWidth
                label="Tìm theo mã tổ"
                value={searchFilters.serialNumber}
                onChange={(e) => setSearchFilters({ ...searchFilters, serialNumber: e.target.value })}
                size="small"
                placeholder="VD: TO001"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ padding: '4px' }}>
              <FormControl fullWidth size="small">
                <InputLabel>Loại ngày</InputLabel>
                <Select
                  value={searchFilters.dateType}
                  onChange={(e) => setSearchFilters({ ...searchFilters, dateType: e.target.value })}
                  label="Loại ngày"
                >
                  <MenuItem value="import_date">Ngày nhập</MenuItem>
                  <MenuItem value="split_date">Ngày tách</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ padding: '4px' }}>
              <DateInput
                fullWidth
                label={`Tìm theo ${searchFilters.dateType === 'import_date' ? 'ngày nhập' : 'ngày tách'}`}
                value={searchFilters.date}
                onChange={(e) => setSearchFilters({ ...searchFilters, date: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ padding: '4px' }}>
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
            <Grid item xs={12} sm={6} md={3} sx={{ padding: '4px' }}>
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

          {/* Mobile scroll indicator */}
          {isMobile && (
            <Box sx={{ 
              textAlign: 'center', 
              mb: 1, 
              color: 'text.secondary',
              fontSize: '0.75rem'
            }}>
              ← Vuốt ngang để xem thêm cột →
            </Box>
          )}

          {/* Beehives List - Compact Table View for all devices */}
          <TableContainer 
            component={Paper} 
            sx={{ 
              maxHeight: 400,
              width: '100%',
              overflowX: 'auto',
              overflowY: 'auto',
              display: 'block',
              // Enhanced mobile scrolling
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin',
              scrollbarColor: '#D2691E #f1f1f1',
              '&::-webkit-scrollbar': {
                height: 12,
                width: 12,
                WebkitAppearance: 'none',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
                borderRadius: 6,
                WebkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.1)',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#D2691E',
                borderRadius: 6,
                WebkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: '#B8860B',
                },
              },
              '&::-webkit-scrollbar-corner': {
                backgroundColor: '#f1f1f1',
              },
            }}
          >
            <Table stickyHeader sx={{ 
              minWidth: { xs: 500, sm: 800 },
              width: '100%',
              display: 'table'
            }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    padding: { xs: '4px 1px', sm: '16px' },
                    minWidth: { xs: '70px', sm: '150px' },
                    whiteSpace: 'nowrap',
                    backgroundColor: '#f5f5f5',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1
                  }}>
                    <Button
                      onClick={() => handleSort('serial_number')}
                      endIcon={getSortIcon('serial_number')}
                      sx={{ 
                        textTransform: 'none', 
                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                        minWidth: 'auto',
                        p: { xs: 0.5, sm: 1 }
                      }}
                    >
                      Mã tổ
                    </Button>
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    padding: { xs: '4px 1px', sm: '16px' },
                    minWidth: { xs: '70px', sm: '150px' },
                    whiteSpace: 'nowrap',
                    backgroundColor: '#f5f5f5',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1
                  }}>
                    <Button
                      onClick={() => handleSort('import_date')}
                      endIcon={getSortIcon('import_date')}
                      sx={{ 
                        textTransform: 'none', 
                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                        minWidth: 'auto',
                        p: { xs: 0.5, sm: 1 }
                      }}
                    >
                      Ngày nhập
                    </Button>
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    padding: { xs: '4px 1px', sm: '16px' },
                    minWidth: { xs: '70px', sm: '150px' },
                    whiteSpace: 'nowrap',
                    backgroundColor: '#f5f5f5',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1
                  }}>
                    <Button
                      onClick={() => handleSort('split_date')}
                      endIcon={getSortIcon('split_date')}
                      sx={{ 
                        textTransform: 'none', 
                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                        minWidth: 'auto',
                        p: { xs: 0.5, sm: 1 }
                      }}
                    >
                      Ngày tách
                    </Button>
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    padding: { xs: '4px 1px', sm: '16px' },
                    minWidth: { xs: '70px', sm: '150px' },
                    whiteSpace: 'nowrap',
                    backgroundColor: '#f5f5f5',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1
                  }}>
                    <Button
                      onClick={() => handleSort('health_status')}
                      endIcon={getSortIcon('health_status')}
                      sx={{ 
                        textTransform: 'none', 
                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                        minWidth: 'auto',
                        p: { xs: 0.5, sm: 1 }
                      }}
                    >
                      Sức khỏe
                    </Button>
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    padding: { xs: '4px 1px', sm: '16px' },
                    minWidth: { xs: '70px', sm: '150px' },
                    whiteSpace: 'nowrap',
                    backgroundColor: '#f5f5f5',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1
                  }}>
                    <Button
                      onClick={() => handleSort('status')}
                      endIcon={getSortIcon('status')}
                      sx={{ 
                        textTransform: 'none', 
                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                        minWidth: 'auto',
                        p: { xs: 0.5, sm: 1 }
                      }}
                    >
                      Trạng thái
                    </Button>
                  </TableCell>
                  <TableCell sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    padding: { xs: '4px 1px', sm: '16px' },
                    minWidth: { xs: '70px', sm: '150px' },
                    whiteSpace: 'nowrap',
                    backgroundColor: '#f5f5f5',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1
                  }}>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                        color: 'text.primary'
                      }}
                    >
                      Thao tác
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeBeehives.map((beehive) => (
                  <TableRow key={beehive.serial_number} hover>
                    <TableCell sx={{ 
                      py: { xs: 0.5, sm: 1 },
                      px: { xs: '1px', sm: '16px' },
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      whiteSpace: 'nowrap',
                      minWidth: { xs: '70px', sm: '150px' }
                    }}>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {beehive.serial_number || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ 
                      py: { xs: 0.5, sm: 1 },
                      px: { xs: '1px', sm: '16px' },
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      whiteSpace: 'nowrap',
                      minWidth: { xs: '70px', sm: '150px' }
                    }}>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {beehive.import_date ? new Date(beehive.import_date).toLocaleDateString('vi-VN') : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ 
                      py: { xs: 0.5, sm: 1 },
                      px: { xs: '1px', sm: '16px' },
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      whiteSpace: 'nowrap',
                      minWidth: { xs: '70px', sm: '150px' }
                    }}>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {beehive.split_date 
                          ? new Date(beehive.split_date).toLocaleDateString('vi-VN')
                          : 'Chưa tách'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ 
                      py: { xs: 0.5, sm: 1 },
                      px: { xs: '1px', sm: '16px' },
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      whiteSpace: 'nowrap',
                      minWidth: { xs: '70px', sm: '150px' }
                    }}>
                      <Chip
                        icon={<img src={getHealthStatusIcon(beehive.health_status || 'Unknown')} alt={`Tình trạng sức khỏe: ${beehive.health_status || 'Unknown'}`} style={{ width: 12, height: 12 }} />}
                        label={beehive.health_status || 'Unknown'}
                        color={getHealthStatusColor(beehive.health_status || 'Unknown')}
                        size="small"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      py: { xs: 0.5, sm: 1 },
                      px: { xs: '1px', sm: '16px' },
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      whiteSpace: 'nowrap',
                      minWidth: { xs: '70px', sm: '150px' }
                    }}>
                      <Chip
                        label="Đang quản lý"
                        color="success"
                        size="small"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      py: { xs: 0.5, sm: 1 },
                      px: { xs: '1px', sm: '16px' },
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      whiteSpace: 'nowrap',
                      minWidth: { xs: '70px', sm: '150px' }
                    }}>
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
