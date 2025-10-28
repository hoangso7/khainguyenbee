import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../lib/api.js';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { AlertDialog } from '../components/ui/alert-dialog';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, Edit } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import beeIcon from '../assets/bee-icon.png';


const BeehiveDetail = () => {
  const navigate = useNavigate();
  const { qrToken } = useParams();
  const [beehive, setBeehive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [owner, setOwner] = useState(null);
  const [showSellDialog, setShowSellDialog] = useState(false);

  const loadBeehive = useCallback(async () => {
    console.log('🔍 BeehiveDetail: Starting to load beehive with qrToken:', qrToken);
    try {
      setLoading(true);
      const data = await apiService.getBeehiveByToken(qrToken);
      console.log('✅ BeehiveDetail: API response received:', data);
      
      setBeehive(data.beehive);
      console.log('📊 BeehiveDetail: Beehive data set:', data.beehive);
      
      setIsAdmin(data.is_admin || false);
      console.log('🔐 BeehiveDetail: Admin status set:', data.is_admin || false);
      
      setBusinessInfo(data.business_info);
      console.log('🏢 BeehiveDetail: Business info set:', data.business_info);
      
      setOwner(data.owner);
      console.log('👤 BeehiveDetail: Owner info set:', data.owner);
    } catch (error) {
      console.error('❌ BeehiveDetail: Error loading beehive:', error);
      // Delay showing toast until we know it's not loading
      toast.error('Không tìm thấy tổ ong');
    } finally {
      setLoading(false);
    }
  }, [qrToken]);

  useEffect(() => {
    if (qrToken) {
      loadBeehive();
    }
  }, [qrToken, loadBeehive]);

  const handleSellBeehive = () => {
    setShowSellDialog(true);
  };

  const confirmSellBeehive = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await apiService.updateBeehive(beehive.serial_number, {
        ...beehive,
        is_sold: true,
        sold_date: today
      });
      
      toast.success('Đã đánh dấu tổ ong là đã bán');
      // Reload beehive data
      loadBeehive();
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái bán');
      console.error('Error selling beehive:', error);
    }
  };



  const getHealthBadgeVariant = (status) => {
    switch (status) {
      case 'Tốt':
        return 'default';
      case 'Yếu':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getHealthIcon = (status) => {
    switch (status) {
      case 'Tốt':
        return '/static/icons/health/good.png';
      case 'Yếu':
        return '/static/icons/health/weak.png';
      default:
        return '/static/icons/health/good.png';
    }
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'Tốt':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Yếu':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  console.log('🔍 BeehiveDetail: Current state - beehive:', beehive, 'isAdmin:', isAdmin);

  const calculateAgeDays = (beehiveData) => {
    if (!beehiveData) return null;
    const basis = beehiveData.split_date || beehiveData.import_date;
    if (!basis) return null;
    const start = new Date(basis);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    return days;
  };

  if (loading) {
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
            <p>Mã QR không hợp lệ hoặc tổ ong không tồn tại.</p>
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
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            {isAdmin && (
              <div className="flex gap-2">
                <Button onClick={() => navigate(`/edit-beehive/${beehive.serial_number}`)} className="bg-white text-amber-700 hover:bg-amber-50">
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
                {!beehive.is_sold && (
                  <Button onClick={handleSellBeehive} className="bg-green-500 hover:bg-green-600 text-white">
                    🏷️ Bán
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Main Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-bold">Tổ Ong {beehive.serial_number}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Badges - Top Right */}
            <div className="flex justify-end gap-2">
              <Badge className={`px-4 py-2 rounded-full border font-semibold text-base ${getHealthColor(beehive.health_status)}`}>
                Sức khoẻ: {beehive.health_status}
              </Badge>
              <Badge className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-semibold text-base">
                Tuổi: {(() => {
                  const days = calculateAgeDays(beehive);
                  return days !== null ? `${days} ngày` : '—';
                })()}
              </Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-4 relative">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ngày nhập</p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(beehive.import_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày tách đàn</p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {beehive.split_date ? formatDate(beehive.split_date) : 'Tổ chưa được tách'}
                  </p>
                </div>
                {beehive.is_sold && beehive.sold_date && (
                  <div>
                    <p className="text-sm text-gray-500">Ngày bán</p>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(beehive.sold_date)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Chủng loại</p>
                  <p className="font-medium">{beehive.species || 'Furva Vàng'}</p>
                </div>
              </div>
              
              {/* Hình ảnh đại diện */}
              <div className="flex justify-center items-center">
                <img 
                  src={getHealthIcon(beehive.health_status)} 
                  alt={beehive.health_status}
                  className="w-32 h-32 object-contain"
                />
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Ghi chú</p>
              <p className="mt-1">{beehive.notes || 'Không có ghi chú'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Farm Information */}
        {businessInfo && businessInfo.qr_show_farm_info && (
          <Card>
            <CardHeader>
              <CardTitle className="font-bold">Thông tin trang trại</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {businessInfo.farm_name && (
                <div>
                  <p className="text-sm text-gray-500">Tên trang trại</p>
                  <p className="font-medium">{businessInfo.farm_name}</p>
                </div>
              )}
              {businessInfo.farm_address && (
                <div>
                  <p className="text-sm text-gray-500">Địa chỉ</p>
                  <p className="whitespace-pre-line font-bold">{businessInfo.farm_address}</p>
                </div>
              )}
              {businessInfo.farm_phone && (
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-medium">{businessInfo.farm_phone}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Owner Contact Information */}
        {businessInfo && businessInfo.qr_show_owner_contact && (
          <Card>
            <CardHeader>
              <CardTitle className="font-bold">Thông tin liên hệ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {owner && owner.email && (
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{owner.email}</p>
                </div>
              )}
              {businessInfo.farm_phone && (
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-medium">{businessInfo.farm_phone}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Custom Message */}
        {businessInfo && businessInfo.qr_custom_message && (
          <Card>
            <CardHeader>
              <CardTitle>Ghi Chú</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{businessInfo.qr_custom_message}</p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img src={beeIcon} alt="KBee" className="w-7 h-7" />
              <span className="text-amber-700 font-semibold">KBee Manager</span>
            </div>
            {businessInfo && businessInfo.qr_footer_text && (
              <p className="text-center text-gray-600 italic">{businessInfo.qr_footer_text}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sell Confirmation Dialog */}
      <AlertDialog
        open={showSellDialog}
        onOpenChange={setShowSellDialog}
        title="Xác nhận bán tổ ong"
        description={`Bạn có chắc chắn muốn đánh dấu tổ ong ${beehive?.serial_number} là đã bán? Hành động này sẽ tự động đặt ngày bán là hôm nay.`}
        confirmText="Đánh dấu đã bán"
        cancelText="Hủy"
        onConfirm={confirmSellBeehive}
        variant="default"
      />
    </div>
  );
};

export default BeehiveDetail;