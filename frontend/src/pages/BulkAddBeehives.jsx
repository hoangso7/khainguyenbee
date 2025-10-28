import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../lib/api.js';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import beeIcon from '../assets/bee-icon.png';

const BulkAddBeehives = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    quantity: '1',
    import_date: new Date().toISOString().split('T')[0],
    health_status: 'Bình thường',
    species: 'Furva Vàng',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate quantity explicitly to allow empty value
    if (formData.quantity === '' || formData.quantity === null || formData.quantity === undefined) {
      toast.error('Vui lòng nhập số lượng tổ ong');
      return;
    }

    const quantityNumber = parseInt(formData.quantity, 10);
    if (Number.isNaN(quantityNumber) || quantityNumber < 1 || quantityNumber > 100) {
      toast.error('Số lượng phải từ 1 đến 100');
      return;
    }

    setLoading(true);

    try {
      const beehives = [];
      for (let i = 0; i < quantityNumber; i++) {
        beehives.push({
          import_date: formData.import_date,
          health_status: formData.health_status,
          species: formData.species,
        });
      }

      // Create beehives sequentially to avoid race conditions
      const results = [];
      for (const beehiveData of beehives) {
        try {
          const result = await apiService.createBeehive(beehiveData);
          results.push(result);
        } catch (error) {
          console.error('Failed to create beehive:', error);
          // Continue with next beehive even if one fails
        }
      }

      if (results.length > 0) {
        toast.success(`Đã thêm ${results.length}/${quantityNumber} tổ ong`);
        
        // Automatically download PDF with QR codes
        try {
          const serialNumbers = results.map(r => r.serial_number);
          const blob = await apiService.exportBulkQRPDF(serialNumbers);
          
          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const timestamp = new Date().toISOString().split('T')[0];
          link.download = `QR_to_ong_${timestamp}.pdf`;
          link.click();
          URL.revokeObjectURL(url);
          
          toast.success('Đã tải xuống file PDF chứa mã QR');
        } catch (pdfError) {
          console.error('PDF download error:', pdfError);
          // Don't show error to user, as beehives were successfully created
          toast.info('Tổ ong đã được tạo thành công. PDF sẽ được cải thiện trong phiên bản tiếp theo.');
        }
        
        navigate('/');
      } else {
        toast.error('Không thể thêm tổ ong nào');
      }
    } catch (error) {
      toast.error(error.message || 'Không thể thêm tổ ong');
    } finally {
      setLoading(false);
    }
  };

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
            <CardTitle>Thêm hàng loạt tổ ong</CardTitle>
            <CardDescription>
              Thêm nhiều tổ ong cùng lúc với thông tin cơ bản
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Số lượng tổ ong <span className="text-red-500">*</span></Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
                <p className="text-sm text-gray-500">Tối đa 100 tổ ong mỗi lần</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="import_date">Ngày nhập <span className="text-red-500">*</span></Label>
                <Input
                  id="import_date"
                  type="date"
                  value={formData.import_date}
                  onChange={(e) => setFormData({ ...formData, import_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="health_status">Tình trạng sức khỏe <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.health_status}
                  onValueChange={(value) => setFormData({ ...formData, health_status: value })}
                >
                  <SelectTrigger id="health_status" className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="Tốt">Tốt</SelectItem>
                    <SelectItem value="Yếu">Yếu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="species">Chủng loại <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.species}
                  onValueChange={(value) => setFormData({ ...formData, species: value })}
                >
                  <SelectTrigger id="species" className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="Furva Vàng">Furva Vàng</SelectItem>
                    <SelectItem value="Furva Đen">Furva Đen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <p className="text-sm text-blue-800 font-medium">
                  Hệ thống sẽ tự động tạo mã tổ ong và mã QR cho {formData.quantity || 0} tổ ong.
                </p>
                <p className="text-sm text-blue-800">
                  ⬇️ Sau khi thêm thành công, file PDF chứa mã QR của các tổ ong sẽ được tự động tải xuống.
                  Bạn có thể cập nhật thông tin chi tiết cho từng tổ sau khi thêm.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
                  {loading ? 'Đang thêm...' : `Thêm ${formData.quantity || 0} tổ ong`}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/')} className="border-amber-500 text-amber-700 hover:bg-amber-50">
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BulkAddBeehives;