import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../lib/storage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner@2.0.3';
import { Building2 } from 'lucide-react';

export function Setup() {
  const navigate = useNavigate();
  const currentUser = storage.getCurrentUser();
  const [businessName, setBusinessName] = useState(currentUser?.business_name || '');
  const [contactInfo, setContactInfo] = useState(currentUser?.contact_info || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      storage.updateUser({
        business_name: businessName,
        contact_info: contactInfo,
      });
      storage.setSetupComplete(true);
      toast.success('Thiết lập thành công!');
      navigate('/');
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle>Thiết lập hồ sơ</CardTitle>
          <CardDescription>Hoàn thiện thông tin doanh nghiệp của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Tên doanh nghiệp</Label>
              <Input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Trang trại Ong Mật Việt"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactInfo">Số điện thoại liên hệ</Label>
              <Input
                id="contactInfo"
                type="tel"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="0901234567"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Hoàn tất thiết lập'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
