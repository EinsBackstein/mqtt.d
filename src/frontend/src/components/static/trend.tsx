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

const LineChartComponent = ({sensorId}:{sensorId:string}) => {
  // State to store temperature data
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch temperature data on component mount
  useEffect(() => {
    const fetchTemperatureData = async () => {
      try {
        setLoading(true);
        // Fetch temperature data from API
        const response = await fetch('/api/temperature-data/' + sensorId);
        
        if (!response.ok) {
          throw new Error('Failed to fetch temperature data');
        }
        
        const tempData = await response.json();
        // console.log('Raw data:', tempData);
        
        // Format the data to match the required structure
        const formattedData = tempData.map((item: { name: any; temperature: any; value: any; }) => ({
          name: item.name, // Use timestamp as name for X-axis, with fallback
          value: item.temperature || item.value // Handle both possible field names
        }));
        
        // console.log('Formatted data:', formattedData);
        setData(formattedData); // Use the formatted data instead of raw data
        setLoading(false);
      } catch (err) {
        console.error('Error fetching temperature data:', err);
        
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        setLoading(false);
      }
    };

    fetchTemperatureData();
    
    // Optional: Set up polling or WebSocket connection for real-time updates
    const intervalId = setInterval(fetchTemperatureData, 60000); // Update every minute
    
    return () => clearInterval(intervalId); // Clean up on unmount
  }, []);

  if (loading) {
    return <div className="p-4 bg-secondary rounded-4xl text-white">Loading temperature data...</div>;
  }

  if (error) {
    return <div className="p-4 bg-secondary rounded-4xl text-white">Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-secondary max-w-full h-auto rounded-4xl ring-1 ring-success/20 shadow-md shadow-success/30">
      {/* Titel der Komponente */}
      <h2 className="text-2xl font-bold mb-4 text-white">Temperatur-Trend</h2>

      {/* Responsiver Container für das Diagramm */}
      <ResponsiveContainer width="100%" height={500}>
        {/* Hauptdiagramm-Komponente */}
        <LineChart
          data={data} // Using properly formatted data
          margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
        >
          {/* Hintergrundraster mit nur horizontalen Linien */}
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
            domain={['auto', 'auto - 1']} // Slightly extend the range for better scaling
            allowDecimals={true} // Allow decimal values for finer granularity
            additive='sum'
            />

          {/* Tooltip mit dunklem Design */}
          <Tooltip
            contentStyle={{ backgroundColor: '#1F1F1F', border: 'none' }}
            labelStyle={{ color: '#FFF' }}
            itemStyle={{ color: '#FFF' }}
            cursor={{ stroke: '#4A4A4A' }} // Cursor-Stil für Hover-Effekt
          />

          {/* Linie mit grüner Farbe und sichtbaren Punkten */}
          <Line
            type="monotone" // Glatte Linie
            dataKey="value"
            stroke="#1DF419"
            strokeWidth={3}
            dot={{
              r: 5,
              fill: '#1DF419',
              strokeWidth: 0,
              style: {
                transition: 'all 0.3s ease', // Smooth transition for all styles
              },
            }}
            activeDot={{
              r: 7,
              fill: '#1DF419',
              strokeWidth: 0,
              style: {
                transition: 'all 0.3s ease', // Smooth transition for active dot
              },
            }}
          >
            {/* Anzeigen der Werte über den Punkten */}
            <LabelList
              dataKey="value"
              position="top"
              fill="#FFF"
              fontSize={14}
            />
          </Line>
        </LineChart>
      </ResponsiveContainer>

      {/* Bereich unterhalb des Diagramms für Trend-Visualisierung */}
      <div className="mt-4 flex items-center text-white text-lg font-bold">
        <span>Langzeit-Trend:</span>
        <span className="ml-2 text-2xl text-success">
            {data.length > 1 && 
            (Number(data[data.length - 1]?.value) > Number(data[data.length - 2]?.value) ? "↑" : 
             Number(data[data.length - 1]?.value) < Number(data[data.length - 2]?.value) ? "↓" : "→")}
        </span>
      </div>
    </div>
  );
};
export default LineChartComponent;