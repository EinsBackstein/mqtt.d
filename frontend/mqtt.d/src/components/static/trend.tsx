"use client";
import React from 'react';
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

// Beispiel-Daten mit Zeitstempeln als X-Achsen-Werte
const data = [
  { name: '20-04-2025@14:05', value: 24 },
  { name: '20-04-2025@15:10', value: 22 },
  { name: '20-04-2025@16:20', value: 26 },
  { name: '20-04-2025@17:30', value: 25 },
  { name: '20-04-2025@18:40', value: 18 },
];

const LineChartComponent = () => {
  console.log("LineChartComponent wird gerendert"); // Protokoll für Debugging

  return (
    <div className="p-4 bg-secondary max-w-full h-auto rounded-4xl ring-1 ring-success/20 shadow-md shadow-success/30">
      {/* Titel der Komponente */}
      <h2 className="text-2xl font-bold mb-4 text-white">
        Temperatur-Trend
      </h2>

      {/* Responsiver Container für das Diagramm */}
      <ResponsiveContainer width="100%" height={200}>
        {/* Hauptdiagramm-Komponente */}
        <LineChart
          data={data} // Übergabe der Daten
          margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
        >
          {/* Hintergrundraster mit nur horizontalen Linien */}
          <CartesianGrid stroke="#4A4A4A" vertical={false} />

          {/* X-Achse mit deaktivierten Linien und benutzerdefiniertem Textstil */}
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#737373', fontSize: 12 }}
          />

          {/* Y-Achse mit ähnlicher Formatierung wie X-Achse */}
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#737373', fontSize: 12 }}
          />

          {/* Tooltip mit dunklem Design */}
          <Tooltip
            contentStyle={{ backgroundColor: '#1F1F1F', border: 'none' }}
            labelStyle={{ color: '#FFF' }}
            itemStyle={{ color: '#FFF' }}
            cursor={{ stroke: '#4A4A4A'}} // Cursor-Stil für Hover-Effekt
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
            <LabelList dataKey="value" position="top" fill="#FFF" fontSize={14} />
          </Line>
        </LineChart>
      </ResponsiveContainer>

      {/* Bereich unterhalb des Diagramms für Trend-Visualisierung */}
      <div className="mt-4 flex items-center text-white text-lg font-bold">
        <span>Langzeit-Trend:</span>
        <span className="ml-2 text-2xl text-success">↑</span>
      </div>
    </div>
  );
};

export default LineChartComponent;