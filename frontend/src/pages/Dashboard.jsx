import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../lib/api.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { AlertDialog } from '../components/ui/alert-dialog';
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [beehiveToDelete, setBeehiveToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Load all active beehives (paginate) similar to Sold page for consistent search
      let allBeehives = [];
      let page = 1;
      const perPage = 100;
      let hasMore = true;

      while (hasMore) {
        const response = await apiService.getBeehives(page, perPage, {});
        const pageBeehives = (response.beehives || []).filter(b => !b.is_sold);
        allBeehives = [...allBeehives, ...pageBeehives];
        hasMore = (response.beehives || []).length === perPage;
        page += 1;
      }

      setBeehives(allBeehives);
      const [statsResponse, userResponse] = await Promise.all([
        apiService.getStats(),
        apiService.getCurrentUser()
      ]);
      // Compute health breakdown from active beehives and use backend total
      const goodCount = allBeehives.filter(b => b.health_status === 'Tốt').length;
      const normalCount = allBeehives.filter(b => b.health_status === 'Bình thường').length;
      const weakCount = allBeehives.filter(b => b.health_status === 'Yếu').length;
      setStats({
        total: statsResponse.total || 0,
        good: goodCount,
        normal: normalCount,
        weak: weakCount,
      });
      setUser(userResponse);
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  // Derived: filtered beehives (client-side to match Sold page behavior)
  const filteredBeehives = beehives.filter((b) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const importDateLocal = b.import_date ? new Date(b.import_date).toLocaleDateString('vi-VN') : '';
    return (
      (b.serial_number || '').toLowerCase().includes(term) ||
      (b.qr_token || '').toLowerCase().includes(term) ||
      (b.notes || '').toLowerCase().includes(term) ||
      (b.import_date || '').includes(term) ||
      importDateLocal.includes(term)
    );
  });

  const totalItems = filteredBeehives.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * perPage;
  const endIdx = startIdx + perPage;
  const paginatedBeehives = filteredBeehives.slice(startIdx, endIdx);

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filters]);

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

  const handleDelete = (serialNumber) => {
    setBeehiveToDelete(serialNumber);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await apiService.deleteBeehive(beehiveToDelete);
      toast.success('Đã xóa tổ ong');
      loadData();
    } catch {
      toast.error('Không thể xóa tổ ong');
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
              <CardTitle>{loading ? '...' : stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tổ khỏe</CardDescription>
              <CardTitle className="text-green-600">{loading ? '...' : stats.good}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tổ bình thường</CardDescription>
              <CardTitle className="text-blue-600">{loading ? '...' : stats.normal}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tổ yếu</CardDescription>
              <CardTitle className="text-red-600">{loading ? '...' : stats.weak}</CardTitle>
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
                placeholder="Tìm theo mã tổ, ngày nhập, hoặc ghi chú..."
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500">
                        Đang tải dữ liệu...
                      </TableCell>
                    </TableRow>
                  ) : totalItems === 0 ? (
                <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500">
                        Không có dữ liệu
                  </TableCell>
                    </TableRow>
                  ) : (
                    paginatedBeehives.map((beehive) => (
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
              {/* Pagination Controls */}
              {!loading && totalItems > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Hiển thị {startIdx + 1}-{Math.min(endIdx, totalItems)} / Tổng {totalItems}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Trước</Button>
                    <span className="text-sm">Trang {currentPage}/{totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Sau</Button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {loading ? (
                <p className="text-center text-gray-500 py-8">Đang tải dữ liệu...</p>
              ) : totalItems === 0 ? (
                <p className="text-center text-gray-500 py-8">Không có dữ liệu</p>
              ) : (
                paginatedBeehives.map((beehive) => (
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
              {/* Mobile Pagination */}
              {!loading && totalItems > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Hiển thị {startIdx + 1}-{Math.min(endIdx, totalItems)} / Tổng {totalItems}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Trước</Button>
                    <span className="text-sm">Trang {currentPage}/{totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Sau</Button>
                  </div>
                </div>
              )}
            </div>
        </CardContent>
      </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Xác nhận xóa tổ ong"
        description={`Bạn có chắc chắn muốn xóa tổ ong ${beehiveToDelete}? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
};

export default Dashboard;
