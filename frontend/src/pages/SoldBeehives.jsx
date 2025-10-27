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
    serialNumber: '',
    dateType: 'import_date',
    date: '',
  });

  useEffect(() => {
    dispatch(fetchSoldBeehives({ 
      ...filters, 
      sort_field: sort.field,
      sort_order: sort.order,
      page: pagination.page 
    }));
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
    dispatch(setFilters({ serialNumber: '', import_date: '', sold_date: '' }));
    dispatch(setPage(1));
  };

  const handleSort = (field) => {
    const newOrder = sort.field === field && sort.order === 'asc' ? 'desc' : 'asc';
    dispatch(setSort({ field, order: newOrder }));
    dispatch(fetchSoldBeehives({ 
      ...filters, 
      sort_field: field,
      sort_order: newOrder,
      page: pagination.page 
    }));
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
      <Grid container spacing={2} sx={{ mb: 3, margin: 0 }}>
        <Grid item xs={12} sx={{ padding: '4px' }}>
          <StatsCard
            title="Tổng số tổ đã bán"
            value={stats?.sold || 0}
            icon="💰"
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card>
        <CardContent sx={{ p: { xs: 1, sm: 3 } }}>
          <Box mb={3}>
            <Typography variant="h5" component="h1">
              Danh sách tổ ong đã bán
            </Typography>
          </Box>

          {/* Search Form */}
          <Grid container spacing={2} sx={{ mb: 3, margin: 0 }}>
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
                  <MenuItem value="sold_date">Ngày bán</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ padding: '4px' }}>
              <DateInput
                fullWidth
                label={`Tìm theo ${searchFilters.dateType === 'import_date' ? 'ngày nhập' : 'ngày bán'}`}
                value={searchFilters.date}
                onChange={(e) => setSearchFilters({ ...searchFilters, date: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ padding: '4px' }}>
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
            <Grid item xs={12} sm={6} md={3} sx={{ padding: '4px' }}>
              <Typography variant="body2" color="text.secondary" align="right">
                Hiển thị {soldBeehives.length}/{pagination?.total || 0} tổ ong
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
              position: 'relative',
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
              width: 'max-content',
              display: 'table',
              tableLayout: 'fixed'
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
                      onClick={() => handleSort('sold_date')}
                      endIcon={getSortIcon('sold_date')}
                      sx={{ 
                        textTransform: 'none', 
                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                        minWidth: 'auto',
                        p: { xs: 0.5, sm: 1 }
                      }}
                    >
                      Ngày bán
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
                  }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {soldBeehives.map((beehive) => (
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
                        icon={<img src={getHealthStatusIcon(beehive.health_status || 'Unknown')} alt={beehive.health_status || 'Unknown'} style={{ width: 12, height: 12 }} />}
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
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {beehive.sold_date 
                          ? new Date(beehive.sold_date).toLocaleDateString('vi-VN')
                          : 'N/A'
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
                      <Stack direction="row" spacing={0.25}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/beehive/${beehive.qr_token || ''}`)}
                          title="Xem QR Code"
                          sx={{ p: { xs: 0.25, sm: 0.5 } }}
                        >
                          <QrCodeIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleUnsellBeehive(beehive.serial_number)}
                          title="Hoàn trả về quản lý"
                          color="success"
                          sx={{ p: { xs: 0.25, sm: 0.5 } }}
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
                onClick={() => navigate('/')}
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