//! Nicht getestet



// hooks/useMqttSubscriber.ts
import { useEffect, useState } from "react";
import { Client, Message } from "paho-mqtt";

export function useMqttSubscriber(brokerUrl: string, topic: string) {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // MQTT über WebSocket (z. B. ws://192.168.17.250:9001)
    const client = new Client(brokerUrl, "mqtt-client-" + Math.random().toString(16).substr(2, 8));

    client.onConnectionLost = (responseObject) => {
      console.warn("Connection lost:", responseObject.errorMessage);
    };

    client.onMessageArrived = (message: Message) => {
      console.log(`Message received on topic ${message.destinationName}:`, message.payloadString);
      setMessages((prev) => [...prev, message.payloadString || ""]);
    };

    client.connect({
      onSuccess: () => {
        console.log("Connected to MQTT broker");
        client.subscribe(topic);
        console.log(`Subscribed to topic: ${topic}`);
      },
      onFailure: (err) => {
        console.error("Connection failed:", err);
      }
    });

    // Clean up
    return () => {
      if (client.isConnected()) {
        client.disconnect();
      }
    };
  }, [brokerUrl, topic]);

  return messages;
}
