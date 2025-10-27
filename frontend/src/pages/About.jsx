import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Info as InfoIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import getAppConfig from '../../services/config.js';

const About = () => {
  const appConfig = getAppConfig();

  const features = [
    'Quản lý tổ ong thông minh',
    'Theo dõi sức khỏe tổ ong',
    'Tạo mã QR cho từng tổ',
    'Xuất báo cáo PDF',
    'Giao diện thân thiện',
    'Bảo mật cao',
  ];

  const technicalSpecs = [
    'Frontend: React 18 + Material-UI',
    'Backend: Python Flask + SQLAlchemy',
    'Database: MySQL',
    'Authentication: JWT',
    'Rate Limiting: Redis',
    'Deployment: Docker + Nginx',
  ];

  return (
    <Box p={3}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Giới thiệu về {appConfig.appName}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Hệ thống quản lý tổ ong hiện đại và tiện lợi
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* App Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <InfoIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Thông tin ứng dụng
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tên phần mềm:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {appConfig.appName}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Phiên bản:
                  </Typography>
                  <Chip label={appConfig.version} color="primary" size="small" />
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Domain:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {appConfig.domain}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Công ty phát triển:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {appConfig.companyName}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Features */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CheckIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Tính năng chính
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                {features.map((feature, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemIcon>
                      <CheckIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Technical Specifications */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SpeedIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Thông số kỹ thuật
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {technicalSpecs.map((spec, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {spec}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Security & Support */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SecurityIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Bảo mật
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Hệ thống được thiết kế với các biện pháp bảo mật tiên tiến:
              </Typography>
              
              <List dense>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Xác thực JWT" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Rate Limiting" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="CORS Protection" />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <CheckIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="SSL/TLS Encryption" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SupportIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Hỗ trợ
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Nếu bạn gặp bất kỳ vấn đề nào hoặc cần hỗ trợ, vui lòng liên hệ:
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Email:</strong> admin@{appConfig.domain}
                </Typography>
                <Typography variant="body2">
                  <strong>Website:</strong> https://{appConfig.domain}
                </Typography>
                <Typography variant="body2">
                  <strong>Phiên bản:</strong> {appConfig.version}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default About;
