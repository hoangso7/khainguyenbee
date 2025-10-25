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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
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
  const { activeBeehives, loading } = useSelector((state) => state.beehives);

  const [selectedBeehives, setSelectedBeehives] = useState([]);
  const [exportSettings, setExportSettings] = useState({
    format: 'A4',
    qrSize: 100,
    perPage: 6,
    includeDetails: true,
    includeLogo: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

  const generateQRCode = async (text) => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(text, {
        width: exportSettings.qrSize,
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
        orientation: exportSettings.format === 'A4' ? 'portrait' : 'landscape',
        unit: 'mm',
        format: exportSettings.format.toLowerCase()
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);

      // Calculate grid layout
      const cols = Math.floor(contentWidth / (exportSettings.qrSize / 3.78 + 20)); // Convert px to mm
      const rows = Math.floor(contentHeight / (exportSettings.qrSize / 3.78 + 60));
      const itemsPerPage = cols * rows;

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
        const qrUrl = `${window.location.origin}/beehive/${beehive.qr_token}`;
        const qrCodeDataURL = await generateQRCode(qrUrl);

        // Calculate position
        const col = currentItem % cols;
        const row = Math.floor(currentItem / cols);
        const x = margin + col * (exportSettings.qrSize / 3.78 + 20);
        const y = margin + row * (exportSettings.qrSize / 3.78 + 60);

        // Add QR code
        pdf.addImage(qrCodeDataURL, 'PNG', x, y, exportSettings.qrSize / 3.78, exportSettings.qrSize / 3.78);

        // Add details if enabled
        if (exportSettings.includeDetails) {
          const textY = y + exportSettings.qrSize / 3.78 + 5;
          pdf.setFontSize(10);
          pdf.text(`Mã tổ: ${beehive.serial_number}`, x, textY);
          pdf.text(`Ngày nhập: ${new Date(beehive.import_date).toLocaleDateString('vi-VN')}`, x, textY + 5);
          pdf.text(`Sức khỏe: ${beehive.health_status}`, x, textY + 10);
        }

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
    <Box p={3}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Xuất QR Code PDF
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tạo file PDF chứa QR code của các tổ ong đã chọn
        </Typography>
      </Box>

      {/* Export Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cài đặt xuất file
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Định dạng giấy</InputLabel>
                <Select
                  value={exportSettings.format}
                  onChange={(e) => setExportSettings({ ...exportSettings, format: e.target.value })}
                  label="Định dạng giấy"
                >
                  <MenuItem value="A4">A4</MenuItem>
                  <MenuItem value="A3">A3</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Kích thước QR (px)"
                type="number"
                value={exportSettings.qrSize}
                onChange={(e) => setExportSettings({ ...exportSettings, qrSize: parseInt(e.target.value) || 100 })}
                inputProps={{ min: 50, max: 300 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Số QR mỗi trang"
                type="number"
                value={exportSettings.perPage}
                onChange={(e) => setExportSettings({ ...exportSettings, perPage: parseInt(e.target.value) || 6 })}
                inputProps={{ min: 1, max: 20 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportSettings.includeDetails}
                      onChange={(e) => setExportSettings({ ...exportSettings, includeDetails: e.target.checked })}
                    />
                  }
                  label="Bao gồm thông tin chi tiết"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportSettings.includeLogo}
                      onChange={(e) => setExportSettings({ ...exportSettings, includeLogo: e.target.checked })}
                    />
                  }
                  label="Bao gồm logo"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
        <CardContent>
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
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedBeehives.length > 0 && selectedBeehives.length < activeBeehives.length}
                        checked={selectedBeehives.length === activeBeehives.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Mã tổ</TableCell>
                    <TableCell>Ngày nhập</TableCell>
                    <TableCell>Sức khỏe</TableCell>
                    <TableCell>QR Token</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeBeehives.map((beehive) => (
                    <TableRow key={beehive.serial_number}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedBeehives.includes(beehive.serial_number)}
                          onChange={(e) => handleSelectBeehive(beehive.serial_number, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {beehive.serial_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {beehive.import_date ? new Date(beehive.import_date).toLocaleDateString('vi-VN') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={beehive.health_status || 'Unknown'}
                          color={getHealthStatusColor(beehive.health_status || 'Unknown')}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {beehive.qr_token?.substring(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          startIcon={<QrCodeIcon />}
                          onClick={() => navigate(`/beehive/${beehive.qr_token}`)}
                        >
                          Xem QR
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Box mt={3} display="flex" justifyContent="space-between">
        <Button
          variant="outlined"
          onClick={() => navigate('/dashboard')}
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
    </Box>
  );
};

export default ExportQR;
