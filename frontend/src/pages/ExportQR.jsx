import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Download as DownloadIcon,
  QrCode as QrCodeIcon,
  Print as PrintIcon,
  SelectAll as SelectAllIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchBeehives } from '../store/slices/beehiveSlice';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

const ExportQR = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { activeBeehives, loading } = useSelector((state) => state.beehives);

  const [selectedBeehives, setSelectedBeehives] = useState([]);
  const [exportSettings, setExportSettings] = useState({
    format: 'A4',
    qrSize: 113, // 3cm = 113px at 96 DPI
    perPage: 6,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [currentQrData, setCurrentQrData] = useState(null);
  const [qrCodeImage, setQrCodeImage] = useState(null);

  useEffect(() => {
    dispatch(fetchBeehives());
  }, [dispatch]);

  const handleSelectBeehive = (beehiveId, checked) => {
    if (checked) {
      setSelectedBeehives([...selectedBeehives, beehiveId]);
    } else {
      setSelectedBeehives(selectedBeehives.filter(id => id !== beehiveId));
    }
  };

  const handleSelectAll = () => {
    if (selectedBeehives.length === activeBeehives.length) {
      setSelectedBeehives([]);
    } else {
      setSelectedBeehives(activeBeehives.map(b => b.serial_number));
    }
  };

  const generateQRCode = async (text, size = 200) => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(text, {
        width: size,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  };

  const handleViewQR = async (beehive) => {
    try {
      const qrUrl = `${window.location.origin}/beehive/${beehive.qr_token || ''}`;
      const qrCodeDataURL = await generateQRCode(qrUrl);
      
      setCurrentQrData({
        serialNumber: beehive.serial_number,
        importDate: beehive.import_date,
        qrUrl: qrUrl
      });
      setQrCodeImage(qrCodeDataURL);
      setQrModalOpen(true);
    } catch (error) {
      console.error('Error generating QR code for display:', error);
      setError('Không thể tạo mã QR');
    }
  };

  const handleCloseQrModal = () => {
    setQrModalOpen(false);
    setCurrentQrData(null);
    setQrCodeImage(null);
  };

  const generatePDF = async () => {
    if (selectedBeehives.length === 0) {
      setError('Vui lòng chọn ít nhất 1 tổ ong để xuất');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const qrSizeMM = 20; // Smaller size for 5x5 layout
      const spacing = 3; // Minimal spacing for maximum QR codes
      
      // Calculate grid layout for 5 columns, 5 rows (25 per page)
      const cols = 5;
      const rows = 5;
      const itemsPerPage = cols * rows;
      
      // Calculate cell dimensions
      const cellWidth = (pageWidth - 2 * margin - (cols - 1) * spacing) / cols;
      const cellHeight = (pageHeight - 2 * margin - (rows - 1) * spacing) / rows;

      const selectedBeehiveData = activeBeehives.filter(b => 
        selectedBeehives.includes(b.serial_number)
      );

      let currentPage = 0;
      let currentItem = 0;

      for (let i = 0; i < selectedBeehiveData.length; i++) {
        const beehive = selectedBeehiveData[i];
        
        if (currentItem === 0) {
          if (currentPage > 0) {
            pdf.addPage();
          }
          currentPage++;
        }

        // Generate QR code
        const qrUrl = `${window.location.origin}/beehive/${beehive.qr_token || ''}`;
        const qrCodeDataURL = await generateQRCode(qrUrl, 200);

        // Calculate position (center QR code in cell)
        const col = currentItem % cols;
        const row = Math.floor(currentItem / cols);
        const x = margin + col * (cellWidth + spacing) + (cellWidth - qrSizeMM) / 2;
        const y = margin + row * (cellHeight + spacing) + (cellHeight - qrSizeMM - 6) / 2;

        // Add QR code
        pdf.addImage(qrCodeDataURL, 'PNG', x, y, qrSizeMM, qrSizeMM);

        // Add only beehive ID below QR code
        const textY = y + qrSizeMM + 2;
        pdf.setFontSize(4);
        pdf.text(beehive.serial_number || 'N/A', x, textY);

        currentItem++;
        if (currentItem >= itemsPerPage) {
          currentItem = 0;
        }
      }

      // Save PDF
      const fileName = `beehive_qr_codes_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      setSuccess(`Đã xuất thành công ${selectedBeehives.length} QR code thành file PDF`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Có lỗi xảy ra khi tạo file PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'Tốt': return 'success';
      case 'Bình thường': return 'warning';
      case 'Yếu': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box p={{ xs: 1, sm: 2 }}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Xuất QR Code PDF
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tạo file PDF chứa QR code của các tổ ong đã chọn (A4, 6 QR/trang, kích thước 3x3cm)
        </Typography>
      </Box>


      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Beehives Selection */}
      <Card>
        <CardContent sx={{ p: { xs: 0.5, sm: 2 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Chọn tổ ong để xuất ({selectedBeehives.length}/{activeBeehives.length})
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<SelectAllIcon />}
                onClick={handleSelectAll}
                size="small"
              >
                {selectedBeehives.length === activeBeehives.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={() => setSelectedBeehives([])}
                size="small"
              >
                Xóa chọn
              </Button>
            </Stack>
          </Box>

          {loading ? (
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center"
              sx={{ 
                flexDirection: 'column',
                gap: 2,
                py: 4
              }}
            >
              <img 
                src="/bee.gif" 
                alt="Loading..." 
                style={{ 
                  width: '60px', 
                  height: '60px',
                  borderRadius: '50%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }} 
              />
              <Typography 
                variant="body2" 
                color="primary" 
                sx={{ 
                  fontWeight: 500,
                  opacity: 0.8
                }}
              >
                Đang tải danh sách tổ ong...
              </Typography>
            </Box>
          ) : (
            <>
            {/* Mobile scroll indicator */}
            {isMobile && (
              <Box sx={{ 
                textAlign: 'center', 
                mb: 1, 
                color: 'text.secondary',
                fontSize: '0.75rem'
              }}>
                ← Vuốt ngang để xem thêm cột →
              </Box>
            )}

            <TableContainer 
              component={Paper} 
              sx={{ 
                maxHeight: 400,
                width: '100%',
                overflowX: 'auto',
                overflowY: 'auto',
                display: 'block',
                // Enhanced mobile scrolling
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin',
                scrollbarColor: '#D2691E #f1f1f1',
                position: 'relative',
                '&::-webkit-scrollbar': {
                  height: 12,
                  width: 12,
                  WebkitAppearance: 'none',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                  borderRadius: 6,
                  WebkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.1)',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#D2691E',
                  borderRadius: 6,
                  WebkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.1)',
                  '&:hover': {
                    backgroundColor: '#B8860B',
                  },
                },
                '&::-webkit-scrollbar-corner': {
                  backgroundColor: '#f1f1f1',
                },
              }}
            >
              <Table stickyHeader sx={{ 
                minWidth: { xs: 500, sm: 800 },
                width: 'max-content',
                display: 'table',
                tableLayout: 'fixed'
              }}>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      padding: { xs: '4px 1px', sm: '16px' },
                      minWidth: { xs: '50px', sm: '80px' },
                      whiteSpace: 'nowrap',
                      backgroundColor: '#f5f5f5',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}>
                      <Checkbox
                        indeterminate={selectedBeehives.length > 0 && selectedBeehives.length < activeBeehives.length}
                        checked={selectedBeehives.length === activeBeehives.length}
                        onChange={handleSelectAll}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      padding: { xs: '4px 1px', sm: '16px' },
                      minWidth: { xs: '70px', sm: '150px' },
                      whiteSpace: 'nowrap',
                      backgroundColor: '#f5f5f5',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}>Mã tổ</TableCell>
                    <TableCell sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      padding: { xs: '4px 1px', sm: '16px' },
                      minWidth: { xs: '70px', sm: '150px' },
                      whiteSpace: 'nowrap',
                      backgroundColor: '#f5f5f5',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}>Ngày nhập</TableCell>
                    <TableCell sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      padding: { xs: '4px 1px', sm: '16px' },
                      minWidth: { xs: '70px', sm: '150px' },
                      whiteSpace: 'nowrap',
                      backgroundColor: '#f5f5f5',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}>Sức khỏe</TableCell>
                    <TableCell sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.875rem' },
                      padding: { xs: '4px 1px', sm: '16px' },
                      minWidth: { xs: '70px', sm: '150px' },
                      whiteSpace: 'nowrap',
                      backgroundColor: '#f5f5f5',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeBeehives.map((beehive) => (
                    <TableRow key={beehive.serial_number}>
                      <TableCell padding="checkbox" sx={{ 
                        py: { xs: 0.5, sm: 1 },
                        px: { xs: '1px', sm: '16px' },
                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                        whiteSpace: 'nowrap',
                        minWidth: { xs: '50px', sm: '80px' }
                      }}>
                        <Checkbox
                          checked={selectedBeehives.includes(beehive.serial_number)}
                          onChange={(e) => handleSelectBeehive(beehive.serial_number, e.target.checked)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ 
                        py: { xs: 0.5, sm: 1 },
                        px: { xs: '1px', sm: '16px' },
                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                        whiteSpace: 'nowrap',
                        minWidth: { xs: '70px', sm: '150px' }
                      }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                          {beehive.serial_number || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ 
                        py: { xs: 0.5, sm: 1 },
                        px: { xs: '1px', sm: '16px' },
                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                        whiteSpace: 'nowrap',
                        minWidth: { xs: '70px', sm: '150px' }
                      }}>
                        {beehive.import_date ? new Date(beehive.import_date).toLocaleDateString('vi-VN') : 'N/A'}
                      </TableCell>
                      <TableCell sx={{ 
                        py: { xs: 0.5, sm: 1 },
                        px: { xs: '1px', sm: '16px' },
                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                        whiteSpace: 'nowrap',
                        minWidth: { xs: '70px', sm: '150px' }
                      }}>
                        <Chip
                          label={beehive.health_status || 'Unknown'}
                          color={getHealthStatusColor(beehive.health_status || 'Unknown')}
                          size="small"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        />
                      </TableCell>
                      <TableCell sx={{ 
                        py: { xs: 0.5, sm: 1 },
                        px: { xs: '1px', sm: '16px' },
                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                        whiteSpace: 'nowrap',
                        minWidth: { xs: '70px', sm: '150px' }
                      }}>
                        <Button
                          size="small"
                          startIcon={<QrCodeIcon />}
                          onClick={() => handleViewQR(beehive)}
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          Xem QR
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Box mt={3} display="flex" justifyContent="space-between">
        <Button
          variant="outlined"
          onClick={() => navigate('/')}
        >
          Quay lại Dashboard
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={isGenerating ? <CircularProgress size={20} /> : <DownloadIcon />}
          onClick={generatePDF}
          disabled={isGenerating || selectedBeehives.length === 0}
        >
          {isGenerating ? 'Đang tạo PDF...' : `Xuất ${selectedBeehives.length} QR Code`}
        </Button>
      </Box>

      {/* QR Code Modal */}
      <Dialog
        open={qrModalOpen}
        onClose={handleCloseQrModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <QrCodeIcon sx={{ mr: 1 }} />
            Mã QR - Tổ ong #{currentQrData?.serialNumber}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" p={2}>
            {qrCodeImage && (
              <Box mb={2}>
                <img 
                  src={qrCodeImage} 
                  alt={`QR Code for beehive ${currentQrData?.serialNumber}`}
                  style={{ 
                    width: '200px', 
                    height: '200px',
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                  }} 
                />
              </Box>
            )}
            <Box textAlign="center">
              <Typography variant="h6" gutterBottom>
                Mã tổ: {currentQrData?.serialNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Ngày nhập: {currentQrData?.importDate ? new Date(currentQrData.importDate).toLocaleDateString('vi-VN') : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                URL: {currentQrData?.qrUrl}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQrModal}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExportQR;
