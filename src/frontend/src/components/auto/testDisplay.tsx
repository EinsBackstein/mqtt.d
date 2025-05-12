// 'use client'
// import { useEffect, useState } from 'react'
// import BaseLayer from './baseLayer'
// import { Thermometer, Sun, CloudRain, Gauge, Wind } from 'lucide-react'
// import type { SensorConfig, SensorData } from '@/lib/types'

// export default function SensorDataDisplay({ sensorId }) {
//   const [sensorData, setSensorData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Helper functions
// function getIconForDataType(dataType) {
//   // Return appropriate icon based on data type
// }

// function getLatestValue(messages) {
//   return messages && messages.length > 0 ? messages[messages.length - 1].value : "No data";
// }

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const response = await fetch(`/api/sensors/${sensorId}`);
        
//         if (!response.ok) {
//           // Still show the sensor if it exists but has no data
//           if (response.status === 404) {
//             // Basic sensor info without messages
//             setSensorData({ 
//               sensor: { sensorID: sensorId, name: `Sensor ${sensorId}` },
//               configurations: {},
//               messages: {}
//             });
//             return;
//           }
//           throw new Error('Failed to fetch sensor data');
//         }
        
//         const data = await response.json();
//         setSensorData(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }
    
//     fetchData();
//   }, [sensorId]);

//   if (loading) return <div>Loading sensor {sensorId}...</div>;
//   if (error) return <div>Error loading sensor {sensorId}: {error}</div>;
  
//   // Render the sensor even if it has no message data
//   return (
//     <div className="sensor-display">
//       <h2>{sensorData.sensor.name || `Sensor ${sensorId}`}</h2>
      
//       {/* Display basic sensor info regardless of message data */}
//       <div className="sensor-info">
//         <p>ID: {sensorId}</p>
//         {/* Add other basic sensor properties here */}
//       </div>
      
//       {/* Conditionally render data types if messages exist */}
//       {Object.keys(sensorData.configurations).map(dataType => (
//         <div key={dataType} className="data-type">
//           <h3>{dataType}</h3>
          
//           {/* Only show message data if it exists */}
//           {sensorData.messages[dataType] && sensorData.messages[dataType].length > 0 ? (
//             <BaseLayer
//               icon={getIconForDataType(dataType)}
//               heading={dataType}
//               id={sensorId}
//               value={getLatestValue(sensorData.messages[dataType])}
//               lastValue={getPreviousValue(sensorData.messages[dataType])}
//               timeStamp={getLatestTimestamp(sensorData.messages[dataType])}
//               statusColor={getStatusColor(dataType, sensorData.messages[dataType])}
//             />
//           ) : (
//             <BaseLayer
//               icon={getIconForDataType(dataType)}
//               heading={dataType}
//               id={sensorId}
//               value="No data"
//               statusColor="#888888"
//             />
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }


// "use client"
// import { useEffect, useState } from 'react';
// import BaseLayer from './baseLayer';
// import { SensorData, SensorConfig } from '@/lib/types';
// import { IceCream } from 'lucide-react';

// const SensorDataDisplay = ({ sensorId }: { sensorId: string }) => {
//   const [sensorData, setSensorData] = useState<SensorData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(`/api/sensors/${sensorId}`);
//         if (!response.ok) throw new Error('Failed to fetch');
//         const data = await response.json();
//         setSensorData(data);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'Unknown error');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//     const interval = setInterval(fetchData, 5000); // Refresh every 5s
//     return () => clearInterval(interval);
//   }, [sensorId]);

//   const getStatusColor = (config: SensorConfig) => {
//     if (!config.grenzwerte || !config.latestValue) return '#4CAF50';
    
//     return config.grenzwerte.reduce((acc, threshold) => {
//       if (
//         (threshold.condition === 'über' && config.latestValue! > threshold.value) ||
//         (threshold.condition === 'unter' && config.latestValue! < threshold.value) ||
//         (threshold.condition === 'gleich' && config.latestValue! === threshold.value)
//       ) {
//         return threshold.color;
//       }
//       return acc;
//     }, '#4CAF50');
//   };

//   if (loading) return <div>Loading sensor data...</div>;
//   if (error) return <div>Error: {error}</div>;
//   if (!sensorData) return <div>No sensor data found</div>;

//   const getDefaultValues = (dataType: string) => {
//     return {
//       value: 'N/A',
//       unit: sensorData?.configurations[dataType]?.unit || '--',
//       timestamp: 'No data available'
//     }
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
//       {sensorData?.sensor.sensorData.map((dataType) => {
//         const config = sensorData.configurations[dataType]
//         const messages = sensorData.messages[dataType] || []
//         const latest = messages[messages.length - 1]
//         const previous = messages.length >= 2 ? messages[messages.length - 2] : null
        
//         // Get values or defaults
//         const { value, unit, timestamp } = latest || getDefaultValues(dataType)
//         const lastValue = previous?.value

//         // Status color handling
//         const statusColor = latest ? 
//           calculateStatusColor(config, latest.value) : 
//           '#666' // Gray for no data

//         return (
//           <BaseLayer
//             key={dataType}
//             icon={getIcon(dataType)}
//             heading={dataType}
//             id={sensorId}
//             value={value}
//             unit={unit} // Add unit prop
//             lastValue={lastValue}
//             timeStamp={timestamp}
//             statusColor={statusColor}
//           />
//         )
//       })}
//     </div>
//   )
// };

// export default SensorDataDisplay;

'use client'
import { useEffect, useState } from 'react';
import BaseLayer from './baseLayer';
import { SensorDataResponse, SensorConfig } from '@/lib/types';
import { Thermometer, Sun, CloudRain, Gauge, Wind, InfoIcon } from 'lucide-react';

const SensorDataDisplay = ({ sensorId }: { sensorId: string }) => {
  const [sensorData, setSensorData] = useState<SensorDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/sensors/${sensorId}`);
        
        if (!response.ok) {
          // Still show the sensor if it exists but has no data
          if (response.status === 404) {
            // Basic sensor info without messages
            setSensorData({ 
              sensor: { 
                sensorID: sensorId, 
                sensorTyp: 'Unknown', 
                sensorName: `Sensor ${sensorId}`,
                sensorDescription: 'No description available',
                location: { room: 'Unknown', floor: 'Unknown', description: 'No location data' },
                sensorData: [] // Empty data types
              },
              configurations: {},
              messages: {}
            });
            return;
          }
          throw new Error('Failed to fetch');
        }
        
        const data = await response.json();
        setSensorData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, [sensorId]);

  // Helper functions
  const getIcon = (dataType: string) => {
    switch (dataType.toLowerCase()) {
      case 'temperature':
      case 'temperatur':
        return <Thermometer />;
      case 'humidity':
      case 'luftfeuchtigkeit':
        return <CloudRain />;
      case 'brightness':
      case 'helligkeit':
        return <Sun />;
      case 'pressure':
      case 'luftdruck':
        return <Gauge />;
      case 'luftqualität':
      case 'airquality':
        return <Wind />;
      default:
        return <InfoIcon />;
    }
  };

  const calculateStatusColor = (config: SensorConfig, value: number) => {
    if (!config?.grenzwerte) return '#4CAF50'; // Default green
    
    return config.grenzwerte.reduce((acc, threshold) => {
      if (
        (threshold.condition === 'über' && value > threshold.value) ||
        (threshold.condition === 'unter' && value < threshold.value) ||
        (threshold.condition === 'gleich' && value === threshold.value)
      ) {
        return threshold.color;
      }
      return acc;
    }, '#4CAF50');
  };

  const getDefaultValues = (dataType: string) => {
    return {
      value: 'N/A',
      unit: sensorData?.configurations[dataType]?.unit || '--',
      timestamp: 'No data available yet'
    };
  };

  if (loading) return <div>Loading sensor {sensorId}...</div>;
  if (error) return <div>Error loading sensor {sensorId}: {error}</div>;
  if (!sensorData) return <div>No sensor data found for sensor {sensorId}</div>;

  console.log(sensorData.sensor.sensorName);

  // If no sensor data types are defined, display an empty sensor card
  if (!sensorData.sensor.sensorData || sensorData.sensor.sensorData.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">
          {sensorData.sensor.sensorName || `Sensor ${sensorId}`}
        </h2>
        <div className="bg-secondary p-4 rounded-lg">
          <p>Sensor registered but no data types configured</p>
          <p className="text-sm text-muted-foreground">ID: {sensorId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">
        {`Sensor ${sensorId} | ` + sensorData.sensor.sensorName}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensorData.sensor.sensorData.map((dataType) => {
          const config = sensorData.configurations[dataType];
          const messages = sensorData.messages[dataType] || [];
          const latest = messages[messages.length - 1];
          const previous = messages.length >= 2 ? messages[messages.length - 2] : null;
          
          // Get values or defaults
          const { value, unit, timestamp } = latest || getDefaultValues(dataType);
          const lastValue = previous?.value;

          // Status color handling
          const statusColor = latest ? 
            calculateStatusColor(config, Number(latest.value)) : 
            '#666666'; // Gray for no data

          return (
            <BaseLayer
              key={dataType}
              icon={getIcon(dataType)}
              heading={dataType}
              id={sensorId}
              value={value}
              unit={unit} // Add unit prop
              lastValue={lastValue}
              timeStamp={timestamp}
              statusColor={statusColor}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SensorDataDisplay;