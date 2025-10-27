import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { storage } from '../lib/storage';
import { HealthStatus } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { toast } from 'sonner@2.0.3';
import { ArrowLeft } from 'lucide-react';

export function EditBeehive() {
  const navigate = useNavigate();
  const { serialNumber } = useParams<{ serialNumber: string }>();
  const [loading, setLoading] = useState(false);
  const [beehive, setBeehive] = useState<any>(null);

  const [formData, setFormData] = useState({
    import_date: '',
    split_date: '',
    health_status: 'Bình thường' as HealthStatus,
    notes: '',
    is_sold: false,
    sold_date: '',
  });

  useEffect(() => {
    if (serialNumber) {
      const data = storage.getBeehiveBySerial(serialNumber);
      if (data) {
        setBeehive(data);
        setFormData({
          import_date: data.import_date,
          split_date: data.split_date || '',
          health_status: data.health_status,
          notes: data.notes || '',
          is_sold: data.is_sold,
          sold_date: data.sold_date || '',
        });
      } else {
        toast.error('Không tìm thấy tổ ong');
        navigate('/');
      }
    }
  }, [serialNumber, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNumber) return;

    setLoading(true);

    setTimeout(() => {
      storage.updateBeehive(serialNumber, {
        import_date: formData.import_date,
        split_date: formData.split_date || undefined,
        health_status: formData.health_status,
        notes: formData.notes || undefined,
        is_sold: formData.is_sold,
        sold_date: formData.sold_date || undefined,
      });

      toast.success('Đã cập nhật thông tin tổ ong');
      navigate('/');
      setLoading(false);
    }, 500);
  };

  if (!beehive) {
    return null;
  }

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
            <CardTitle>Chỉnh sửa tổ ong {serialNumber}</CardTitle>
            <CardDescription>Cập nhật thông tin tổ ong</CardDescription>
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
                  placeholder="Nhập ghi chú về tổ ong"
                  rows={4}
                />
              </div>

              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_sold">Đã bán</Label>
                    <p className="text-sm text-gray-500">Đánh dấu tổ ong này đã được bán</p>
                  </div>
                  <Switch
                    id="is_sold"
                    checked={formData.is_sold}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_sold: checked })}
                  />
                </div>

                {formData.is_sold && (
                  <div className="space-y-2">
                    <Label htmlFor="sold_date">Ngày bán</Label>
                    <Input
                      id="sold_date"
                      type="date"
                      value={formData.sold_date}
                      onChange={(e) => setFormData({ ...formData, sold_date: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Đang cập nhật...' : 'Cập nhật'}
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
