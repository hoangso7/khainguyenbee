import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const SpeciesChart = ({ data }) => {
  const colors = {
    'Furva Vàng': '#f59e0b',
    'Furva Đen': '#374151',
    'Unknown': '#6c757d'
  };

  if (!data || typeof data !== 'object') {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Thống kê chủng loại tổ ong
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

  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
    color: colors[name] || '#6c757d'
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const total = chartData.reduce((sum, d) => sum + d.value, 0);
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
          Thống kê chủng loại tổ ong
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SpeciesChart;


