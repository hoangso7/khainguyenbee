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

const SoldBeehives = () => {
  const navigate = useNavigate();
  const [beehives, setBeehives] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredBeehives = beehives.filter(b =>
    b.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.qr_token.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.notes && b.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      <header className="bg-gradient-to-r from-amber-500 to-yellow-500 border-b border-amber-400 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
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
                placeholder="Tìm kiếm..."
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
                    <TableHead>Ngày bán</TableHead>
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
                        <TableCell>{formatDate(beehive.import_date)}</TableCell>
                        <TableCell>{beehive.sold_date ? formatDate(beehive.sold_date) : '-'}</TableCell>
                        <TableCell>
                          <Badge variant={getHealthBadgeVariant(beehive.health_status)}>
                            {beehive.health_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{beehive.notes || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/beehive/${beehive.serial_number}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
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
                          <p className="text-sm text-gray-500">Ngày bán: {beehive.sold_date ? formatDate(beehive.sold_date) : '-'}</p>
                        </div>
                        <Badge variant={getHealthBadgeVariant(beehive.health_status)}>
                          {beehive.health_status}
                        </Badge>
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
                        onClick={() => navigate(`/beehive/${beehive.serial_number}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </Button>
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

export default SoldBeehives;