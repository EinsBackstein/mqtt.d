'use client'
import { useEffect, useState } from 'react';
import BaseLayer from './baseLayer';
import { SensorDataResponse, SensorConfig } from '../../lib/types'
import { Thermometer, Sun, CloudRain, Gauge, Wind, InfoIcon, CloudAlert } from 'lucide-react';
import { Button } from '../ui/button';

const SensorDataDisplay = ({ sensorId, htmlId, verticalId, notId }: { notId:boolean, sensorId: string, htmlId: boolean, verticalId: boolean }) => {
  const [sensorData, setSensorData] = useState<SensorDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Extract fetchData function so it can be called from multiple places
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
            messages: []
          });
          return;
        }
        throw new Error('Failed to fetch');
      }
      
      const data = await response.json();
      setSensorData(data);
      // console.log(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, [sensorId]);

  // Helper function to parse message values
  const parseMessageValue = (message: { timestamp: string; payload: { dataValue: string } }) => {
    if (!message) return null;
    return {
      value: parseFloat(message.payload.dataValue),
      timestamp: message.timestamp,
    };
  };

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

  // Updated calculateStatusColor with type safety
  const calculateStatusColor = (config: SensorConfig | undefined, value: number) => {
    if (!config?.grenzwerte) return '#4CAF50';
    
    return config.grenzwerte.reduce((acc, threshold) => {
      const meetsCondition = 
        (threshold.condition === 'über' && value > threshold.value) ||
        (threshold.condition === 'unter' && value < threshold.value) ||
        (threshold.condition === 'gleich' && value === threshold.value);
      
      return meetsCondition ? threshold.color : acc;
    }, '#4CAF50');
  };

  // Function to send force update command with immediate refresh
  const handleForceUpdate = async () => {
    if (!sensorData?.sensor) return;
    
    setUpdating(true);
    try {
      const response = await fetch('/api/mqtt/force-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sensorTyp: sensorData.sensor.sensorTyp,
          clientId: sensorId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send update command');
      }
      
      console.log('Force update command sent successfully');
      
      // Wait 2 seconds then refresh data
      setTimeout(async () => {
        console.log('Refreshing data after force update');
        await fetchData();
        setUpdating(false);
      }, 500);
      
    } catch (error) {
      console.error('Error sending force update:', error);
      setUpdating(false);
    }
  };

  if (loading) return <div>Loading sensor {sensorId}...</div>;
  if (error) return <div>Error loading sensor {sensorId}: {error}</div>;
  if (!sensorData) return <div>No sensor data found for sensor {sensorId}</div>;

  // console.log(sensorData);

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
        {sensorData?.sensor.sensorName + ` | Sensor #${sensorId}`}
        <Button 
          variant="outline" 
          className="ml-2"
          onClick={handleForceUpdate}
          disabled={updating}
        >
          {updating ? 'Refreshing...' : 'Force-Update'}
        </Button>
      </h2>
      <div 
        className={`grid grid-cols-1 md:grid-cols-2  ${
          htmlId ? 'lg:grid-cols-2' : ''
        } ${verticalId ? 'lg:grid-cols-1': ''}
         gap-4 ${notId ? 'lg:grid-cols-4' : ''} `}
      >
        {sensorData?.sensor.sensorData.map((dataType) => {
          const config = sensorData.configurations[dataType];
          //@ts-expect-error
          const messages = sensorData.messages[dataType] || [];
          const latest = messages[messages.length - 1];
          const previous = messages.length >= 2 ? messages[messages.length - 2] : null;

          const latestValue = parseMessageValue(latest);
          const previousValue = parseMessageValue(previous);

          const statusColor = latestValue ? 
            calculateStatusColor(config, latestValue.value) : 
            '#666666';

          // Highlight timestamp if older than 1 day
          let timeStampElem: React.ReactNode = latestValue?.timestamp || 'No data available';
          if (latestValue?.timestamp) {
            const ts = latestValue.timestamp.replace(' @ ', 'T'); // "2025-05-14T15:16:55"
            const date = new Date(ts);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const oneDayMs = 24 * 60 * 60 * 1000;
            if (diffMs > oneDayMs) {
              console.log('Highlighting timestamp:', latestValue.timestamp, diffMs);
              timeStampElem = (
                <span className="text-orange-400/75 font-semibold flex flex-row gap-4 items-center">
                  {latestValue.timestamp} <CloudAlert />
                </span>
              );
            } else {
              timeStampElem = latestValue.timestamp;
              console.log('Timestamp within 1 day:', latestValue.timestamp, diffMs);
            }
          }

          return (
            <BaseLayer
              key={dataType}
              icon={getIcon(dataType)}
              heading={dataType}
              id={sensorId}
              value={latestValue?.value.toFixed(2) || 'N/A'}
              unit={config?.unit || (dataType === 'Temperatur' ? '°C' : 'lux')}
              lastValue={previousValue?.value.toFixed(2)}
              timeStamp={timeStampElem}
              statusColor={statusColor}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SensorDataDisplay;