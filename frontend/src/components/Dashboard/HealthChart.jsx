import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const HealthChart = ({ data }) => {
  const colors = {
    'Tốt': '#228B22',
    'Yếu': '#DC143C',
    'Unknown': '#6c757d'
  };

  // Kiểm tra data có tồn tại và không null/undefined
  if (!data || typeof data !== 'object') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thống kê sức khỏe tổ ong</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-6">
            <img 
              src="/bee.gif" 
              alt="Loading..." 
              className="w-15 h-15 rounded-full shadow-lg" 
            />
            <p className="text-sm text-blue-600 font-medium opacity-80">
              Đang tải dữ liệu...
            </p>
          </div>
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
      const data = payload[0];
      const total = chartData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white border border-gray-300 rounded p-2 shadow-lg">
          <p className="text-sm">
            {data.name}: {data.value} tổ ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thống kê sức khỏe tổ ong</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthChart;