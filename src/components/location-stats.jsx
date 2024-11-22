import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
  ComposedChart,
  Bar
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-emerald-600">
          Visitors: {payload[0].value.toLocaleString()}
        </p>
        <p className="text-gray-600 text-sm">
          {((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}% of total
        </p>
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.number,
    payload: PropTypes.shape({
      total: PropTypes.number
    })
  })),
  label: PropTypes.string
};

const ChartContent = ({ data, type }) => {
  const gradientOffset = () => {
    const dataMax = Math.max(...data.map(i => i.count));
    const dataMin = Math.min(...data.map(i => i.count));
    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;
    return dataMax / (dataMax - dataMin);
  };

  const off = gradientOffset();

  const renderChart = () => {
    switch(type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="city" 
              tick={{ fill: '#666' }}
              axisLine={{ stroke: '#ccc' }}
            />
            <YAxis 
              tick={{ fill: '#666' }}
              axisLine={{ stroke: '#ccc' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2 }}
              activeDot={{ r: 8 }}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </LineChart>
        );
      
      case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset={off} stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset={off} stopColor="#ef4444" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="city" 
              tick={{ fill: '#666' }}
              axisLine={{ stroke: '#ccc' }}
            />
            <YAxis 
              tick={{ fill: '#666' }}
              axisLine={{ stroke: '#ccc' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#10b981"
              fill="url(#splitColor)"
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </AreaChart>
        );
      
      case 'composed':
        return (
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="city" 
              tick={{ fill: '#666' }}
              axisLine={{ stroke: '#ccc' }}
            />
            <YAxis 
              tick={{ fill: '#666' }}
              axisLine={{ stroke: '#ccc' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="count" 
              fill="#10b981" 
              barSize={20}
              animationDuration={1500}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2 }}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </ComposedChart>
        );
      
      default:
        return null;
    }
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      {renderChart()}
    </ResponsiveContainer>
  );
};

ChartContent.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    city: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired
  })).isRequired,
  type: PropTypes.oneOf(['line', 'area', 'composed']).isRequired
};

const LocationStats = ({ stats = [] }) => {
  const [chartType, setChartType] = useState('line');

  // Process data
  const cityCount = stats.reduce((acc, item) => {
    if (acc[item.city]) {
      acc[item.city] += 1;
    } else {
      acc[item.city] = 1;
    }
    return acc;
  }, {});

  // Convert to array and sort by count
  const cities = Object.entries(cityCount)
    .map(([city, count]) => ({
      city,
      count,
      total: stats.length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <Card className="w-full bg-gray-800/50 border-gray-700/50">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className='hidden lg:flex'>Location Distribution</span>
          <Tabs defaultValue="line" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger 
                value="line"
                onClick={() => setChartType('line')}
              >
                Line Chart
              </TabsTrigger>
              <TabsTrigger 
                value="area"
                onClick={() => setChartType('area')}
              >
                Area Chart
              </TabsTrigger>
              <TabsTrigger 
                value="composed"
                onClick={() => setChartType('composed')}
              >
                Composed
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContent data={cities} type={chartType} />
      </CardContent>
    </Card>
  );
};

LocationStats.propTypes = {
  stats: PropTypes.arrayOf(PropTypes.shape({
    city: PropTypes.string.isRequired
  }))
};

export default LocationStats;