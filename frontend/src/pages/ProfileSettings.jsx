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
import beeIcon from '../assets/bee-icon.png';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  // We will use placeholders to show existing values; controlled values stay empty until user types

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getExistingValue = (field) => {
    switch (field) {
      case 'email':
        return user?.email || '';
      case 'business_name':
        return user?.business_name || user?.farmName || '';
      case 'contact_info':
        return user?.contact_info || user?.farmPhone || '';
      case 'farm_name':
        return user?.farmName || '';
      case 'farm_address':
        return user?.farmAddress || '';
      case 'farm_phone':
        return user?.farmPhone || '';
      case 'qr_custom_message':
        return user?.qrDisplaySettings?.customMessage || '';
      case 'qr_footer_text':
        return user?.qrDisplaySettings?.footerText || '';
      default:
        return '';
    }
  };

  const loadUser = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      // Do NOT prefill text fields so existing values appear dimmed until typing
      setFormData(prev => ({
        ...prev,
        business_name: '',
        contact_info: '',
        email: '',
        farm_name: '',
        farm_address: '',
        farm_phone: '',
        // Keep switches in sync with server
        qr_show_farm_info: userData.qrDisplaySettings?.showFarmInfo ?? true,
        qr_show_owner_contact: userData.qrDisplaySettings?.showOwnerContact ?? true,
        qr_show_beehive_history: userData.qrDisplaySettings?.showBeehiveHistory ?? true,
        qr_show_health_status: userData.qrDisplaySettings?.showHealthStatus ?? true,
        // Leave custom texts empty to allow dimmed display of existing values
        qr_custom_message: '',
        qr_footer_text: userData.qrDisplaySettings?.footerText || 'Cảm ơn bạn đã tin tưởng sản phẩm của chúng tôi',
      }));
    } catch {
      toast.error('Không thể tải thông tin người dùng');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Chỉ gửi những field có giá trị, giữ nguyên data trong DB cho field trống
      const updateData = {};
      
      // Chỉ gửi email nếu có giá trị
      if (formData.email.trim()) {
        updateData.email = formData.email;
      }
      
      // Chỉ gửi business_name nếu có giá trị
      if (formData.business_name.trim()) {
        updateData.business_name = formData.business_name;
      }
      
      // Chỉ gửi contact_info nếu có giá trị
      if (formData.contact_info.trim()) {
        updateData.contact_info = formData.contact_info;
      }
      
      // Chỉ gửi farm_name nếu có giá trị
      if (formData.farm_name.trim()) {
        updateData.farmName = formData.farm_name;
      }
      
      // Chỉ gửi farm_address nếu có giá trị
      if (formData.farm_address.trim()) {
        updateData.farmAddress = formData.farm_address;
      }
      
      // Chỉ gửi farm_phone nếu có giá trị
      if (formData.farm_phone.trim()) {
        updateData.farmPhone = formData.farm_phone;
      }
      
      // Luôn gửi qrDisplaySettings vì đây là các switch có giá trị boolean
      updateData.qrDisplaySettings = {
        showFarmInfo: formData.qr_show_farm_info,
        showOwnerContact: formData.qr_show_owner_contact,
        showBeehiveHistory: formData.qr_show_beehive_history,
        showHealthStatus: formData.qr_show_health_status,
        // Chỉ gửi customMessage nếu có giá trị
        customMessage: formData.qr_custom_message.trim() ? formData.qr_custom_message : undefined,
        // Luôn gửi footerText vì có giá trị mặc định
        footerText: formData.qr_footer_text,
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

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin tài khoản</CardTitle>
            <CardDescription>Cập nhật thông tin cá nhân và doanh nghiệp</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder={getExistingValue('email')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_name">Tên doanh nghiệp</Label>
                <Input
                  id="business_name"
                  type="text"
                  value={formData.business_name}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                  placeholder={getExistingValue('business_name')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_info">Số điện thoại liên hệ</Label>
                <Input
                  id="contact_info"
                  type="tel"
                  value={formData.contact_info}
                  onChange={(e) => handleInputChange('contact_info', e.target.value)}
                  placeholder={getExistingValue('contact_info')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farm_name">Tên trang trại</Label>
                <Input
                  id="farm_name"
                  type="text"
                  value={formData.farm_name}
                  onChange={(e) => handleInputChange('farm_name', e.target.value)}
                  placeholder={getExistingValue('farm_name')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farm_address">Địa chỉ trang trại</Label>
                <Textarea
                  id="farm_address"
                  value={formData.farm_address}
                  onChange={(e) => handleInputChange('farm_address', e.target.value)}
                  placeholder={getExistingValue('farm_address')}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farm_phone">Số điện thoại trang trại</Label>
                <Input
                  id="farm_phone"
                  type="tel"
                  value={formData.farm_phone}
                  onChange={(e) => handleInputChange('farm_phone', e.target.value)}
                  placeholder={getExistingValue('farm_phone')}
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
                  onChange={(e) => handleInputChange('qr_custom_message', e.target.value)}
                  placeholder={getExistingValue('qr_custom_message')}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qr_footer_text">Văn bản chân trang</Label>
                <Input
                  id="qr_footer_text"
                  type="text"
                  value={formData.qr_footer_text}
                  onChange={(e) => handleInputChange('qr_footer_text', e.target.value)}
                  placeholder={getExistingValue('qr_footer_text')}
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
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Domain</span>
              <span>{window.location.hostname}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings;