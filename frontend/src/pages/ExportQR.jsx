import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowLeft, Download } from 'lucide-react';
import QRCodeLib from 'qrcode';

const ExportQR = () => {
  const navigate = useNavigate();
  const [beehives, setBeehives] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [generating, setGenerating] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    loadBeehives();
  }, []);

  const loadBeehives = async () => {
    try {
      const response = await apiService.getBeehives(1, 1000); // Get all beehives
      setBeehives(response.beehives || []);
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
    if (selectedIds.size === beehives.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(beehives.map(b => b.serial_number)));
    }
  };

  const generateAndDownloadQRs = async () => {
    if (selectedIds.size === 0) {
      toast.error('Vui lòng chọn ít nhất một tổ ong');
      return;
    }

    setGenerating(true);

    try {
      const selectedBeehives = beehives.filter(b => selectedIds.has(b.serial_number));

      for (const beehive of selectedBeehives) {
        const publicUrl = `${window.location.origin}/qr/${beehive.qr_token}`;
        const qrUrl = await QRCodeLib.toDataURL(publicUrl, { width: 400 });

        // Download each QR code
        const link = document.createElement('a');
        link.download = `QR_${beehive.serial_number}.png`;
        link.href = qrUrl;
        link.click();

        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      toast.success(`Đã tải ${selectedIds.size} mã QR`);
    } catch (error) {
      console.error('Error generating QR codes:', error);
      toast.error('Có lỗi khi tạo mã QR');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Xuất mã QR</CardTitle>
            <CardDescription>
              Chọn các tổ ong để tải mã QR
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {beehives.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Không có tổ ong nào để xuất
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedIds.size === beehives.length}
                      onCheckedChange={toggleSelectAll}
                      id="select-all"
                    />
                    <label htmlFor="select-all" className="text-sm cursor-pointer">
                      Chọn tất cả ({beehives.length})
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Đã chọn: {selectedIds.size}
                  </p>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {beehives.map((beehive) => (
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
                            <p className="text-sm text-gray-500 font-mono">{beehive.qr_token}</p>
                          </div>
                          <p className="text-sm text-gray-500">{beehive.import_date}</p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={generateAndDownloadQRs}
                    disabled={generating || selectedIds.size === 0}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {generating ? 'Đang tạo...' : `Tải ${selectedIds.size} mã QR`}
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/')}>
                    Hủy
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ExportQR;