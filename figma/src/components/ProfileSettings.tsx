import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../lib/storage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner@2.0.3';
import { ArrowLeft, Save } from 'lucide-react';

export function ProfileSettings() {
  const navigate = useNavigate();
  const user = storage.getCurrentUser();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    business_name: user?.business_name || '',
    contact_info: user?.contact_info || '',
    email: user?.email || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      storage.updateUser(formData);
      toast.success('Đã cập nhật thông tin');
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

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin tài khoản</CardTitle>
            <CardDescription>Cập nhật thông tin cá nhân và doanh nghiệp</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  type="text"
                  value={user?.username || ''}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-gray-500">Không thể thay đổi tên đăng nhập</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_name">Tên doanh nghiệp</Label>
                <Input
                  id="business_name"
                  type="text"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_info">Số điện thoại liên hệ</Label>
                <Input
                  id="contact_info"
                  type="tel"
                  value={formData.contact_info}
                  onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/')}>
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin hệ thống</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Phiên bản</span>
              <span>v1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Ngày tạo tài khoản</span>
              <span>{new Date(user?.created_at || '').toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">ID người dùng</span>
              <span className="font-mono text-sm">{user?.id}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
