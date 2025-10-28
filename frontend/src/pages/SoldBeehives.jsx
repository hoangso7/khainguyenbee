import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../lib/api.js';
import { formatDate } from '../utils/dateUtils';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { ArrowLeft, Search, Eye } from 'lucide-react';
import beeIcon from '../assets/bee-icon.png';

const SoldBeehives = () => {
  const navigate = useNavigate();
  const [beehives, setBeehives] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    loadSoldBeehives();
  }, []);

  const loadSoldBeehives = async () => {
    try {
      let allBeehives = [];
      let page = 1;
      let hasMore = true;
      const perPage = 100; // Maximum allowed by backend

      while (hasMore) {
        const response = await apiService.getSoldBeehives(page, perPage);
        const beehives = response.beehives || [];
        allBeehives = [...allBeehives, ...beehives];
        
        // Check if there are more pages
        hasMore = beehives.length === perPage;
        page++;
      }

      setBeehives(allBeehives);
    } catch (error) {
      console.error('Error loading sold beehives:', error);
    }
  };

  const filteredBeehives = beehives.filter(b => {
    const searchLower = searchTerm.toLowerCase();
    return (
      b.serial_number.toLowerCase().includes(searchLower) ||
      b.qr_token.toLowerCase().includes(searchLower) ||
      (b.notes && b.notes.toLowerCase().includes(searchLower)) ||
      (b.sold_date && b.sold_date.includes(searchLower)) ||
      (b.sold_date && new Date(b.sold_date).toLocaleDateString('vi-VN').includes(searchLower))
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

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const getHealthBadgeVariant = (status) => {
    switch (status) {
      case 'Tốt':
        return 'default';
      case 'Yếu':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getHealthBadgeClass = (status) => {
    switch (status) {
      case 'Tốt':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Yếu':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="bg-gradient-to-r from-amber-500 to-yellow-500 border-b border-amber-400 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <div className="flex items-center gap-2">
              <img src={beeIcon} alt="KBee" className="w-6 h-6" />
              <span className="text-white font-semibold">KBee Manager</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tổ ong đã bán</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Tổng số: {beehives.length}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo mã tổ, ghi chú hoặc ngày bán..."
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
                    <TableHead className="font-semibold">Mã tổ</TableHead>
                    <TableHead className="font-semibold">Ngày nhập</TableHead>
                    <TableHead className="font-semibold">Ngày bán</TableHead>
                    <TableHead className="font-semibold">Tình trạng</TableHead>
                    <TableHead className="font-semibold">Chủng loại</TableHead>
                    <TableHead className="font-semibold">Ghi chú</TableHead>
                    <TableHead className="text-right font-semibold">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBeehives.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500">
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedBeehives.map((beehive) => (
                      <TableRow key={beehive.serial_number}>
                        <TableCell>{beehive.serial_number}</TableCell>
                        <TableCell>{formatDate(beehive.import_date)}</TableCell>
                        <TableCell>{beehive.sold_date ? formatDate(beehive.sold_date) : '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getHealthBadgeClass(beehive.health_status)}>
                            {beehive.health_status}
                          </Badge>
                        </TableCell>
                        <TableCell>{beehive.species || 'Furva Vàng'}</TableCell>
                        <TableCell className="max-w-xs truncate">{beehive.notes || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/beehive/${beehive.qr_token}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {/* Pagination Controls */}
              {filteredBeehives.length > 0 && (
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
              {filteredBeehives.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Không có dữ liệu</p>
              ) : (
                paginatedBeehives.map((beehive) => (
                  <Card key={beehive.serial_number}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{beehive.serial_number}</CardTitle>
                          <p className="text-sm text-gray-500">Ngày bán: {beehive.sold_date ? formatDate(beehive.sold_date) : '-'}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className={getHealthBadgeClass(beehive.health_status)}>
                            {beehive.health_status}
                          </Badge>
                          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                            {beehive.species || 'Furva Vàng'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-gray-600">Ngày nhập: {formatDate(beehive.import_date)}</p>
                      {beehive.notes && (
                        <p className="text-sm text-gray-600">{beehive.notes}</p>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/beehive/${beehive.qr_token}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
              {/* Mobile Pagination */}
              {filteredBeehives.length > 0 && (
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
    </div>
  );
};

export default SoldBeehives;