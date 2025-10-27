import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../lib/storage';
import { Beehive } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';
import { ArrowLeft, FileDown, Search } from 'lucide-react';
import { jsPDF } from 'jspdf';
import QRCodeLib from 'qrcode';

export function ExportPDF() {
  const navigate = useNavigate();
  const [beehives, setBeehives] = useState<Beehive[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const user = storage.getCurrentUser();
    const allBeehives = storage.getBeehives();
    const userBeehives = allBeehives.filter(b => b.user_id === user?.id && !b.is_sold);
    setBeehives(userBeehives);
  }, []);

  const toggleSelection = (serialNumber: string) => {
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

  const filteredBeehives = beehives.filter(b =>
    b.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.import_date.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.split_date && b.split_date.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const generatePDF = async () => {
    if (selectedIds.size === 0) {
      toast.error('Vui lòng chọn ít nhất một tổ ong');
      return;
    }

    setGenerating(true);

    try {
      const selectedBeehives = beehives.filter(b => selectedIds.has(b.serial_number));
      const user = storage.getCurrentUser();

      const pdf = new jsPDF();
      let isFirstPage = true;

      for (const beehive of selectedBeehives) {
        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;

        // Generate QR code
        const publicUrl = `${window.location.origin}/qr/${beehive.qr_token}`;
        const qrDataUrl = await QRCodeLib.toDataURL(publicUrl, { width: 400 });

        // Add content
        pdf.setFontSize(20);
        pdf.text('KBee Manager', 105, 20, { align: 'center' });

        pdf.setFontSize(12);
        pdf.text(user?.business_name || '', 105, 30, { align: 'center' });

        // QR Code
        pdf.addImage(qrDataUrl, 'PNG', 55, 40, 100, 100);

        // Beehive info
        pdf.setFontSize(16);
        pdf.text(`Ma to: ${beehive.serial_number}`, 105, 155, { align: 'center' });

        pdf.setFontSize(10);
        let yPos = 170;
        
        pdf.text(`Ma QR: ${beehive.qr_token}`, 20, yPos);
        yPos += 7;
        
        pdf.text(`Ngay nhap: ${beehive.import_date}`, 20, yPos);
        yPos += 7;

        if (beehive.split_date) {
          pdf.text(`Ngay tach dan: ${beehive.split_date}`, 20, yPos);
          yPos += 7;
        }

        pdf.text(`Tinh trang: ${beehive.health_status}`, 20, yPos);
        yPos += 7;

        if (beehive.notes) {
          pdf.text('Ghi chu:', 20, yPos);
          yPos += 7;
          const lines = pdf.splitTextToSize(beehive.notes, 170);
          pdf.text(lines, 20, yPos);
        }

        // Footer
        pdf.setFontSize(8);
        pdf.text(`Lien he: ${user?.contact_info || ''}`, 105, 280, { align: 'center' });
      }

      pdf.save(`KBee_Export_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(`Đã xuất PDF với ${selectedIds.size} tổ ong`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Có lỗi khi tạo PDF');
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
            <CardTitle>Xuất PDF</CardTitle>
            <CardDescription>
              Chọn các tổ ong để xuất file PDF kèm mã QR
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {beehives.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Không có tổ ong nào để xuất
              </p>
            ) : (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm theo mã tổ, ngày nhập hoặc ngày tách..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

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
                  {filteredBeehives.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Không tìm thấy tổ ong nào
                    </p>
                  ) : (
                    filteredBeehives.map((beehive) => (
                      <div
                        key={beehive.serial_number}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <Checkbox
                          checked={selectedIds.has(beehive.serial_number)}
                          onCheckedChange={() => toggleSelection(beehive.serial_number)}
                          id={`pdf-${beehive.serial_number}`}
                        />
                        <label
                          htmlFor={`pdf-${beehive.serial_number}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p>{beehive.serial_number}</p>
                              <p className="text-sm text-gray-500">{beehive.health_status}</p>
                            </div>
                            <p className="text-sm text-gray-500">{beehive.import_date}</p>
                          </div>
                        </label>
                      </div>
                    ))
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    File PDF sẽ chứa mã QR và thông tin chi tiết của mỗi tổ ong.
                    Mỗi tổ ong sẽ được in trên một trang riêng.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={generatePDF}
                    disabled={generating || selectedIds.size === 0}
                    className="flex-1"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    {generating ? 'Đang tạo PDF...' : `Xuất PDF (${selectedIds.size} tổ)`}
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
    </div>
  );
}
