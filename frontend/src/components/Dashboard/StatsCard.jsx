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
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {title}
            </Typography>
          </Box>
          <Box fontSize="2.5rem" opacity={0.8}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
