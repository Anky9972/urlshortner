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
      <div className="bg-[hsl(230,10%,14%)] p-3 shadow-lg rounded-lg border border-[hsl(230,10%,20%)]">
        <p className="font-medium text-white">{label}</p>
        <p className="text-emerald-400">
          Visitors: {payload[0].value.toLocaleString()}
        </p>
        <p className="text-slate-400 text-sm">
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
    switch (type) {
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
                <stop offset={off} stopColor="#10b981" stopOpacity={0.8} />
                <stop offset={off} stopColor="#ef4444" stopOpacity={0.8} />
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
    city: PropTypes.string,
    count: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired
  })).isRequired,
  type: PropTypes.oneOf(['line', 'area', 'composed']).isRequired
};

const LocationStats = ({ stats = [] }) => {
  const [chartType, setChartType] = useState('line');

  // Process data – use city name, fall back to country, then 'Unknown'
  const cityCount = stats.reduce((acc, item) => {
    const loc = item.city || item.country || 'Unknown';
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});

  // Filter out 'Unknown' if there is real data, otherwise keep it
  const entries = Object.entries(cityCount).sort((a, b) => b[1] - a[1]);
  const hasRealData = entries.some(([key]) => key !== 'Unknown');
  const filteredEntries = hasRealData ? entries.filter(([key]) => key !== 'Unknown') : entries;

  const cities = filteredEntries.slice(0, 5).map(([city, count]) => ({
    city,
    count,
    total: stats.length
  }));

  return (
    <Card className="w-full bg-[hsl(230,12%,9%)] border-[hsl(230,10%,15%)]">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span className="text-base font-semibold">Location Distribution</span>
          <Tabs defaultValue="line" className="w-full sm:w-auto">
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
    city: PropTypes.string,
    country: PropTypes.string
  }))
};

export default LocationStats;