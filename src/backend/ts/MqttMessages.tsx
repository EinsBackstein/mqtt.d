//! Nicht getestet


// components/MqttMessages.tsx
"use client";

import React from "react";
import { useMqttSubscriber } from "@/hooks/useMqttSubscriber";

export default function MqttMessages() {
  const broker = "ws://192.168.17.250:9001"; // WebSocket-Port von Mosquitto!
  const topic = "sensor/data";
  const messages = useMqttSubscriber(broker, topic);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">MQTT Nachrichten (Topic: {topic})</h2>
      <ul className="mt-4 space-y-2">
        {messages.map((msg, index) => (
          <li key={index} className="p-2 bg-gray-100 rounded shadow-sm">
            {msg}
          </li>
        ))}
      </ul>
    </div>
  );
}
