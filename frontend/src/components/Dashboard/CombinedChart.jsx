import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const CombinedChart = ({ healthData, speciesData }) => {
  const healthColors = {
    'Tốt': '#228B22',
    'Yếu': '#DC143C',
    'Unknown': '#6c757d'
  };

  const speciesColors = {
    'Furva Vàng': '#f59e0b',
    'Furva Đen': '#374151',
    'Unknown': '#6c757d'
  };

  if (!healthData || !speciesData || typeof healthData !== 'object' || typeof speciesData !== 'object') {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Thống kê tổng quan
          </Typography>
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            sx={{ flexDirection: 'column', gap: 2, py: 3 }}
          >
            <img src="/bee.gif" alt="Loading..." style={{ width: '60px', height: '60px', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
            <Typography variant="body2" color="primary" sx={{ fontWeight: 500, opacity: 0.8 }}>
              Đang tải dữ liệu...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const healthChartData = Object.entries(healthData).map(([name, value]) => ({
    name,
    value,
    color: healthColors[name] || '#6c757d'
  }));

  const speciesChartData = Object.entries(speciesData).map(([name, value]) => ({
    name,
    value,
    color: speciesColors[name] || '#6c757d'
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const total = item.payload.total || item.value;
      const percentage = total ? ((item.value / total) * 100).toFixed(1) : 0;
      return (
        <Box sx={{ background: 'white', border: '1px solid #ccc', borderRadius: 1, p: 1, boxShadow: 2 }}>
          <Typography variant="body2">{item.name}: {item.value} tổ ({percentage}%)</Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Thống kê tổng quan
        </Typography>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* Health Pie Chart */}
              <Pie 
                data={healthChartData} 
                cx="25%" 
                cy="50%" 
                labelLine={false} 
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} 
                outerRadius={60} 
                dataKey="value"
              >
                {healthChartData.map((entry, index) => (
                  <Cell key={`health-cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              
              {/* Species Pie Chart */}
              <Pie 
                data={speciesChartData} 
                cx="75%" 
                cy="50%" 
                labelLine={false} 
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} 
                outerRadius={60} 
                dataKey="value"
              >
                {speciesChartData.map((entry, index) => (
                  <Cell key={`species-cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#228B22' }}>
            Sức khỏe: Tốt/Yếu
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f59e0b' }}>
            Chủng loại: Furva Vàng/Đen
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CombinedChart;
