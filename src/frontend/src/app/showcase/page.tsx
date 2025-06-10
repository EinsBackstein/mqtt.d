"use client"

import { useEffect, useState } from "react";
import SensorDataDisplay from "@/components/auto/testDisplay";

export default function Home() {
  const [sensors, setSensors] = useState<{ sensorID: string }[]>([]);

  useEffect(() => {
    fetch("/api/sensors/list")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setSensors(data));
  }, []);

  return (
    <div className="flex flex-col gap-5 pt-5">
      {sensors.map((sensor) => (
        <SensorDataDisplay
          notId={true}
          htmlId={false}
          verticalId={false}
          key={sensor.sensorID}
          sensorId={sensor.sensorID}
        />
      ))}
    </div>
  );
}