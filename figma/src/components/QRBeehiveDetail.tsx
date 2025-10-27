import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { storage } from '../lib/storage';
import { Beehive, User } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Hexagon, Calendar, MapPin, Phone } from 'lucide-react';

export function QRBeehiveDetail() {
  const { token } = useParams<{ token: string }>();
  const [beehive, setBeehive] = useState<Beehive | null>(null);
  const [owner, setOwner] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      const data = storage.getBeehiveByToken(token);
      if (data) {
        setBeehive(data);
        const user = storage.getCurrentUser();
        if (user && user.id === data.user_id) {
          setOwner(user);
        }
      }
    }
  }, [token]);

  const getHealthBadgeVariant = (status: string) => {
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
              <Badge variant={getHealthBadgeVariant(beehive.health_status)}>
                {beehive.health_status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Ngày nhập</p>
                  <p>{beehive.import_date}</p>
                </div>
              </div>

              {beehive.split_date && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Ngày tách đàn</p>
                    <p>{beehive.split_date}</p>
                  </div>
                </div>
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
                    {beehive.sold_date && ` vào ngày ${beehive.sold_date}`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Owner Info */}
        {owner && (
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chủ sở hữu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Tên doanh nghiệp</p>
                  <p>{owner.business_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Liên hệ</p>
                  <p>{owner.contact_info}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-sm text-gray-500">
            Được quản lý bởi <span className="font-medium text-amber-600">KBee Manager</span>
          </p>
        </div>
      </div>
    </div>
  );
}
