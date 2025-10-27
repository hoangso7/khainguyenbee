import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../lib/storage';
import { Beehive } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, Search, QrCode, FileDown, ShoppingCart, Settings, LogOut, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function Dashboard() {
  const navigate = useNavigate();
  const [beehives, setBeehives] = useState<Beehive[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const user = storage.getCurrentUser();

  useEffect(() => {
    loadBeehives();
  }, []);

  const loadBeehives = () => {
    const allBeehives = storage.getBeehives();
    const userBeehives = allBeehives.filter(b => b.user_id === user?.id && !b.is_sold);
    setBeehives(userBeehives);
  };

  const handleDelete = (serialNumber: string) => {
    if (confirm(`Bạn có chắc muốn xóa tổ ong ${serialNumber}?`)) {
      storage.deleteBeehive(serialNumber);
      toast.success('Đã xóa tổ ong');
      loadBeehives();
    }
  };

  const handleLogout = () => {
    storage.logout();
    toast.success('Đã đăng xuất');
    navigate('/login');
  };

  const filteredBeehives = beehives.filter(b =>
    b.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.import_date.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.split_date && b.split_date.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.notes && b.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: beehives.length,
    healthy: beehives.filter(b => b.health_status === 'Tốt').length,
    normal: beehives.filter(b => b.health_status === 'Bình thường').length,
    weak: beehives.filter(b => b.health_status === 'Yếu').length,
  };

  const getHealthBadgeVariant = (status: string) => {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-amber-600">KBee Manager</h1>
              <p className="text-sm text-gray-600">{user?.business_name}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
                <Settings className="w-4 h-4 mr-2" />
                Cài đặt
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Button onClick={() => navigate('/add-beehive')} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Thêm tổ ong
          </Button>
          <Button onClick={() => navigate('/bulk-add')} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Thêm hàng loạt
          </Button>
          <Button onClick={() => navigate('/export-qr')} variant="outline" className="w-full">
            <QrCode className="w-4 h-4 mr-2" />
            Xuất QR
          </Button>
          <Button onClick={() => navigate('/export-pdf')} variant="outline" className="w-full">
            <FileDown className="w-4 h-4 mr-2" />
            Xuất PDF
          </Button>
          <Button onClick={() => navigate('/sold')} variant="outline" className="w-full">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Đã bán
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách tổ ong</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo mã tổ, ngày nhập, ngày tách hoặc ghi chú..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

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
                  {filteredBeehives.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500">
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBeehives.map((beehive) => (
                      <TableRow key={beehive.serial_number}>
                        <TableCell>{beehive.serial_number}</TableCell>
                        <TableCell>{beehive.import_date}</TableCell>
                        <TableCell>{beehive.split_date || '-'}</TableCell>
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
                              onClick={() => navigate(`/beehive/${beehive.serial_number}`)}
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
              {filteredBeehives.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Không có dữ liệu</p>
              ) : (
                filteredBeehives.map((beehive) => (
                  <Card key={beehive.serial_number}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{beehive.serial_number}</CardTitle>
                          <CardDescription>{beehive.import_date}</CardDescription>
                        </div>
                        <Badge variant={getHealthBadgeVariant(beehive.health_status)}>
                          {beehive.health_status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {beehive.split_date && (
                        <p className="text-sm text-gray-600">Ngày tách: {beehive.split_date}</p>
                      )}
                      {beehive.notes && (
                        <p className="text-sm text-gray-600">{beehive.notes}</p>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => navigate(`/beehive/${beehive.serial_number}`)}
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
}
