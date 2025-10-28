import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../lib/api.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Search, QrCode, FileDown, ShoppingCart, Settings, LogOut, Eye, Edit, Trash2, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '../utils/dateUtils';

const Dashboard = () => {
  const navigate = useNavigate();
  const [beehives, setBeehives] = useState([]);
  const [stats, setStats] = useState({ total: 0, good: 0, normal: 0, weak: 0 });
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    serialNumber: '',
    import_date: '',
    split_date: '',
    notes: ''
  });

  const loadData = useCallback(async () => {
    try {
      // Prepare search parameters
      const searchParams = {};
      
      // If searchTerm is provided, use it for general search
      if (searchTerm.trim()) {
        // Try to parse as date first
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(searchTerm.trim())) {
          // If it's a date format, search in import_date
          searchParams.import_date = searchTerm.trim();
        } else {
          // Otherwise search in serial number and notes
          searchParams.serialNumber = searchTerm.trim();
          searchParams.notes = searchTerm.trim();
        }
      }
      
      // Add specific filters (these override searchTerm if both are provided)
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          searchParams[key] = filters[key];
        }
      });
      
      const [beehivesResponse, statsResponse, userResponse] = await Promise.all([
        apiService.getBeehives(1, 10, searchParams),
        apiService.getStats(),
        apiService.getCurrentUser()
      ]);
      
      setBeehives(beehivesResponse.beehives || []);
      // Map backend stats to frontend format
      setStats({
        total: statsResponse.total || 0,
        good: statsResponse.healthy || 0,
        normal: statsResponse.active - statsResponse.healthy || 0,
        weak: 0, // Backend doesn't track weak separately
      });
      setUser(userResponse);
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
      console.error('Error loading data:', error);
    }
  }, [searchTerm, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      serialNumber: '',
      import_date: '',
      split_date: '',
      notes: ''
    });
    setSearchTerm('');
  };

  const hasActiveFilters = () => {
    return searchTerm.trim() || Object.values(filters).some(value => value.trim());
  };

  const handleDelete = async (serialNumber) => {
    if (confirm('Bạn có chắc muốn xóa tổ ong này?')) {
      try {
        await apiService.deleteBeehive(serialNumber);
        toast.success('Đã xóa tổ ong');
        loadData();
      } catch {
        toast.error('Không thể xóa tổ ong');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      toast.success('Đã đăng xuất');
      navigate('/login');
    } catch {
      // Even if logout fails on server, clear local token
      apiService.setToken(null);
      navigate('/login');
    }
  };

  const getHealthBadgeVariant = (status) => {
    switch (status) {
      case 'Tốt':
        return 'default';
      case 'Bình thường':
        return 'secondary';
      case 'Yếu':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-500 to-yellow-500 border-b border-amber-400 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-2xl">KBee Manager</h1>
              <p className="text-sm text-amber-50">{user?.business_name}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/profile')} className="bg-white/90 hover:bg-white">
                <Settings className="w-4 h-4 mr-2" />
                Cài đặt
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="bg-white/90 hover:bg-white">
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tổng số tổ</CardDescription>
              <CardTitle>{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tổ khỏe</CardDescription>
              <CardTitle className="text-green-600">{stats.healthy}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tổ bình thường</CardDescription>
              <CardTitle className="text-blue-600">{stats.normal}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tổ yếu</CardDescription>
              <CardTitle className="text-red-600">{stats.weak}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button onClick={() => navigate('/add-beehive')} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Thêm tổ ong
          </Button>
          <Button onClick={() => navigate('/bulk-add')} variant="outline" className="w-full border-amber-500 text-amber-700 hover:bg-amber-50">
            <Plus className="w-4 h-4 mr-2" />
            Thêm hàng loạt
          </Button>
          <Button onClick={() => navigate('/export-pdf')} variant="outline" className="w-full border-amber-500 text-amber-700 hover:bg-amber-50">
            <FileDown className="w-4 h-4 mr-2" />
            Xuất PDF
          </Button>
          <Button onClick={() => navigate('/sold')} variant="outline" className="w-full border-amber-500 text-amber-700 hover:bg-amber-50">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Đã bán
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Danh sách tổ ong</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Bộ lọc
                </Button>
                {hasActiveFilters() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm nhanh: mã tổ, ngày (YYYY-MM-DD), hoặc ghi chú..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Mã tổ
                  </label>
                  <Input
                    placeholder="Nhập mã tổ..."
                    value={filters.serialNumber}
                    onChange={(e) => handleFilterChange('serialNumber', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Ngày nhập
                  </label>
                  <Input
                    type="date"
                    value={filters.import_date}
                    onChange={(e) => handleFilterChange('import_date', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Ngày tách
                  </label>
                  <Input
                    type="date"
                    value={filters.split_date}
                    onChange={(e) => handleFilterChange('split_date', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Ghi chú
                  </label>
                  <Input
                    placeholder="Tìm trong ghi chú..."
                    value={filters.notes}
                    onChange={(e) => handleFilterChange('notes', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã tổ</TableHead>
                    <TableHead>Ngày nhập</TableHead>
                    <TableHead>Ngày tách</TableHead>
                    <TableHead>Tình trạng</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {beehives.length === 0 ? (
                <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500">
                        Không có dữ liệu
                  </TableCell>
                    </TableRow>
                  ) : (
                    beehives.map((beehive) => (
                      <TableRow key={beehive.serial_number}>
                        <TableCell>{beehive.serial_number}</TableCell>
                        <TableCell>{formatDate(beehive.import_date)}</TableCell>
                        <TableCell>{beehive.split_date ? formatDate(beehive.split_date) : '-'}</TableCell>
                        <TableCell>
                          <Badge variant={getHealthBadgeVariant(beehive.health_status)}>
                            {beehive.health_status}
                          </Badge>
                  </TableCell>
                        <TableCell className="max-w-xs truncate">{beehive.notes || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                    <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/beehive/${beehive.qr_token}`)}
                            >
                              <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/edit-beehive/${beehive.serial_number}`)}
                            >
                              <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(beehive.serial_number)}
                            >
                              <Trash2 className="w-4 h-4" />
                    </Button>
                          </div>
                  </TableCell>
                </TableRow>
                    ))
                  )}
              </TableBody>
            </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {beehives.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Không có dữ liệu</p>
              ) : (
                beehives.map((beehive) => (
                  <Card key={beehive.serial_number}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{beehive.serial_number}</CardTitle>
                          <CardDescription>{formatDate(beehive.import_date)}</CardDescription>
                        </div>
                        <Badge variant={getHealthBadgeVariant(beehive.health_status)}>
                          {beehive.health_status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {beehive.split_date && (
                        <p className="text-sm text-gray-600">Ngày tách: {formatDate(beehive.split_date)}</p>
                      )}
                      {beehive.notes && (
                        <p className="text-sm text-gray-600">{beehive.notes}</p>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => navigate(`/beehive/${beehive.qr_token}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Xem
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => navigate(`/edit-beehive/${beehive.serial_number}`)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Sửa
                        </Button>
              <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(beehive.serial_number)}
                        >
                          <Trash2 className="w-4 h-4" />
              </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
          )}
            </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Dashboard;
