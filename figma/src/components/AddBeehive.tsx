import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../lib/storage';
import { generateQRToken, generateSerialNumber } from '../lib/mock-data';
import { HealthStatus } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner@2.0.3';
import { ArrowLeft } from 'lucide-react';

export function AddBeehive() {
  const navigate = useNavigate();
  const user = storage.getCurrentUser();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    import_date: new Date().toISOString().split('T')[0],
    split_date: '',
    health_status: 'Bình thường' as HealthStatus,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    setTimeout(() => {
      const beehives = storage.getBeehives();
      const newBeehive = {
        serial_number: generateSerialNumber(beehives),
        qr_token: generateQRToken(),
        import_date: formData.import_date,
        split_date: formData.split_date || undefined,
        health_status: formData.health_status,
        notes: formData.notes || undefined,
        is_sold: false,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      storage.addBeehive(newBeehive);
      toast.success(`Đã thêm tổ ong ${newBeehive.serial_number}`);
      navigate('/');
      setLoading(false);
    }, 500);
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
            <CardTitle>Thêm tổ ong mới</CardTitle>
            <CardDescription>Nhập thông tin tổ ong để thêm vào hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
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
                  <Label htmlFor="split_date">Ngày tách đàn</Label>
                  <Input
                    id="split_date"
                    type="date"
                    value={formData.split_date}
                    onChange={(e) => setFormData({ ...formData, split_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="health_status">Tình trạng sức khỏe <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.health_status}
                  onValueChange={(value: HealthStatus) => setFormData({ ...formData, health_status: value })}
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

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Nhập ghi chú về tổ ong (tùy chọn)"
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Đang thêm...' : 'Thêm tổ ong'}
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
}
