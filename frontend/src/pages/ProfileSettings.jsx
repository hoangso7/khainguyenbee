import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../lib/api.js';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    business_name: '',
    contact_info: '',
    email: '',
    farm_name: '',
    farm_address: '',
    farm_phone: '',
    qr_show_farm_info: true,
    qr_show_owner_contact: true,
    qr_show_beehive_history: true,
    qr_show_health_status: true,
    qr_custom_message: '',
    qr_footer_text: 'Cảm ơn bạn đã tin tưởng sản phẩm của chúng tôi',
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      setFormData({
        business_name: userData.business_name || '',
        contact_info: userData.contact_info || '',
        email: userData.email || '',
        farm_name: userData.farmName || '',
        farm_address: userData.farmAddress || '',
        farm_phone: userData.farmPhone || '',
        qr_show_farm_info: userData.qrDisplaySettings?.showFarmInfo ?? true,
        qr_show_owner_contact: userData.qrDisplaySettings?.showOwnerContact ?? true,
        qr_show_beehive_history: userData.qrDisplaySettings?.showBeehiveHistory ?? true,
        qr_show_health_status: userData.qrDisplaySettings?.showHealthStatus ?? true,
        qr_custom_message: userData.qrDisplaySettings?.customMessage || '',
        qr_footer_text: userData.qrDisplaySettings?.footerText || 'Cảm ơn bạn đã tin tưởng sản phẩm của chúng tôi',
      });
    } catch {
      toast.error('Không thể tải thông tin người dùng');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        business_name: formData.business_name,
        contact_info: formData.contact_info,
        email: formData.email,
        farmName: formData.farm_name,
        farmAddress: formData.farm_address,
        farmPhone: formData.farm_phone,
        qrDisplaySettings: {
          showFarmInfo: formData.qr_show_farm_info,
          showOwnerContact: formData.qr_show_owner_contact,
          showBeehiveHistory: formData.qr_show_beehive_history,
          showHealthStatus: formData.qr_show_health_status,
          customMessage: formData.qr_custom_message,
          footerText: formData.qr_footer_text,
        }
      };
      
      await apiService.updateProfile(updateData);
      toast.success('Đã cập nhật thông tin');
      loadUser(); // Reload user data
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <header className="bg-gradient-to-r from-amber-500 to-yellow-500 border-b border-amber-400 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-white hover:bg-white/20">
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

              <div className="space-y-2">
                <Label htmlFor="farm_name">Tên trang trại</Label>
                <Input
                  id="farm_name"
                  type="text"
                  value={formData.farm_name}
                  onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farm_address">Địa chỉ trang trại</Label>
                <Textarea
                  id="farm_address"
                  value={formData.farm_address}
                  onChange={(e) => setFormData({ ...formData, farm_address: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farm_phone">Số điện thoại trang trại</Label>
                <Input
                  id="farm_phone"
                  type="tel"
                  value={formData.farm_phone}
                  onChange={(e) => setFormData({ ...formData, farm_phone: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/')} className="border-amber-500 text-amber-700 hover:bg-amber-50">
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cài đặt hiển thị QR</CardTitle>
            <CardDescription>Cấu hình thông tin hiển thị khi khách hàng quét mã QR</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="qr_show_farm_info">Hiển thị thông tin trang trại</Label>
                  <p className="text-sm text-gray-500">Hiển thị tên và địa chỉ trang trại</p>
                </div>
                <Switch
                  id="qr_show_farm_info"
                  checked={formData.qr_show_farm_info}
                  onCheckedChange={(checked) => setFormData({ ...formData, qr_show_farm_info: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="qr_show_owner_contact">Hiển thị thông tin liên hệ</Label>
                  <p className="text-sm text-gray-500">Hiển thị số điện thoại và email</p>
                </div>
                <Switch
                  id="qr_show_owner_contact"
                  checked={formData.qr_show_owner_contact}
                  onCheckedChange={(checked) => setFormData({ ...formData, qr_show_owner_contact: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="qr_show_beehive_history">Hiển thị lịch sử tổ ong</Label>
                  <p className="text-sm text-gray-500">Hiển thị ngày nhập, ngày tách đàn</p>
                </div>
                <Switch
                  id="qr_show_beehive_history"
                  checked={formData.qr_show_beehive_history}
                  onCheckedChange={(checked) => setFormData({ ...formData, qr_show_beehive_history: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="qr_show_health_status">Hiển thị tình trạng sức khỏe</Label>
                  <p className="text-sm text-gray-500">Hiển thị trạng thái sức khỏe của tổ ong</p>
                </div>
                <Switch
                  id="qr_show_health_status"
                  checked={formData.qr_show_health_status}
                  onCheckedChange={(checked) => setFormData({ ...formData, qr_show_health_status: checked })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr_custom_message">Tin nhắn tùy chỉnh</Label>
                <Textarea
                  id="qr_custom_message"
                  value={formData.qr_custom_message}
                  onChange={(e) => setFormData({ ...formData, qr_custom_message: e.target.value })}
                  placeholder="Nhập tin nhắn tùy chỉnh sẽ hiển thị trên trang QR..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qr_footer_text">Văn bản chân trang</Label>
                <Input
                  id="qr_footer_text"
                  type="text"
                  value={formData.qr_footer_text}
                  onChange={(e) => setFormData({ ...formData, qr_footer_text: e.target.value })}
                  placeholder="Văn bản hiển thị ở cuối trang QR"
                />
              </div>
            </div>
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
};

export default ProfileSettings;