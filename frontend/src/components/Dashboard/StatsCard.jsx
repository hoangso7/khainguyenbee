import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const StatsCard = ({ title, value, icon, color = 'primary' }) => {
  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${color === 'primary' ? '#D2691E' : 
          color === 'info' ? '#1976d2' : 
          color === 'warning' ? '#FF8C00' : 
          color === 'success' ? '#228B22' : '#D2691E'} 0%, ${
          color === 'primary' ? '#F4A460' : 
          color === 'info' ? '#42a5f5' : 
          color === 'warning' ? '#ffb74d' : 
          color === 'success' ? '#4caf50' : '#F4A460'} 100%)`,
        color: 'white',
        height: '100%',
        minHeight: { xs: 100, sm: 120 },
        width: '100%',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" height="100%">
          <Box flex={1}>
            <Typography 
              variant="h4" 
              component="div" 
              fontWeight="bold"
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                lineHeight: 1.2
              }}
            >
              {value}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                opacity: 0.9,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                lineHeight: 1.2,
                mt: 0.5
              }}
            >
              {title}
            </Typography>
          </Box>
          <Box 
            fontSize={{ xs: '1.5rem', sm: '2rem', md: '2.5rem' }} 
            opacity={0.8}
            ml={1}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
