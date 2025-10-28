import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../lib/api.js';
import { formatDate } from '../utils/dateUtils';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Hexagon, Calendar, MapPin, Phone } from 'lucide-react';

const QRBeehiveDetail = () => {
  const { token } = useParams();
  const [beehive, setBeehive] = useState(null);
  const [owner, setOwner] = useState(null);
  const [businessInfo, setBusinessInfo] = useState(null);

  useEffect(() => {
    if (token) {
      loadBeehive();
    }
  }, [token, loadBeehive]);

  const loadBeehive = useCallback(async () => {
    console.log('🔍 QRBeehiveDetail: Starting to load beehive with token:', token);
    try {
      const response = await apiService.getBeehiveByToken(token);
      console.log('✅ QRBeehiveDetail: API response received:', response);
      
      setBeehive(response.beehive);
      console.log('📊 QRBeehiveDetail: Beehive data set:', response.beehive);
      
      // Set owner and business info from response
      if (response.owner) {
        setOwner(response.owner);
        console.log('👤 QRBeehiveDetail: Owner data set:', response.owner);
      }
      if (response.business_info) {
        setBusinessInfo(response.business_info);
        console.log('🏢 QRBeehiveDetail: Business info set:', response.business_info);
      }
      
      // Try to get additional user info if logged in
      try {
        const userData = await apiService.getCurrentUser();
        if (userData && userData.id === response.beehive.user_id) {
          setOwner(userData);
          console.log('🔐 QRBeehiveDetail: User is logged in as owner:', userData);
        }
      } catch {
        console.log('ℹ️ QRBeehiveDetail: User not logged in, that\'s okay for public view');
      }
    } catch (error) {
      console.error('❌ QRBeehiveDetail: Error loading beehive:', error);
      // Set beehive to null to show error state
      setBeehive(null);
    }
  }, [token]);

  const getHealthBadgeVariant = (status) => {
    switch (status) {
      case 'Tốt':
        return 'default';
      case 'Bình thường':
        return 'secondary';
      case 'Yếu':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (!beehive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Không tìm thấy thông tin</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-gray-600">
            <p>Mã QR không hợp lệ hoặc tổ ong không tồn tại.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 p-4">
      <div className="max-w-2xl mx-auto space-y-4 py-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center">
              <Hexagon className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-amber-600">Thông tin Tổ Ong</h1>
          <p className="text-gray-600">Mã tổ: {beehive.serial_number}</p>
        </div>

        {/* Beehive Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Chi tiết tổ ong</CardTitle>
              {businessInfo?.qr_show_health_status !== false && (
                <Badge variant={getHealthBadgeVariant(beehive.health_status)}>
                  {beehive.health_status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {businessInfo?.qr_show_beehive_history !== false && (
                <>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Ngày nhập</p>
                      <p>{formatDate(beehive.import_date)}</p>
                    </div>
                  </div>

                  {beehive.split_date && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Ngày tách đàn</p>
                        <p>{formatDate(beehive.split_date)}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {beehive.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ghi chú</p>
                  <p className="text-gray-700">{beehive.notes}</p>
                </div>
              )}

              {beehive.is_sold && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    Tổ ong này đã được bán
                    {beehive.sold_date && ` vào ngày ${formatDate(beehive.sold_date)}`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Custom Message */}
        {businessInfo?.qr_custom_message && (
          <Card>
            <CardContent className="pt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-center">{businessInfo.qr_custom_message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Owner Info */}
        {(businessInfo?.qr_show_farm_info !== false || businessInfo?.qr_show_owner_contact !== false) && (
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chủ sở hữu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {businessInfo?.qr_show_farm_info !== false && (
                <>
                  {businessInfo?.farm_name && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Tên trang trại</p>
                        <p>{businessInfo.farm_name}</p>
                      </div>
                    </div>
                  )}

                  {businessInfo?.farm_address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Địa chỉ trang trại</p>
                        <p>{businessInfo.farm_address}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {businessInfo?.qr_show_owner_contact !== false && (
                <>
                  {businessInfo?.farm_phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Liên hệ</p>
                        <p>{businessInfo.farm_phone}</p>
                      </div>
                    </div>
                  )}

                  {owner?.email && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p>{owner.email}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-sm text-gray-500">
            {businessInfo?.qr_footer_text || 'Được quản lý bởi KBee Manager'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRBeehiveDetail;