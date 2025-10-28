import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../lib/api.js';
import { formatDate } from '../utils/dateUtils';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowLeft, Download } from 'lucide-react';
import beeIcon from '../assets/bee-icon.png';

const ExportPDF = () => {
  const navigate = useNavigate();
  const [beehives, setBeehives] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadBeehives();
  }, []);

  const loadBeehives = async () => {
    try {
      let allBeehives = [];
      let page = 1;
      let hasMore = true;
      const perPage = 100; // Maximum allowed by backend

      while (hasMore) {
        const response = await apiService.getBeehives(page, perPage);
        const beehives = response.beehives || [];
        allBeehives = [...allBeehives, ...beehives];
        
        // Check if there are more pages
        hasMore = beehives.length === perPage;
        page++;
      }

      setBeehives(allBeehives);
    } catch {
      toast.error('Không thể tải danh sách tổ ong');
    }
  };

  const toggleSelection = (serialNumber) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(serialNumber)) {
      newSelected.delete(serialNumber);
    } else {
      newSelected.add(serialNumber);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredBeehives.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBeehives.map(b => b.serial_number)));
    }
  };

  const generateAndDownloadPDF = async () => {
    if (selectedIds.size === 0) {
      toast.error('Vui lòng chọn ít nhất một tổ ong');
      return;
    }

    setGenerating(true);

    try {
      const selectedSerialNumbers = Array.from(selectedIds);
      
      // Call backend API to generate PDF
      const blob = await apiService.exportBulkQRPDF(selectedSerialNumbers);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `Danh_sach_to_ong_${timestamp}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(`Đã tải danh sách ${selectedIds.size} tổ ong`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Có lỗi khi tạo file PDF');
    } finally {
      setGenerating(false);
    }
  };

  // Derived: filtered list by import_date (YYYY-MM-DD)
  const filteredBeehives = beehives.filter((b) => {
    if (!filterDate) return true;
    return (b.import_date || '').startsWith(filterDate);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="bg-gradient-to-r from-amber-500 to-yellow-500 border-b border-amber-400 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-white hover:bg-white/20">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex items-center gap-2">
            <img src={beeIcon} alt="KBee" className="w-7 h-7" />
            <span className="text-white font-semibold">KBee Manager</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Xuất danh sách PDF</CardTitle>
            <CardDescription>
              Chọn các tổ ong để xuất danh sách
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="space-y-1">
                <label htmlFor="filter_date" className="text-sm text-gray-600">Lọc theo ngày nhập</label>
                <input
                  id="filter_date"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm"
                />
              </div>
              {filterDate && (
                <Button variant="outline" onClick={() => setFilterDate('')} className="mt-6 h-9">
                  Xóa lọc
                </Button>
              )}
              <div className="ml-auto text-sm text-gray-600 mt-6">
                Tổng: {filteredBeehives.length}
              </div>
            </div>
            {beehives.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Không có tổ ong nào để xuất
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={filteredBeehives.length > 0 && selectedIds.size === filteredBeehives.length}
                      onCheckedChange={toggleSelectAll}
                      id="select-all"
                    />
                    <label htmlFor="select-all" className="text-sm cursor-pointer">
                      Chọn tất cả ({filteredBeehives.length})
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Đã chọn: {selectedIds.size}
                  </p>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredBeehives.map((beehive) => (
                    <div
                      key={beehive.serial_number}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={selectedIds.has(beehive.serial_number)}
                        onCheckedChange={() => toggleSelection(beehive.serial_number)}
                        id={beehive.serial_number}
                      />
                      <label
                        htmlFor={beehive.serial_number}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p>{beehive.serial_number}</p>
                            <p className="text-sm text-gray-500">{beehive.health_status}</p>
                          </div>
                          <p className="text-sm text-gray-500">{formatDate(beehive.import_date)}</p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={generateAndDownloadPDF}
                    disabled={generating || selectedIds.size === 0}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {generating ? 'Đang tạo...' : `Xuất ${selectedIds.size} tổ ong`}
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/')} className="border-amber-500 text-amber-700 hover:bg-amber-50">
                    Hủy
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExportPDF;
