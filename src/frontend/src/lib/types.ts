

export type SensorConfig = {
  dataType: string;
  unit: string;
  name: string;
  description?: string;
  maxAgeHours?: number;
  grenzwerte?: Threshold[];
  latestValue?: number;
  lastValue?: number;
  timestamp?: string;
};

export type SensorData = {
  sensorID: string;
  sensorTyp: string;
  sensorName: string;
  sensorDescription: string;
  location: {
    room: string;
    floor: string;
    description: string;
  };
  sensorData: string[];
  configurations: SensorConfig[];
};


// types.ts
export type SensorDataResponse = {
  sensor: {
    sensorID: string;
    sensorTyp: string;
    sensorName: string;
    sensorDescription: string;
    location: {
      room: string;
      floor: string;
      description: string;
    };
    sensorData: string[];
  };
  configurations: Record<string, SensorConfig>;
  messages: Array<{
    timestamp: string;
    topic: string;
    payload: {
      event: string;
      topic: string;
      clientType: string;
      clientId: string;
      dataType: string;
      dataValue: string;
      "WIFI SSID": string;
    };
  }>;
};

// Additional type for individual sensor values
export type SensorValue = {
  timestamp: string;
  value: number;
  dataType: string;
  unit: string;
};

// Updated Threshold type with MQTT awareness
export type Threshold = {
  value: number;
  condition: 'über' | 'unter' | 'gleich';
  color: string;
  alert: {
    send: boolean;
    critical: boolean;
    message: string;
    mqttTopic?: string; // Optional MQTT topic for alerts
  };
};