export type Threshold = {
  value: number;
  condition: 'über' | 'unter' | 'gleich';
  color: string;
  alert: {
    send: boolean;
    critical: boolean;
    message: string;
  };
};

export type SensorConfig = {
  dataType: string;
  unit: string;
  name: string;
  description?: string;
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

export type SensorDataResponse = {
  sensor: {
    sensorID: string
    sensorTyp: string
    sensorName: string
    sensorDescription: string
    location: {
      room: string
      floor: string
      description: string
    }
    sensorData: string[]
  }
  configurations: Record<string, SensorConfig>
  messages: Record<string, Array<{
    value: number
    dataType: string
    unit: string
    sensorId: string
    timestamp: string
  }>>
}