import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../lib/api.js';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import beeIcon from '../assets/bee-icon.png';

const AddBeehive = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    import_date: new Date().toISOString().split('T')[0],
    split_date: '',
    health_status: 'Tốt',
    species: 'Furva Vàng',
    notes: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiService.createBeehive(formData);
      toast.success('Đã thêm tổ ong thành công');
      navigate('/');
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
                  onValueChange={(value) => setFormData({ ...formData, health_status: value })}
                >
                  <SelectTrigger id="health_status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                  <SelectTrigger id="species">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Furva Vàng">Furva Vàng</SelectItem>
                    <SelectItem value="Furva Đen">Furva Đen</SelectItem>
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
                <Button type="submit" disabled={loading} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
                  {loading ? 'Đang thêm...' : 'Thêm tổ ong'}
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

export default AddBeehive;