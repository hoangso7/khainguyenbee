import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
        <CardHeader>
          <CardTitle>Thống kê tổng quan</CardTitle>
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
        <div className="bg-white border border-gray-300 rounded p-2 shadow-lg">
          <p className="text-sm">{item.name}: {item.value} tổ ({percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thống kê tổng quan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
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
        </div>
        <div className="flex justify-around mt-4">
          <p className="text-sm font-bold text-green-600">
            Sức khỏe: Tốt/Yếu
          </p>
          <p className="text-sm font-bold text-amber-600">
            Chủng loại: Furva Vàng/Đen
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CombinedChart;