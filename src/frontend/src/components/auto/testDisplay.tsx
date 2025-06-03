'use client'
import { useEffect, useState } from 'react';
import BaseLayer from './baseLayer';
import { SensorDataResponse, SensorConfig } from '../../lib/types'
import { Thermometer, Sun, CloudRain, Gauge, Wind, InfoIcon, CloudAlert } from 'lucide-react';
import { Button } from '../ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { late } from 'zod';

const SensorDataDisplay = ({ sensorId, htmlId, verticalId, notId }: { notId:boolean, sensorId: string, htmlId: boolean, verticalId: boolean }) => {
  const [sensorData, setSensorData] = useState<SensorDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [skeletonCount, setSkeletonCount] = useState<number | null>(null);

  useEffect(() => {
    // Only runs on client
    setSkeletonCount(Math.floor(Math.random() * 5) + 1);
  }, []);

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

  // Example: Fetch alerts in a React component
  useEffect(() => {
    fetch('/api/alerts')
      .then(res => res.json())
      .then(data => {
        setAlerts(data);
        console.log('Fetched alerts:', data); // Log the fetched alerts
      });
  }, []);

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

  const triggerAlert = async (sensorId: string, dataType: string, value: number, threshold: any) => {
    const alert = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sensorId,
        dataType,
        value,
        threshold,
        timestamp: new Date().toISOString(),
        critical: threshold.alert?.critical ?? false, // Pass critical flag
        alertType: threshold.alert?.critical ? 'critical' : 'non-critical',
      }),
    });
    console.log('Sent alert:', { sensorId, dataType, value, threshold });
    console.log('Alert POST response:', alert.status, await alert.text());
  };

  const ALERT_FIRST_MATCH_ONLY = process.env.NEXT_PUBLIC_ALERT_FIRST_MATCH_ONLY === 'true';

  const calculateStatusColor = (
    config: SensorConfig | undefined,
    value: number | undefined,
    hasData: boolean
  ) => {
    if (!hasData) return '#666666'; // gray for no data
    if (!config?.grenzwerte) return '#4CAF50';

    if (ALERT_FIRST_MATCH_ONLY) {
      // Find the threshold whose color would be used (most severe: red > yellow > green)
      let selectedThreshold: any = null;
      for (const threshold of config.grenzwerte) {
        const meetsCondition =
          (threshold.condition === 'über' && value! > threshold.value) ||
          (threshold.condition === 'unter' && value! < threshold.value) ||
          (threshold.condition === 'gleich' && value! === threshold.value);

        if (meetsCondition) {
          if (threshold.color === '#CF2430') {
            selectedThreshold = threshold;
            break; // danger, take immediately
          }
          if (threshold.color === '#F5A524' && !selectedThreshold) {
            selectedThreshold = threshold; // caution, but keep looking for danger
          }
          if (!selectedThreshold) {
            selectedThreshold = threshold; // any match if nothing else
          }
        }
      }
      if (selectedThreshold) {
        return selectedThreshold.color;
      }
      return '#4CAF50'; // default
    } else {
      // Check all thresholds, trigger all, and pick most severe color
      let matchedColors: string[] = [];
      config.grenzwerte.forEach(threshold => {
        const meetsCondition =
          (threshold.condition === 'über' && value! > threshold.value) ||
          (threshold.condition === 'unter' && value! < threshold.value) ||
          (threshold.condition === 'gleich' && value! === threshold.value);

        if (meetsCondition) {
          matchedColors.push(threshold.color);
        }
      });

      if (matchedColors.includes('#CF2430')) return '#CF2430'; // danger
      if (matchedColors.includes('#F5A524')) return '#F5A524'; // caution
      if (matchedColors.length > 0) return matchedColors[0];
      return '#4CAF50'; // default
    }
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

  useEffect(() => {
    if (!sensorData?.sensor?.sensorData) return;
    sensorData.sensor.sensorData.forEach((dataType) => {
      const config = sensorData.configurations[dataType];
      //@ts-expect-error
      const messages = sensorData.messages[dataType] || [];
      const latest = messages[messages.length - 1];
      const latestValue = parseMessageValue(latest);
      const hasData = !!latestValue && typeof latestValue.value === 'number' && !isNaN(latestValue.value);

      if (!hasData || !config?.grenzwerte) return;
      config.grenzwerte.forEach(threshold => {
        const meetsCondition =
          (threshold.condition === 'über' && latestValue.value > threshold.value) ||
          (threshold.condition === 'unter' && latestValue.value < threshold.value) ||
          (threshold.condition === 'gleich' && latestValue.value === threshold.value);

        if (meetsCondition) {
          triggerAlert(sensorData.sensor.sensorID, dataType, latestValue.value, threshold);
        }
      });
    });
  }, [sensorData]);

  if (loading) {
    // Wait until skeletonCount is set on the client to avoid hydration mismatch
    if (skeletonCount === null) return null;
    return (
      <div className="p-4">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
          {Array.from({ length: skeletonCount }).map((_, idx) => (
            <Skeleton key={idx} className="h-32 w-full min-w-[320px] md:min-w-[400px]" />
          ))}
        </div>
      </div>
    );
  }

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

          const hasData = !!latestValue && typeof latestValue.value === 'number' && !isNaN(latestValue.value);

          const statusColor = calculateStatusColor(config, latestValue?.value, hasData);

          // Highlight timestamp if older than user-configured maxAgeHours
          let timeStampElem: React.ReactNode = latestValue?.timestamp || 'No data available';
          if (latestValue?.timestamp && latestValue.timestamp !== 'No data available') {
            const ts = latestValue.timestamp.replace(' @ ', 'T'); // "e.g. 2025-05-14T15:16:55"
            const date = new Date(ts);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            // Use user-configured maxAgeHours (default to 24 if not set)
            const maxAgeHours = config?.maxAgeHours ?? 24; //default to 24 hours - //* for backward compatibility
            const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
            if (diffMs > maxAgeMs) {
              timeStampElem = (
                <span className="text-orange-400/75 font-semibold flex flex-row gap-4 items-center">
                  {latestValue.timestamp} <CloudAlert />
                </span>
              );
            } else {
              timeStampElem = latestValue.timestamp;
            }
          } else {
            timeStampElem = (
              <span className="text-red-400/75 font-semibold flex flex-row gap-4 items-center">
                No data available <CloudAlert />
              </span>
            );
          }

          return (
            <BaseLayer
              key={dataType}
              icon={getIcon(dataType)}
              heading={dataType}
              id={sensorId}
              value={hasData ? latestValue.value.toFixed(2) : 'N/A'}
              unit={config?.unit || (dataType === 'Temperatur' ? '°C' : '°F')}
              lastValue={previousValue?.value?.toFixed(2)}
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