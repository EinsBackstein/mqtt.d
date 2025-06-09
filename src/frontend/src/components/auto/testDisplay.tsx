'use client'
import { useEffect, useState } from 'react';
import BaseLayer from './baseLayer';
import { SensorDataResponse, SensorConfig } from '../../lib/types'
import { Thermometer, Sun, CloudRain, Gauge, Wind, InfoIcon, CloudAlert, Settings, RefreshCw, Pencil } from 'lucide-react';
import { Button } from '../ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { late } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Equal } from "lucide-react";
import { configurationSchema, sensorDataOptions } from '@/lib/schema'; // 1. Import schema
import { ZodError } from 'zod';
import { MultiSelect } from '@/components/ui/mutliselect'; // If you have a MultiSelect component

// Helper: Map dataType to allowed units from schema
const unitOptionsByDataType: Record<string, string[]> = {
  'Temperatur': ['°C', '°F', 'K'],
  'Luftfeuchtigkeit': ['g/m³', '%'],
  'Luftdruck': ['hPa', 'kPa', 'bar'],
  'Helligkeit': ['lux', 'cd/m²', 'fL'],
  'Luftqualität': ['PM2.5', 'PM10', 'CO2', 'VOC'],
};

const SensorDataDisplay = ({ sensorId, htmlId, verticalId, notId }: { notId:boolean, sensorId: string, htmlId: boolean, verticalId: boolean }) => {
  const [sensorData, setSensorData] = useState<SensorDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [skeletonCount, setSkeletonCount] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [basicSettingsOpen, setBasicSettingsOpen] = useState(false);

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

  const ALERT_BEST_MATCH_ONLY = process.env.NEXT_PUBLIC_BEST_FIRST_MATCH_ONLY === 'true';

console.log('ALERT_BEST_MATCH_ONLY:', ALERT_BEST_MATCH_ONLY);

  const calculateStatusColor = (
    config: SensorConfig | undefined,
    value: number | undefined,
    hasData: boolean
  ) => {
    if (!hasData) return '#666666'; // gray for no data
    if (!config?.grenzwerte) return '#4CAF50';

    if (ALERT_BEST_MATCH_ONLY) {
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

      if (ALERT_BEST_MATCH_ONLY) {
        // Only trigger alert for the threshold that determines the status color
        let selectedThreshold: any = null;
        for (const threshold of config.grenzwerte) {
          const meetsCondition =
            (threshold.condition === 'über' && latestValue.value > threshold.value) ||
            (threshold.condition === 'unter' && latestValue.value < threshold.value) ||
            (threshold.condition === 'gleich' && latestValue.value === threshold.value);

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
          triggerAlert(sensorData.sensor.sensorID, dataType, latestValue.value, selectedThreshold);
          // Optionally, setAlerts([{ ... }]) if you want to display only this alert
        }
      } else {
        // Trigger and collect all matching alerts
        config.grenzwerte.forEach(threshold => {
          const meetsCondition =
            (threshold.condition === 'über' && latestValue.value > threshold.value) ||
            (threshold.condition === 'unter' && latestValue.value < threshold.value) ||
            (threshold.condition === 'gleich' && latestValue.value === threshold.value);

          if (meetsCondition) {
            triggerAlert(sensorData.sensor.sensorID, dataType, latestValue.value, threshold);
            // Optionally, collect all alerts in an array if you want to display them
          }
        });
      }
    });
  }, [sensorData]);

  // Handler to open settings modal
  const handleOpenSettings = (dataType: string) => {
    const config = sensorData?.configurations[dataType];
    setEditingConfig({ ...config, dataType });
    setSettingsOpen(true);
  };

  // Handler to save settings
  const handleSaveSettings = async (updatedConfig: any) => {
    setValidationError(null);
    try {
      // 2. Validate config using Zod
      configurationSchema.parse(updatedConfig);
      // If valid, send PATCH
      await fetch(`/api/sensors/${sensorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataType: updatedConfig.dataType, config: updatedConfig }),
      });
      setSettingsOpen(false);
      fetchData(); // Refresh data
    } catch (err) {
      // 3. Show validation errors
      if (err instanceof ZodError) {
        setValidationError(err.errors.map(e => e.message).join(', '));
      } else {
        setValidationError('Unbekannter Fehler beim Validieren');
      }
    }
  };

  // PATCH for basic sensor settings
  const handleSaveBasicSettings = async () => {
    if (!sensorData) return;
    await fetch(`/api/sensors/${sensorId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sensor: {
          sensorName: sensorData.sensor.sensorName,
          sensorDescription: sensorData.sensor.sensorDescription,
          sensorData: sensorData.sensor.sensorData,
        },
      }),
    });
    setBasicSettingsOpen(false);
    fetchData();
  };

  if (loading) {
    // Wait until skeletonCount is set on the client to avoid hydration mismatch
    if (skeletonCount === null) return null;
    return (
      <div className="p-4 w-full">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <div className="overflow-x-hidden">
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 min-w-[340px]`}>
            {Array.from({ length: skeletonCount }).map((_, idx) => (
              <Skeleton key={idx} className="h-32 w-full min-w-[320px] md:min-w-[400px]" />
            ))}
          </div>
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

  const getDefaultConfig = (dataType: string) => ({
    dataType,
    name: dataType,
    description: "",
    unit: (unitOptionsByDataType[dataType] && unitOptionsByDataType[dataType][0]) || "",
    maxAgeHours: 24,
    grenzwerte: [],
  });

  return (
    <div className="p-4">
      {/* Header with name, ID, and edit button inline */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">
            {sensorData?.sensor.sensorName + ` | Sensor #${sensorId}`}
          </h2>
          <Button
            variant="outline"
            size="icon"
            className="ml-1"
            onClick={() => setBasicSettingsOpen(true)}
            title="Sensor-Basisdaten bearbeiten"
          >
            <Pencil className="w-5 h-5" />
          </Button>
        </div>
        {/* You can add other controls here if needed */}
      </div>

      {/* Basic Settings Modal */}
      <Dialog open={basicSettingsOpen} onOpenChange={setBasicSettingsOpen}>
        <DialogContent
          className="w-full max-w-md"
          style={{ minWidth: '0', width: '100%' }}
        >
          <DialogHeader>
            <DialogTitle>Sensor-Basisdaten bearbeiten</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async e => {
              e.preventDefault();
              await handleSaveBasicSettings();
            }}
            className="space-y-4"
          >
            {/* Sensor Name */}
            <label className="block">
              <span className="flex items-center gap-1">
                Sensor-Name
                <div className="text-muted-foreground">*</div>
              </span>
              <Input
                value={sensorData.sensor.sensorName}
                onChange={e =>
                  setSensorData({
                    ...sensorData,
                    sensor: { ...sensorData.sensor, sensorName: e.target.value }
                  })
                }
              />
            </label>
            {/* Sensor Description */}
            <label className="block">
              <span>Sensor-Beschreibung</span>
              <Input
                value={sensorData.sensor.sensorDescription || ""}
                onChange={e =>
                  setSensorData({
                    ...sensorData,
                    sensor: { ...sensorData.sensor, sensorDescription: e.target.value }
                  })
                }
              />
            </label>
            {/* SensorData Types */}
            <label className="block">
              <span className="flex items-center gap-1">
                Sensor-Daten Typen
                <div className="text-muted-foreground">*</div>
              </span>
              <MultiSelect
                options={sensorDataOptions.map(String)}
                selected={sensorData.sensor.sensorData.map(String)}
                onChange={selected => {
                  setSensorData({
                    ...sensorData,
                    sensor: {
                      ...sensorData.sensor,
                      sensorData: Array.from(new Set([...sensorData.sensor.sensorData, ...selected.map(String)]))
                    }
                  });
                }}
                placeholder="Welche Daten stellt der Sensor zur Verfügung?"
              />
            </label>
            <DialogFooter>
              <button type="submit" className="btn btn-primary">Speichern</button>
              <button type="button" className="btn" onClick={() => setBasicSettingsOpen(false)}>Abbrechen</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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

          // --- ADD THIS: Card-level force update button ---
          const handleCardForceUpdate = async () => {
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

              setTimeout(async () => {
                await fetchData();
                setUpdating(false);
              }, 500);
            } catch (error) {
              setUpdating(false);
            }
          };
          // --- END ADD ---

          return (
            <div key={dataType} className="relative">
              <BaseLayer
                icon={getIcon(dataType)}
                heading={dataType}
                id={sensorId}
                value={hasData ? latestValue.value.toFixed(2) : 'N/A'}
                unit={config?.unit || (dataType === 'Temperatur' ? '°C' : '°F')}
                lastValue={previousValue?.value?.toFixed(2)}
                timeStamp={timeStampElem}
                statusColor={statusColor}
              />
              <div className="absolute top-2 right-2 flex flex-col gap-2">
                <button
                  className="bg-white/80 rounded-full p-1 hover:bg-white"
                  onClick={handleCardForceUpdate}
                  title="Force-Update"
                  disabled={updating}
                  type="button"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-700 ${updating ? 'animate-spin' : ''}`} />
                </button>
                <button
                  className="bg-white/80 rounded-full p-1 hover:bg-white"
                  onClick={() => handleOpenSettings(dataType)}
                  title="Einstellungen"
                  type="button"
                >
                  <Settings className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {/* Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent
          className="w-full max-w-[80vw] md:max-w-[800px] overflow-auto"
          style={{ minWidth: '0', width: '100%' }}
        >
          <DialogHeader>
            <DialogTitle>Sensor-Einstellungen bearbeiten</DialogTitle>
          </DialogHeader>
          {editingConfig && (
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSaveSettings(editingConfig);
              }}
              className="space-y-4"
            >
              {validationError && (
                <div className="text-red-500 p-2 border rounded">{validationError}</div>
              )}
              {/* Einheit */}
              <label className="block">
                <span className="flex items-center gap-1">
                  Einheit
                  <div className="text-muted-foreground">*</div>
                </span>
                <Select
                  value={editingConfig.unit}
                  onValueChange={val => setEditingConfig({ ...editingConfig, unit: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Einheit wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {(unitOptionsByDataType[editingConfig.dataType] || []).map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              {/* Anzeigename */}
              <label className="block">
                <span className="flex items-center gap-1">
                  Anzeigename
                  <div className="text-muted-foreground">*</div>
                </span>
                <Input
                  value={editingConfig.name}
                  onChange={e => setEditingConfig({ ...editingConfig, name: e.target.value })}
                />
              </label>
              {/* Beschreibung */}
              <label className="block">
                Beschreibung
                <Input
                  value={editingConfig.description || ""}
                  onChange={e => setEditingConfig({ ...editingConfig, description: e.target.value })}
                />
              </label>
              {/* MaxAgeHours */}
              <label className="block">
                <span className="flex items-center gap-1">
                  Sensor-Timeout Warnung (Stunden)
                  <div className="text-muted-foreground">*</div>
                </span>
                <Input
                  type="number"
                  value={editingConfig.maxAgeHours ?? 24}
                  onChange={e => setEditingConfig({ ...editingConfig, maxAgeHours: Number(e.target.value) })}
                />
              </label>
              {/* Grenzwerte (Thresholds) */}
              <div className="space-y-2">
                <div className="font-semibold">Grenzwerte</div>
                {editingConfig.grenzwerte?.map((threshold: any, idx: number) => (
                  <div key={idx} className="border p-2 rounded space-y-1">
                    <div className="flex gap-2 items-center flex-wrap">
                      <span>Bedingung:</span>
                      <Select
                        value={threshold.condition}
                        onValueChange={val => {
                          const newGrenzwerte = [...editingConfig.grenzwerte];
                          newGrenzwerte[idx].condition = val;
                          setEditingConfig({ ...editingConfig, grenzwerte: newGrenzwerte });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Bedingung wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="über">Über <ChevronRight className="inline h-4 w-4" /></SelectItem>
                          <SelectItem value="gleich">Gleich <Equal className="inline h-4 w-4" /></SelectItem>
                          <SelectItem value="unter">Unter <ChevronLeft className="inline h-4 w-4" /></SelectItem>
                        </SelectContent>
                      </Select>
                      <span>Wert:</span>
                      <Input
                        type="number"
                        value={threshold.value}
                        onChange={e => {
                          const newGrenzwerte = [...editingConfig.grenzwerte];
                          newGrenzwerte[idx].value = Number(e.target.value);
                          setEditingConfig({ ...editingConfig, grenzwerte: newGrenzwerte });
                        }}
                        className="w-20"
                      />
                      <span>Farbe:</span>
                      <Input
                        type="color"
                        value={threshold.color}
                        onChange={e => {
                          const newGrenzwerte = [...editingConfig.grenzwerte];
                          newGrenzwerte[idx].color = e.target.value;
                          setEditingConfig({ ...editingConfig, grenzwerte: newGrenzwerte });
                        }}
                        className="w-10 h-8"
                      />
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 items-start md:items-center mt-2">
                      <div className="flex gap-4 items-center">
                        <Checkbox
                          checked={threshold.alert?.send}
                          onCheckedChange={val => {
                            const newGrenzwerte = [...editingConfig.grenzwerte];
                            newGrenzwerte[idx].alert = { ...newGrenzwerte[idx].alert, send: val };
                            setEditingConfig({ ...editingConfig, grenzwerte: newGrenzwerte });
                          }}
                        /> Alert senden
                        <Checkbox
                          checked={threshold.alert?.critical}
                          onCheckedChange={val => {
                            const newGrenzwerte = [...editingConfig.grenzwerte];
                            newGrenzwerte[idx].alert = { ...newGrenzwerte[idx].alert, critical: val };
                            setEditingConfig({ ...editingConfig, grenzwerte: newGrenzwerte });
                          }}
                        /> Kritischer Alarm
                      </div>
                      <Input
                        placeholder="Alarmnachricht"
                        value={threshold.alert?.message || ""}
                        onChange={e => {
                          const newGrenzwerte = [...editingConfig.grenzwerte];
                          newGrenzwerte[idx].alert = { ...newGrenzwerte[idx].alert, message: e.target.value };
                          setEditingConfig({ ...editingConfig, grenzwerte: newGrenzwerte });
                        }}
                        className="flex-1 min-w-[200px] md:min-w-[300px]"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const newGrenzwerte = editingConfig.grenzwerte.filter((_: any, i: number) => i !== idx);
                          setEditingConfig({ ...editingConfig, grenzwerte: newGrenzwerte });
                        }}
                      >
                        Entfernen
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingConfig({
                      ...editingConfig,
                      grenzwerte: [
                        ...(editingConfig.grenzwerte || []),
                        {
                          value: 0,
                          condition: "über",
                          color: "#CF2430",
                          alert: { send: true, critical: false, message: "" }
                        }
                      ]
                    });
                  }}
                >
                  + Grenzwert hinzufügen
                </Button>
              </div>
              <DialogFooter>
                <button type="submit" className="btn btn-primary">Speichern</button>
                <button type="button" className="btn" onClick={() => setSettingsOpen(false)}>Abbrechen</button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SensorDataDisplay;