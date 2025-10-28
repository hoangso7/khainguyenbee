import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../lib/api.js';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { AlertDialog } from '../components/ui/alert-dialog';

const EditBeehive = () => {
  const navigate = useNavigate();
  const { serialNumber } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [beehive, setBeehive] = useState(null);
  const [showUnsellDialog, setShowUnsellDialog] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [formData, setFormData] = useState({
    import_date: '',
    split_date: '',
    health_status: 'Bình thường',
    notes: '',
    is_sold: false,
    sold_date: '',
  });

  const loadBeehive = useCallback(async () => {
    console.log('🔍 EditBeehive: Starting to load beehive with serialNumber:', serialNumber);
    try {
      setInitialLoading(true);
      const data = await apiService.getBeehive(serialNumber);
      console.log('✅ EditBeehive: API response received:', data);
      
      setBeehive(data);
      console.log('📊 EditBeehive: Beehive data set:', data);
      
      setFormData({
        import_date: data.import_date,
        split_date: data.split_date || '',
        health_status: data.health_status,
        notes: data.notes || '',
        is_sold: data.is_sold,
        sold_date: data.sold_date || '',
      });
      console.log('📝 EditBeehive: Form data initialized:', {
        import_date: data.import_date,
        split_date: data.split_date || '',
        health_status: data.health_status,
        notes: data.notes || '',
        is_sold: data.is_sold,
        sold_date: data.sold_date || '',
      });
    } catch (error) {
      console.error('❌ EditBeehive: Error loading beehive:', error);
      toast.error('Không tìm thấy tổ ong');
      // Don't navigate away, let the component show error state
    } finally {
      setInitialLoading(false);
    }
  }, [serialNumber]);

  useEffect(() => {
    if (serialNumber) {
      loadBeehive();
    }
  }, [serialNumber, loadBeehive]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serialNumber) return;

    console.log('💾 EditBeehive: Starting form submission for serialNumber:', serialNumber);
    console.log('📝 EditBeehive: Form data to submit:', formData);

    setLoading(true);

    try {
      const updateData = {
        import_date: formData.import_date,
        split_date: formData.split_date || undefined,
        health_status: formData.health_status,
        notes: formData.notes || undefined,
        is_sold: formData.is_sold,
        sold_date: formData.sold_date || undefined,
      };
      
      console.log('🚀 EditBeehive: Sending update request with data:', updateData);
      
      await apiService.updateBeehive(serialNumber, updateData);
      
      console.log('✅ EditBeehive: Update successful');
      toast.success('Đã cập nhật thông tin tổ ong');
      navigate('/');
    } catch (error) {
      console.error('❌ EditBeehive: Update failed:', error);
      toast.error(error.message || 'Không thể cập nhật tổ ong');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSold = (nextChecked) => {
    // Only allow unsell via confirmation; selling is handled elsewhere
    if (formData.is_sold && nextChecked === false) {
      setShowUnsellDialog(true);
    }
  };

  const confirmUnsell = async () => {
    if (!serialNumber) return;
    setUpdatingStatus(true);
    try {
      await apiService.updateBeehive(serialNumber, { is_sold: false, sold_date: undefined });
      toast.success('Đã hủy trạng thái đã bán');
      await loadBeehive();
    } catch (error) {
      toast.error(error.message || 'Không thể hủy trạng thái đã bán');
    } finally {
      setUpdatingStatus(false);
      setShowUnsellDialog(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Đang tải thông tin tổ ong...</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-gray-600">
            <p>Vui lòng chờ trong giây lát.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!beehive) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Không tìm thấy thông tin</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-gray-600">
            <p>Tổ ong {serialNumber} không tồn tại hoặc bạn không có quyền chỉnh sửa.</p>
            <Button 
              onClick={() => navigate('/')} 
              className="mt-4 bg-amber-500 hover:bg-amber-600 text-white"
            >
              Quay về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                    disabled={formData.is_sold}
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
                    disabled={formData.is_sold}
                  />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <Label htmlFor="health_status">Tình trạng sức khỏe <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.health_status}
                  onValueChange={(value) => setFormData({ ...formData, health_status: value })}
                  disabled={formData.is_sold}
                >
                  <SelectTrigger id="health_status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent 
                    className="z-[9999] bg-white border border-gray-200 shadow-lg rounded-md" 
                    position="popper"
                    sideOffset={4}
                    align="start"
                  >
                    <SelectItem value="Tốt" className="hover:bg-gray-100 cursor-pointer">Tốt</SelectItem>
                    <SelectItem value="Bình thường" className="hover:bg-gray-100 cursor-pointer">Bình thường</SelectItem>
                    <SelectItem value="Yếu" className="hover:bg-gray-100 cursor-pointer">Yếu</SelectItem>
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
                  disabled={formData.is_sold}
                />
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_sold">Trạng thái bán</Label>
                    <p className="text-sm text-gray-500">
                      {formData.is_sold 
                        ? `Đã bán - Ngày bán: ${formData.sold_date ? new Date(formData.sold_date).toLocaleDateString('vi-VN') : 'Chưa có ngày'}`
                        : 'Chưa bán'
                      }
                    </p>
                  </div>
                  <Switch
                    id="is_sold"
                    checked={formData.is_sold}
                    disabled={updatingStatus}
                    onCheckedChange={handleToggleSold}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading || formData.is_sold} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
                  {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/')} className="border-amber-500 text-amber-700 hover:bg-amber-50">
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Unsell Confirmation Dialog */}
      <AlertDialog
        open={showUnsellDialog}
        onOpenChange={setShowUnsellDialog}
        title="Xác nhận hủy trạng thái đã bán"
        description={`Bạn có chắc chắn muốn hủy trạng thái đã bán của tổ ong ${serialNumber}?`}
        confirmText={updatingStatus ? 'Đang thực hiện...' : 'Hủy trạng thái đã bán'}
        cancelText="Hủy"
        onConfirm={confirmUnsell}
        variant="default"
      />
    </div>
  );
};

export default EditBeehive;