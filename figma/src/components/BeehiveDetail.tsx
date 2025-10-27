import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { storage } from '../lib/storage';
import { Beehive } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { ArrowLeft, QrCode, Calendar, Edit, Download } from 'lucide-react';
import QRCodeLib from 'qrcode';

export function BeehiveDetail() {
  const navigate = useNavigate();
  const { serialNumber } = useParams<{ serialNumber: string }>();
  const [beehive, setBeehive] = useState<Beehive | null>(null);
  const [qrUrl, setQrUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (serialNumber) {
      const data = storage.getBeehiveBySerial(serialNumber);
      if (data) {
        setBeehive(data);
        generateQR(data.qr_token);
      } else {
        toast.error('Không tìm thấy tổ ong');
        navigate('/');
      }
    }
  }, [serialNumber, navigate]);

  const generateQR = async (token: string) => {
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
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <Button onClick={() => navigate(`/edit-beehive/${serialNumber}`)}>
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
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
                  {beehive.import_date}
                </p>
              </div>
              {beehive.split_date && (
                <div>
                  <p className="text-sm text-gray-500">Ngày tách đàn</p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {beehive.split_date}
                  </p>
                </div>
              )}
              {beehive.is_sold && beehive.sold_date && (
                <div>
                  <p className="text-sm text-gray-500">Ngày bán</p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {beehive.sold_date}
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
              <Button onClick={downloadQR} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Tải mã QR
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
