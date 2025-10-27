import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';

const UnifiedStatsCard = ({ stats }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const statsData = [
    {
      title: "Tổng số tổ ong",
      value: stats?.total || 0,
      icon: "🐝",
      color: "#D2691E"
    },
    {
      title: "Tổ đang quản lý", 
      value: stats?.active || 0,
      icon: "📊",
      color: "#1976d2"
    },
    {
      title: "Tổ đã bán",
      value: stats?.sold || 0,
      icon: "💰", 
      color: "#FF8C00"
    },
    {
      title: "Tổ khỏe mạnh",
      value: stats?.healthy || 0,
      icon: "💚",
      color: "#228B22"
    }
  ];

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        border: '1px solid #dee2e6',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box mb={2}>
          <Typography 
            variant="h6" 
            component="h2" 
            sx={{ 
              fontWeight: 600,
              color: '#2c3e50',
              fontSize: { xs: '1rem', sm: '1.125rem' }
            }}
          >
            📈 Thống kê tổng quan
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={isMobile ? 1 : 2} sx={{ margin: 0 }}>
          {statsData.map((stat, index) => (
            <Grid item xs={6} sm={3} key={index} sx={{ padding: isMobile ? '4px' : '8px' }}>
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}25 100%)`,
                  border: `1px solid ${stat.color}30`,
                  borderRadius: 1.5,
                  p: { xs: 1.5, sm: 2 },
                  height: '100%',
                  minHeight: { xs: 80, sm: 90 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}35 100%)`,
                    transform: 'scale(1.02)',
                  },
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '1.75rem' },
                    mb: 0.5,
                    opacity: 0.8
                  }}
                >
                  {stat.icon}
                </Box>
                
                {/* Value */}
                <Typography
                  variant="h5"
                  component="div"
                  sx={{
                    fontWeight: 'bold',
                    color: stat.color,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    lineHeight: 1.2,
                    mb: 0.5
                  }}
                >
                  {stat.value}
                </Typography>
                
                {/* Title */}
                <Typography
                  variant="body2"
                  sx={{
                    color: '#495057',
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    lineHeight: 1.2,
                    fontWeight: 500,
                    textAlign: 'center'
                  }}
                >
                  {stat.title}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Summary */}
        <Box 
          mt={2} 
          sx={{ 
            pt: 2, 
            borderTop: '1px solid #dee2e6',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#6c757d',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              fontWeight: 500
            }}
          >
            Tỷ lệ khỏe mạnh: 
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#228B22',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              fontWeight: 'bold'
            }}
          >
            {stats?.total > 0 ? Math.round((stats?.healthy / stats?.total) * 100) : 0}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UnifiedStatsCard;
