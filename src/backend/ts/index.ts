import * as mqtt from 'mqtt';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as util from 'util';

// MQTT broker configuration
const MQTT_BROKER_URL = 'mqtt://broker:1883'; // Change to your MQTT broker URL
const MQTT_OPTIONS = {
  clientId: `backend_${Math.random().toString(16).slice(2, 8)}`,
  clean: true
};

// Path to sensor data directory
const SENSOR_DATA_DIR = path.resolve(__dirname, '../../data');

// Message retention configuration
const MAX_MESSAGES_PER_FILE = 100;
const MAX_MESSAGE_AGE_DAYS = 30; // Messages older than this many days will be removed

// Helper function to format timestamps
function formatTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} @ ${hours}:${minutes}:${seconds}`;
}

// Helper function to parse formatted timestamp back to Date
function parseTimestamp(timestamp: string): Date | null {
  try {
    const [datePart, timePart] = timestamp.split(' @ ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    
    return new Date(year, month - 1, day, hours, minutes, seconds);
  } catch (error) {
    console.error(`Failed to parse timestamp: ${timestamp}`, error);
    return null;
  }
}

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


interface SensorConfiguration extends SensorData{
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
  topics: string[];
}

// Connect to MQTT broker
const client = mqtt.connect(MQTT_BROKER_URL, MQTT_OPTIONS);

// Keep track of subscribed sensors to avoid duplicates
const subscribedSensors = new Set<string>();

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  subscribeToAllSensors();
  watchForNewSensors();
});

client.on('error', (error) => {
  console.error('MQTT connection error:', error);
});

// Enhanced message handler for debugging
client.on('message', (topic, message) => {
  const timestamp = formatTimestamp(new Date());
  const separator = '-'.repeat(80);
  
  console.log(separator);
  console.log(`[${timestamp}] MQTT Message Received:`);
  console.log(`Topic: ${topic}`);
  
  try {
    // Try to parse as JSON
    const payload = JSON.parse(message.toString());
    console.log('Payload (JSON):');
    console.log(util.inspect(payload, { colors: true, depth: null, compact: false }));
    
    // Print specific fields that might be of interest
    if (payload.value !== undefined) {
      console.log(`Value: ${payload.value}`);
    }
    if (payload.timestamp) {
      console.log(`Message Timestamp: ${payload.timestamp}`);
    }
  } catch (error) {
    // Not JSON, display as string
    console.log('Payload (Raw):');
    console.log(message.toString());
    
    // Try to show as hex if it's binary data
    if (message.toString().includes('�')) {
      console.log('Payload (Hex):');
      console.log(message.toString('hex'));
    }
  }
  
  // Show message metadata
  console.log(`Size: ${message.length} bytes`);
  console.log(separator);
});

client.on('message', (topic, payload) => {
    console.log(`\n[INCOMING] ${topic}: ${payload.toString()}`);
    
    try {
        // Parse the topic to find sensor ID and measurement type
        const topicParts = topic.split('/');
        let sensorId = '';
        let measurementType = '';
        
        if (topicParts[0] === 'sensors') {
            // Format: sensors/SENSORTYP/SENSORID/MEASUREMENT
            sensorId = topicParts[2].toLowerCase();
            measurementType = topicParts[3];
        } else if (topicParts[0] === 'rooms') {
            // For room topics, we need to find which sensor this belongs to
            // This requires looking up the sensor configurations
            const floor = topicParts[1];
            const room = topicParts[2];
            measurementType = topicParts[3];
            
            // We'll handle this after initial implementation
            console.log(`Room topic received (${floor}/${room}/${measurementType}), processing as general message`);
        }
        
        if (sensorId) {
            // Special case for "Licht" which may be stored as "Helligkeit" in files
            const fileType = measurementType === 'Licht' ? 'Helligkeit' : measurementType;
            
            // Create the message file path
            const messageFilePath = path.join(
                SENSOR_DATA_DIR, 
                sensorId, 
                'messages', 
                `${fileType}-messages.json`
            );
            
            // Ensure the messages directory exists
            const messagesDir = path.dirname(messageFilePath);
            if (!fs.existsSync(messagesDir)) {
                fs.mkdirSync(messagesDir, { recursive: true });
            }
            
            // Format the message with timestamp
            const message = {
                timestamp: formatTimestamp(new Date()),
                topic,
                payload: tryParseJson(payload.toString())
            };
            
            // Read existing messages or create new array
            type Message = { timestamp: string; topic: string; payload: any };
            let messages: Message[] = [];
            if (fs.existsSync(messageFilePath)) {
                try {
                    const fileContent = fs.readFileSync(messageFilePath, 'utf8');
                    messages = JSON.parse(fileContent);
                    
                    // Make sure it's an array
                    if (!Array.isArray(messages)) {
                        messages = [messages];
                    }
                    
                    // Filter out messages that are too old
                    const now = new Date();
                    const cutoffDate = new Date(now.setDate(now.getDate() - MAX_MESSAGE_AGE_DAYS));
                    
                    messages = messages.filter(msg => {
                        const msgDate = parseTimestamp(msg.timestamp);
                        return msgDate && msgDate >= cutoffDate;
                    });
                    
                } catch (err) {
                    console.error(`Error reading message file ${messageFilePath}:`, err);
                    // If file exists but can't be parsed, backup the file
                    const backupPath = `${messageFilePath}.backup-${Date.now()}`;
                    fs.copyFileSync(messageFilePath, backupPath);
                    console.log(`Created backup of corrupted file: ${backupPath}`);
                    messages = [];
                }
            }
            
            // Add new message
            messages.push(message);
            
            // Keep only the latest MAX_MESSAGES_PER_FILE messages
            if (messages.length > MAX_MESSAGES_PER_FILE) {
                messages = messages.slice(-MAX_MESSAGES_PER_FILE);
            }
            
            // Write updated messages to file
            fs.writeFileSync(messageFilePath, JSON.stringify(messages, null, 2));
            console.log(`Saved message to ${messageFilePath}`);
        } else {
            console.log(`Could not determine sensor ID from topic: ${topic}`);
        }
    } catch (error) {
        console.error('Error processing message:', error);
    }
});

// Helper function to try parsing JSON, returns original string if not JSON
function tryParseJson(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return str;
    }
}

// Function to watch for new sensor directories
function watchForNewSensors() {
  console.log(`Watching for new sensors in ${SENSOR_DATA_DIR}`);
  
  fs.watch(SENSOR_DATA_DIR, async (eventType, filename) => {
    try {
      // Only process directory creation events
      if (eventType !== 'rename' || !filename) return;
      
      const fullPath = path.join(SENSOR_DATA_DIR, filename);
      
      // Wait a moment to ensure the directory is fully created
      // This helps with race conditions when directories are being populated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if it's a directory and we haven't already subscribed to it
      if (fs.existsSync(fullPath) && 
          fs.statSync(fullPath).isDirectory() && 
          !subscribedSensors.has(filename)) {
        
        console.log(`New sensor directory detected: ${filename}`);
        
        // Load config and subscribe
        const sensorConfig = await loadSensorConfig(fullPath, filename);
        subscribeToSensor(sensorConfig);
      }
    } catch (error) {
      console.error('Error processing new sensor directory:', error);
    }
  });
}

// Function to read all sensor directories and subscribe to their topics
async function subscribeToAllSensors() {
  try {
    // Get all sensor directories
    const sensorDirs = fs.readdirSync(SENSOR_DATA_DIR)
      .filter(item => fs.statSync(path.join(SENSOR_DATA_DIR, item)).isDirectory());
    
    console.log(`Found ${sensorDirs.length} sensor directories`);
    console.log(sensorDirs);
    
    for (const sensorId of sensorDirs) {
      // Skip if already subscribed
      if (subscribedSensors.has(sensorId)) continue;
      
      const sensorDir = path.join(SENSOR_DATA_DIR, sensorId);
      const sensorConfig = await loadSensorConfig(sensorDir, sensorId);
      console.log(sensorConfig);
      subscribeToSensor(sensorConfig);
      
      // Add to the set of subscribed sensors
      subscribedSensors.add(sensorId);
    }
  } catch (error) {
    console.error('Error subscribing to sensors:', error);
  }
}

// Function to load a sensor's configuration
async function loadSensorConfig(sensorDir: string, sensorId: string): Promise<SensorConfiguration> {
  // Try to load JSON configuration
  const jsonPath = path.join(sensorDir, `${sensorId}.json`);
  if (fs.existsSync(jsonPath)) {
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    try {
      const data = JSON.parse(jsonData);
      const sensorTopics: string[] = [];
      for (const key in data.sensorData) {
        if (data.sensorData[key] === "Helligkeit"){
          data.sensorData[key] = "Licht";
        }
        
        const topic = `sensors/${data.sensorTyp.toUpperCase()}/${data.sensorID.toUpperCase()}/${data.sensorData[key]}`;

        sensorTopics.push(topic);
      }
      const roomTopics:string[] = []
      for (const key in data.sensorData) {
        const topic = `rooms/${data.location.floor.toUpperCase()}/${data.location.room.toUpperCase()}/${data.sensorData[key]}`;
        roomTopics.push(topic);
      }
      return {topics: [...sensorTopics, ...roomTopics], ...data} as SensorConfiguration;
    } catch (e) {
      console.error(`Error parsing JSON for sensor ${sensorId}:`, e);
    }
  }
  
  // Try to load YAML configuration
  const yamlPath = path.join(sensorDir, `${sensorId}.yaml`);
  if (fs.existsSync(yamlPath)) {
    const yamlData = fs.readFileSync(yamlPath, 'utf8');
    try {
      return yaml.load(yamlData) as SensorConfiguration;
    } catch (e) {
      console.error(`Error parsing YAML for sensor ${sensorId}:`, e);
    }
  }
  
  // Load additional configurations from configurations directory
  const configDir = path.join(sensorDir, 'configurations');
  const topics: string[] = [];
  
  if (fs.existsSync(configDir)) {
    const configFiles = fs.readdirSync(configDir)
      .filter(file => file.endsWith('-config.json'));
    
    for (const configFile of configFiles) {
      try {
        const configData = fs.readFileSync(path.join(configDir, configFile), 'utf8');
        const config = JSON.parse(configData);
        if (config.topic) topics.push(config.topic);
      } catch (e) {
        console.error(`Error parsing configuration ${configFile}:`, e);
      }
    }
  }
  
  // Return basic config with discovered topics
  return {
    sensorID: sensorId,
    topics: topics.length > 0 ? topics : [`sensors/${sensorId}/#`] // Default topic pattern if none found
  } as SensorConfiguration;
}

// Function to subscribe to a sensor's topics
function subscribeToSensor(config: SensorConfiguration) {
  const topics = config.topics || [`sensors/${config.sensorTyp?.toUpperCase() || config.sensorID}/${config.sensorID.toUpperCase()}/#`];
  
  for (const topic of topics) {
    client.subscribe(topic, (err) => {
      if (err) {
        console.error(`Error subscribing to ${topic}:`, err);
      } else {
        console.log(`Subscribed to ${topic} for sensor ${config.sensorID}`);
        // Mark this sensor as subscribed
        subscribedSensors.add(config.sensorID);
      }
    });
  }
}

// Handle application shutdown
process.on('SIGINT', () => {
  console.log('Disconnecting from MQTT broker...');
  client.end();
  process.exit();
});