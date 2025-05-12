import { NextRequest, NextResponse } from 'next/server';
import * as mqtt from 'mqtt';

// MQTT broker configuration
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const MQTT_OPTIONS = {
  clientId: `api_${Math.random().toString(16).slice(2, 8)}`,
  clean: true
};

export async function POST(request: NextRequest) {
  try {
    const { sensorTyp, clientId } = await request.json();
    
    // Validate input
    if (!sensorTyp || !clientId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Format topic according to schema
    const topic = `sensors/${sensorTyp.toUpperCase()}/${clientId.toUpperCase()}/forceUpdate`;
    
    // Connect to MQTT broker
    const client = mqtt.connect(MQTT_BROKER_URL, MQTT_OPTIONS);
    
    // Return a promise to properly handle the async MQTT operations
    return new Promise((resolve) => {
      client.on('connect', () => {
        console.log(`Connected to MQTT broker, publishing to ${topic}`);
        
        // Publish update command
        client.publish(topic, 'UPDATE', { qos: 1 }, (err) => {
          if (err) {
            console.error('Error publishing message:', err);
            client.end();
            resolve(NextResponse.json(
              { error: 'Failed to publish message' },
              { status: 500 }
            ));
            return;
          }
          
          console.log(`Force update sent to ${topic}`);
          client.end();
          resolve(NextResponse.json({ success: true, topic }));
        });
      });
      
      // Handle connection errors
      client.on('error', (err) => {
        console.error('MQTT connection error:', err);
        client.end();
        resolve(NextResponse.json(
          { error: 'Failed to connect to MQTT broker' },
          { status: 500 }
        ));
      });
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}