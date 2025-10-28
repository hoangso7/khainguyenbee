import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../lib/api.js';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, QrCode, Calendar, Edit, Download } from 'lucide-react';
import QRCodeLib from 'qrcode';
import { formatDate } from '../utils/dateUtils';

const BeehiveDetail = () => {
  const navigate = useNavigate();
  const { qrToken } = useParams();
  const [beehive, setBeehive] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    if (qrToken) {
      loadBeehive();
    }
  }, [qrToken, loadBeehive]);

  const loadBeehive = useCallback(async () => {
    try {
      const data = await apiService.getBeehiveByToken(qrToken);
      setBeehive(data.beehive);
      setIsAdmin(data.is_admin || false);
      generateQR(data.beehive.qr_token);
        } catch {
          toast.error('Không tìm thấy tổ ong');
          navigate('/');
        }
  }, [qrToken, navigate]);

  const generateQR = async (token) => {
    const publicUrl = `${window.location.origin}/qr/${token}`;
    try {
      if (canvasRef.current) {
        await QRCodeLib.toCanvas(canvasRef.current, publicUrl, {
          width: 300,
          margin: 2,
        });
        const url = await QRCodeLib.toDataURL(publicUrl, { width: 300 });
        setQrUrl(url);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQR = () => {
    if (qrUrl && beehive) {
      const link = document.createElement('a');
      link.download = `QR_${beehive.serial_number}.png`;
      link.href = qrUrl;
      link.click();
      toast.success('Đã tải mã QR');
    }
  };

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
    return null;
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
              <Button onClick={() => navigate(`/edit-beehive/${beehive.serial_number}`)} className="bg-white text-amber-700 hover:bg-amber-50">
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Main Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tổ ong {beehive.serial_number}</CardTitle>
              <Badge variant={getHealthBadgeVariant(beehive.health_status)}>
                {beehive.health_status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Mã QR</p>
                <p className="font-mono">{beehive.qr_token}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày nhập</p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(beehive.import_date)}
                </p>
              </div>
              {beehive.split_date && (
                <div>
                  <p className="text-sm text-gray-500">Ngày tách đàn</p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(beehive.split_date)}
                  </p>
                </div>
              )}
              {beehive.is_sold && beehive.sold_date && (
                <div>
                  <p className="text-sm text-gray-500">Ngày bán</p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(beehive.sold_date)}
                  </p>
                </div>
              )}
            </div>

            {beehive.notes && (
              <div>
                <p className="text-sm text-gray-500">Ghi chú</p>
                <p className="mt-1">{beehive.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Mã QR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <canvas ref={canvasRef} />
              </div>
              <p className="text-sm text-gray-500 text-center">
                Quét mã QR để xem thông tin công khai của tổ ong
              </p>
              <Button onClick={downloadQR} variant="outline" className="border-amber-500 text-amber-700 hover:bg-amber-50">
                <Download className="w-4 h-4 mr-2" />
                Tải mã QR
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BeehiveDetail;