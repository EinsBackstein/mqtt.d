import { Divider } from '@heroui/divider';
import { OctagonAlert, TriangleAlert, CircleAlert } from 'lucide-react';
import React, { useEffect, useState } from 'react';

type AlertType = {
  sensorId: string;
  dataType: string;
  value: number;
  threshold: {
    condition: string;
    value: number;
    color: string;
  };
  timestamp: string;
};

const Alert = () => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/alerts');
        if (res.ok) {
          const data = await res.json();
          setAlerts(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
    // Optionally, poll for new alerts every 10 seconds:
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loading) {
      console.log('All alerts:', alerts);
    }
  }, [alerts, loading]);

  const alertCount = alerts.length;
  const newestAlert = alerts[alertCount - 1];

  return (
    <div className="flex flex-col max-w-[750px] max-h-[300px] bg-secondary rounded-4xl ring-1 ring-white/20 shadow-md overflow-hidden shadow-white/30 p-4">
      <h1 className="m-2 flex flex-row items-center text-3xl text-left font-semibold text-white">
        <OctagonAlert
          width={50}
          height={28}
          color={'#CF2430'}
          strokeWidth={2.4}
        />
        Alerts
      </h1>
      <div className="pb-4 px-4 w-full flex flex-row">
        <div className="max-w-60 flex flex-col items-end px-2">
          <div className="text-xl">Aktuelle Alerts</div>
          <div className="flex gap-2 text-4xl">
            {loading ? '...' : alertCount}
            <TriangleAlert
              width={36}
              height={36}
              color={'#F5A524'}
              strokeWidth={2.4}
            />
          </div>
        </div>
        <Divider
          className="h-[75%] w-0.5 m-2 bg-amber-50 rounded-4xl"
          orientation="vertical"
        />
        <div className="px-2">
          <div className="text-xl">Neuester Alert</div>
          {loading ? (
            <div className="text-lg text-gray-400">Lade...</div>
          ) : newestAlert ? (
            <div className="bg-caution/30 max-w-100 py-1 pr-4 pl-2 rounded-2xl flex flex-row gap-2 items-center mb-6">
              <CircleAlert
                width={32}
                height={32}
                color={'#F5A524'}
                strokeWidth={2.4}
              />
              <span className="text-lg">
                <b className="font-bold">
                  Sensor {newestAlert.sensorId}:{' '}
                </b>
                {newestAlert.dataType} {newestAlert.threshold.condition} {newestAlert.threshold.value}! 
                (Gemessen: {newestAlert.value})
                <span className="ml-2 text-xs text-gray-400">
                  {new Date(newestAlert.timestamp).toLocaleString()}
                </span>
              </span>
            </div>
          ) : (
            <div className="text-lg text-gray-400">Keine Alerts vorhanden.</div>
          )}
        </div>
        {/* <div className="px-2">
          <div className="text-xl">Alle Alerts</div>
          {loading ? (
            <div className="text-lg text-gray-400">Lade...</div>
          ) : alerts.length > 0 ? (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {alerts.map((alert, idx) => (
                <div key={idx} className="bg-caution/30 py-1 pr-4 pl-2 rounded-2xl flex flex-row gap-2 items-center">
                  <CircleAlert width={24} height={24} color={alert.threshold.color || '#F5A524'} strokeWidth={2.4} />
                  <span className="text-base">
                    <b>Sensor {alert.sensorId}:</b> {alert.dataType} {alert.threshold.condition} {alert.threshold.value} (Gemessen: {alert.value})
                    <span className="ml-2 text-xs text-gray-400">{new Date(alert.timestamp).toLocaleString()}</span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-lg text-gray-400">Keine Alerts vorhanden.</div>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default Alert;
