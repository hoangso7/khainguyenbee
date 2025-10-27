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

const BulkAddBeehives = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    quantity: 1,
    import_date: new Date().toISOString().split('T')[0],
    health_status: 'Bình thường',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.quantity < 1 || formData.quantity > 100) {
      toast.error('Số lượng phải từ 1 đến 100');
      return;
    }

    setLoading(true);

    try {
      const beehives = [];
      for (let i = 0; i < formData.quantity; i++) {
        beehives.push({
          import_date: formData.import_date,
          health_status: formData.health_status,
        });
      }

      await apiService.createMultipleBeehives(beehives);
      toast.success(`Đã thêm ${formData.quantity} tổ ong`);
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Không thể thêm tổ ong');
    } finally {
      setLoading(false);
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
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  required
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
                  <SelectTrigger id="health_status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tốt">Tốt</SelectItem>
                    <SelectItem value="Bình thường">Bình thường</SelectItem>
                    <SelectItem value="Yếu">Yếu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Hệ thống sẽ tự động tạo mã tổ ong và mã QR cho {formData.quantity} tổ ong.
                  Bạn có thể cập nhật thông tin chi tiết cho từng tổ sau khi thêm.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Đang thêm...' : `Thêm ${formData.quantity} tổ ong`}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/')}>
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