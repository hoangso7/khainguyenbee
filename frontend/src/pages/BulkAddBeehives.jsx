import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createBeehive } from '../store/slices/beehiveSlice';
import DateInput from '../components/common/DateInput';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

const BulkAddBeehives = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.beehives);

  const [beehives, setBeehives] = useState([]);
  const [template, setTemplate] = useState({
    importDate: new Date().toISOString().split('T')[0],
    splitDate: '',
    healthStatus: 'Tốt',
    notes: '',
  });
  const [quantity, setQuantity] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [createdBeehives, setCreatedBeehives] = useState([]);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const healthStatusOptions = ['Tốt', 'Bình thường', 'Yếu'];

  const generateBeehives = () => {
    if (quantity < 1 || quantity > 100) {
      setError('Số lượng phải từ 1 đến 100 tổ ong');
      return;
    }

    const newBeehives = [];
    for (let i = 0; i < quantity; i++) {
      newBeehives.push({
        id: Date.now() + i,
        importDate: template.importDate,
        splitDate: template.splitDate || null,
        healthStatus: template.healthStatus,
        notes: template.notes,
        isGenerated: true,
      });
    }
    setBeehives(newBeehives);
    setError(null);
  };

  const updateBeehive = (index, field, value) => {
    const updated = [...beehives];
    updated[index] = { ...updated[index], [field]: value };
    setBeehives(updated);
  };

  const removeBeehive = (index) => {
    const updated = beehives.filter((_, i) => i !== index);
    setBeehives(updated);
  };

  const generateQRPDF = async (beehives) => {
    setIsGeneratingQR(true);
    try {
      const pdf = new jsPDF();
      const qrSize = 25; // Smaller size for 5x5 layout
      const perPage = 25; // 5 columns x 5 rows
      const margin = 10;
      const spacing = 5; // Minimal spacing for maximum QR codes
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate available space for QR codes
      const availableWidth = pageWidth - 2 * margin;
      const availableHeight = pageHeight - 2 * margin;
      
      // Calculate positions for 5 columns, 5 rows
      const cols = 5;
      const rows = 5;
      const colWidth = (availableWidth - (cols - 1) * spacing) / cols;
      const rowHeight = (availableHeight - (rows - 1) * spacing) / rows;
      
      let currentPage = 0;
      let qrCount = 0;
      
      for (let i = 0; i < beehives.length; i++) {
        const beehive = beehives[i];
        
        if (qrCount % perPage === 0 && qrCount > 0) {
          pdf.addPage();
          currentPage++;
        }
        
        const row = Math.floor((qrCount % perPage) / cols);
        const col = (qrCount % perPage) % cols;
        
        // Calculate center position for QR code
        const x = margin + col * (colWidth + spacing) + (colWidth - qrSize) / 2;
        const y = margin + row * (rowHeight + spacing) + (rowHeight - qrSize - 8) / 2; // Leave space for text
        
        // Generate QR code
        const qrUrl = `${window.location.origin}/beehive/${beehive.qr_token}`;
        const qrDataURL = await QRCode.toDataURL(qrUrl, {
          width: qrSize,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        // Add QR code image
        pdf.addImage(qrDataURL, 'PNG', x, y, qrSize, qrSize);
        
        // Add only beehive ID below QR code
        const textY = y + qrSize + 3;
        pdf.setFontSize(5);
        pdf.text(beehive.serial_number || 'N/A', x, textY);
        
        qrCount++;
      }
      
      // Save PDF
      const fileName = `QR_Codes_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      setSuccess(prev => prev ? prev + ` Đã tải xuống file QR codes: ${fileName}` : `Đã tải xuống file QR codes: ${fileName}`);
    } catch (error) {
      console.error('Error generating QR PDF:', error);
      setError('Có lỗi khi tạo file QR codes');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleCreateBeehives = async () => {
    if (beehives.length === 0) {
      setError('Vui lòng tạo ít nhất 1 tổ ong');
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccess(null);

    try {
      let successCount = 0;
      let errorCount = 0;
      const createdBeehivesList = [];

      for (const beehive of beehives) {
        try {
          const beehiveData = {
            import_date: beehive.importDate,
            split_date: beehive.splitDate || null,
            health_status: beehive.healthStatus,
            notes: beehive.notes,
          };
          
          const result = await dispatch(createBeehive(beehiveData)).unwrap();
          createdBeehivesList.push(result);
          successCount++;
        } catch (err) {
          console.error('Error creating beehive:', err);
          errorCount++;
        }
      }

      if (successCount > 0) {
        setSuccess(`Đã tạo thành công ${successCount} tổ ong${errorCount > 0 ? `, ${errorCount} tổ ong gặp lỗi` : ''}`);
        setCreatedBeehives(createdBeehivesList);
        setBeehives([]);
        setQuantity(1);
        
        // Automatically generate and download QR codes
        if (createdBeehivesList.length > 0) {
          await generateQRPDF(createdBeehivesList);
        }
      } else {
        setError('Không thể tạo tổ ong nào. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tạo tổ ong');
    } finally {
      setIsCreating(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = [
      'import_date,split_date,health_status,notes',
      `${template.importDate},${template.splitDate || ''},${template.healthStatus},${template.notes}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'beehive_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Thêm tổ ong theo số lượng lớn
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tạo nhiều tổ ong cùng lúc với thông tin mẫu
        </Typography>
      </Box>

      {/* Template Configuration */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cấu hình mẫu
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <DateInput
                fullWidth
                label="Ngày nhập"
                value={template.importDate}
                onChange={(e) => setTemplate({ ...template, importDate: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DateInput
                fullWidth
                label="Ngày tách"
                value={template.splitDate}
                onChange={(e) => setTemplate({ ...template, splitDate: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Tình trạng sức khỏe</InputLabel>
                <Select
                  value={template.healthStatus}
                  onChange={(e) => setTemplate({ ...template, healthStatus: e.target.value })}
                  label="Tình trạng sức khỏe"
                >
                  {healthStatusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Ghi chú"
                value={template.notes}
                onChange={(e) => setTemplate({ ...template, notes: e.target.value })}
                multiline
                rows={1}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Quantity and Generate */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Số lượng tổ ong"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                inputProps={{ min: 1, max: 100 }}
                helperText="Tối đa 100 tổ ong mỗi lần"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={generateBeehives}
                disabled={loading}
                fullWidth
              >
                Tạo danh sách
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={downloadTemplate}
                fullWidth
              >
                Tải mẫu CSV
              </Button>
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

      {/* Beehives List */}
      {beehives.length > 0 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Danh sách tổ ong ({beehives.length} tổ)
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleCreateBeehives}
                  disabled={isCreating}
                  startIcon={isCreating ? <CircularProgress size={20} /> : <AddIcon />}
                >
                  {isCreating ? 'Đang tạo...' : 'Tạo tất cả'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setBeehives([])}
                  disabled={isCreating}
                >
                  Xóa tất cả
                </Button>
              </Stack>
            </Box>

            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>STT</TableCell>
                    <TableCell>Ngày nhập</TableCell>
                    <TableCell>Ngày tách</TableCell>
                    <TableCell>Sức khỏe</TableCell>
                    <TableCell>Ghi chú</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {beehives.map((beehive, index) => (
                    <TableRow key={beehive.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <DateInput
                          size="small"
                          value={beehive.importDate}
                          onChange={(e) => updateBeehive(index, 'importDate', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <DateInput
                          size="small"
                          value={beehive.splitDate || ''}
                          onChange={(e) => updateBeehive(index, 'splitDate', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={beehive.healthStatus}
                            onChange={(e) => updateBeehive(index, 'healthStatus', e.target.value)}
                          >
                            {healthStatusOptions.map((status) => (
                              <MenuItem key={status} value={status}>
                                {status}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={beehive.notes || ''}
                          onChange={(e) => updateBeehive(index, 'notes', e.target.value)}
                          multiline
                          rows={1}
                          sx={{ minWidth: 150 }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => removeBeehive(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Box mt={3} display="flex" justifyContent="space-between">
        <Button
          variant="outlined"
          onClick={() => navigate('/dashboard')}
        >
          Quay lại Dashboard
        </Button>
        <Stack direction="row" spacing={2}>
          {createdBeehives.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => generateQRPDF(createdBeehives)}
              disabled={isGeneratingQR}
              startIcon={isGeneratingQR ? <CircularProgress size={20} /> : <QrCodeIcon />}
            >
              {isGeneratingQR ? 'Đang tạo QR...' : `Tải QR Codes (${createdBeehives.length})`}
            </Button>
          )}
          {beehives.length > 0 && (
            <Button
              variant="contained"
              color="success"
              onClick={handleCreateBeehives}
              disabled={isCreating}
              startIcon={isCreating ? <CircularProgress size={20} /> : <AddIcon />}
            >
              {isCreating ? 'Đang tạo...' : `Tạo ${beehives.length} tổ ong`}
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default BulkAddBeehives;
