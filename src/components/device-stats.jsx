import { useState } from 'react';
import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Custom colors with better contrast
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// Rendered shape for active segment
const renderActiveShape = (props) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 6}
        outerRadius={innerRadius - 2}
        fill={fill}
      />
      <text 
        x={cx} 
        y={cy - 10} 
        textAnchor="middle" 
        fill="#666"
        className="text-base font-medium"
      >
        {payload.device}
      </text>
      <text 
        x={cx} 
        y={cy + 10} 
        textAnchor="middle" 
        fill="#666"
        className="text-sm"
      >
        {`${value} (${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};

const DeviceStatsChart = ({ stats }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Process stats data to count devices
  const deviceCount = stats.reduce((acc, item) => {
    if (!acc[item.device]) {
      acc[item.device] = 0;
    }
    acc[item.device]++;
    return acc;
  }, {});

  // Convert to array format for Recharts
  const data = Object.entries(deviceCount).map(([device, count]) => ({
    device,
    count,
  }));

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    CustomTooltip.propTypes = {
      active: PropTypes.bool,
      payload: PropTypes.arrayOf(
        PropTypes.shape({
          payload: PropTypes.shape({
            device: PropTypes.string,
            count: PropTypes.number,
          }),
        })
      ),
    };
    if (active && payload && payload.length) {
      const { device, count } = payload[0].payload;
      const percentage = ((count / stats.length) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="font-medium text-gray-900">{device}</p>
          <p className="text-gray-600">Devices: {count}</p>
          <p className="text-gray-600">Percentage: {percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full bg-gray-800/50 border-gray-700/50">
      <CardHeader>
        <CardTitle>Device Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                dataKey="count"
                nameKey="device"
                onMouseEnter={onPieEnter}
                animationBegin={0}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => (
                  <span className="text-gray-600">{value}</span>
                  
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
DeviceStatsChart.propTypes = {
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      device: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default DeviceStatsChart;