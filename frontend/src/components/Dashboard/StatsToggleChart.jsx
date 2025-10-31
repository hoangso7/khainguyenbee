import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const StatsToggleChart = ({ healthData, speciesData }) => {
  const [mode, setMode] = useState('health');

  const isHealth = mode === 'health';

  const colors = isHealth
    ? { 'Tốt': '#228B22', 'Yếu': '#DC143C', 'Unknown': '#6c757d' }
    : { 'Furva Vàng': '#f59e0b', 'Furva Đen': '#374151', 'Unknown': '#6c757d' };

  const dataObj = isHealth ? healthData : speciesData;

  const chartData = useMemo(() => {
    if (!dataObj || typeof dataObj !== 'object') return [];
    return Object.entries(dataObj).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || '#6c757d'
    }));
  }, [dataObj, colors]);

  const total = chartData.reduce((s, d) => s + d.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percentage = total ? ((item.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white border border-gray-300 rounded p-2 shadow-lg">
          <p className="text-sm">{item.name}: {item.value} tổ ({percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ name, percent }) => {
    const count = dataObj?.[name] ?? 0;
    return `${name} (${count}) ${(percent * 100).toFixed(0)}%`;
  };

  const renderLegendText = (value) => {
    const count = dataObj?.[value] ?? 0;
    return `${value} (${count})`;
  };

  const title = isHealth ? 'Thống kê sức khỏe tổ ong' : 'Thống kê chủng loại tổ ong';
  const buttonText = isHealth ? 'Chủng loại' : 'Sức khỏe';

  if (!dataObj || typeof dataObj !== 'object') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-bold">{title}</CardTitle>
            <Button
              size="sm"
              onClick={() => setMode(isHealth ? 'species' : 'health')}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            >
              {buttonText}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] md:h-[280px] flex flex-col items-center justify-center gap-4">
            <img src="/bee.gif" alt="Loading..." className="w-12 h-12 rounded-full shadow-lg" />
            <p className="text-sm text-blue-600 font-medium opacity-80">Đang tải dữ liệu...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-bold">{title}</CardTitle>
          <Button
            size="sm"
            onClick={() => setMode(isHealth ? 'species' : 'health')}
            className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
          >
            {buttonText}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] md:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={60}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={renderLegendText} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsToggleChart;


