"use client"
// components/MqttMessages.tsx
// components/MqttSubscriber.tsx
import React, { useEffect, useState } from 'react';
import mqtt, { MqttClient } from 'mqtt';

const MQTT_BROKER_URL = '127.27.11.101:1883'; // Public broker over WebSockets
const MQTT_TOPIC = 'sensor/data';

const MqttSubscriber: React.FC = () => {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const mqttClient = mqtt.connect("ws://localhost:8000/mqtt");

    mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker');
      mqttClient.subscribe(MQTT_TOPIC, (err) => {
        if (err) console.error('Subscription error:', err);
        else console.log(`Subscribed to topic "${MQTT_TOPIC}"`);
      });
    });

    mqttClient.on('message', (topic, message) => {
      console.log(`Message received: ${message.toString()}`);
      setMessages((prev) => [...prev, message.toString()]);
    });

    mqttClient.on('error', (err) => {
      console.error('Connection error:', err);
      mqttClient.end();
    });

    setClient(mqttClient);

    return () => {
      mqttClient.end();
    };
  }, []);

  return (
    <div className="p-4 border rounded bg-white shadow-md">
      <h2 className="text-xl font-bold mb-2">MQTT Subscriber</h2>
      <p className="text-sm text-gray-600 mb-4">Subscribed to: <strong>{MQTT_TOPIC}</strong></p>
      <ul className="space-y-1">
        {messages.map((msg, index) => (
          <li key={index} className="bg-gray-700 p-2 rounded">{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default MqttSubscriber;
