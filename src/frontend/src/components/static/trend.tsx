'use client';
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

type TrendProps = {
  sensorId: string;
  dataType: string;
  valueCount?: number | 'all';
};

const LineChartComponent = ({ sensorId, dataType, valueCount }: TrendProps) => {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trend data for the selected sensor and dataType
  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/sensors/${sensorId}?dataType=${encodeURIComponent(dataType)}`);

        if (!response.ok) {
          throw new Error('Failed to fetch trend data');
        }

        const sensorData = await response.json();
        const messages = sensorData?.messages?.[dataType] || [];

        const formattedData = messages.map((msg: any) => ({
          name: msg.timestamp?.replace('T', ' ')?.replace(' @ ', ' ') || '',
          value: Number(msg.payload?.dataValue),
        }));

        setData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching trend data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    if (sensorId && dataType) {
      fetchTrendData();
      const intervalId = setInterval(fetchTrendData, 60000); // Update every minute
      return () => clearInterval(intervalId);
    }
  }, [sensorId, dataType]);

  // Only show value labels if there are not too many points
  const filteredData =
    valueCount === 'all' || !valueCount
      ? data
      : data.slice(-Number(valueCount));
  const showLabels = filteredData.length <= 20;

  if (loading) {
    return <div className="p-4 bg-secondary rounded-4xl text-white">Lade Trenddaten...</div>;
  }

  if (error) {
    return <div className="p-4 bg-secondary rounded-4xl text-white">Fehler: {error}</div>;
  }

  return (
    <div className="p-4 bg-secondary max-w-full h-auto rounded-4xl ring-1 ring-success/20 shadow-md shadow-success/30">
      <h2 className="text-2xl font-bold mb-4 text-white">
        {dataType ? `${dataType}-Trend` : 'Trend'}
      </h2>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart
          data={filteredData}
          margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke="#4A4A4A" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#737373', fontSize: 10 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#737373', fontSize: 12 }}
            domain={['auto', 'auto - 1']}
            allowDecimals={true}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F1F1F', border: 'none' }}
            labelStyle={{ color: '#FFF' }}
            itemStyle={{ color: '#FFF' }}
            cursor={{ stroke: '#4A4A4A' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#1DF419"
            strokeWidth={3}
            dot={{
              r: 5,
              fill: '#1DF419',
              strokeWidth: 0,
              style: {
                transition: 'all 0.3s ease',
              },
            }}
            activeDot={{
              r: 7,
              fill: '#1DF419',
              strokeWidth: 0,
              style: {
                transition: 'all 0.3s ease',
              },
            }}
          >
            {showLabels && (
              <LabelList
                dataKey="value"
                position="top"
                fill="#FFF"
                fontSize={14}
              />
            )}
          </Line>
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 flex items-center text-white text-lg font-bold">
        <span>Langzeit-Trend:</span>
        <span className="ml-2 text-2xl text-success">
          {filteredData.length > 1 &&
            (Number(filteredData[filteredData.length - 1]?.value) > Number(filteredData[filteredData.length - 2]?.value)
              ? "↑"
              : Number(filteredData[filteredData.length - 1]?.value) < Number(filteredData[filteredData.length - 2]?.value)
              ? "↓"
              : "→")}
        </span>
      </div>
    </div>
  );
};

export default LineChartComponent;