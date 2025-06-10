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
  critical?: boolean; // Optional, indicates if the alert is critical
};

const getOutlineColor = (alerts: AlertType[]) => {
  if (!alerts.length) return "ring-white/20";
  // Priority: critical (red) > warning (yellow) > info (green)
  const hasCritical = alerts.some(a => a.critical || a.threshold.color === "#CF2430");
  const hasWarning = alerts.some(a => a.threshold.color === "#F5A524");
  if (hasCritical) return "ring-[#CF2430]";
  if (hasWarning) return "ring-[#F5A524]";
  return "ring-[#4CAF50]";
};

// Helper to get color for a single alert (latest)
const getAlertColor = (alert?: AlertType) => {
  if (!alert) return "#4CAF50";
  if (alert.critical || alert.threshold.color === "#CF2430") return "#CF2430";
  if (alert.threshold.color === "#F5A524") return "#F5A524";
  return "#4CAF50";
};

const getAlertBgClass = (alert?: AlertType) => {
  if (!alert) return "bg-green-100 dark:bg-green-900/40 border-green-400";
  if (alert.critical || alert.threshold.color === "#CF2430")
    return "bg-red-200 dark:bg-red-900/40 border-red-600";
  if (alert.threshold.color === "#F5A524")
    return "bg-yellow-100 dark:bg-yellow-900/40 border-yellow-400";
  return "bg-green-100 dark:bg-green-900/40 border-green-400";
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

  // useEffect(() => {
  //   if (!loading) {
  //     console.log('All alerts:', alerts);
  //   }
  // }, [alerts, loading]);

  const alertCount = alerts.length;
  const criticalCount = alerts.filter(a => a.critical).length;
  const nonCriticalCount = alerts.filter(a => !a.critical).length;
  const newestAlert = alerts[alertCount - 1];

  const outlineColor = getOutlineColor(alerts);
  const latestAlertColor = getAlertColor(newestAlert);

  return (
    <div className={`flex flex-col max-w-[750px] max-h-[450px] bg-secondary rounded-4xl shadow-md overflow-hidden shadow-white/30 p-2 py-4 ring-1 ${outlineColor}`}>
      <h1 className="m-1 flex flex-row items-center text-2xl text-left font-bold text-white tracking-wide">
        <OctagonAlert
          width={36}
          height={22}
          color={'#CF2430'}
          strokeWidth={2.2}
        />
        <span className="ml-2">Alerts</span>
      </h1>
      <div className="pb-2 px-2 w-full flex flex-row">
        <div className="max-w-32 flex flex-col items-end px-1">
          <div className="text-sm font-semibold text-right">Aktuelle Alerts</div>
          <div className="flex flex-row items-end gap-1 text-base">
            <div className="flex flex-row items-center gap-1">
              <span className="font-bold text-lg text-right text-red-600">{loading ? '...' : criticalCount}</span>
              <span className="text-xs text-red-600/80"><TriangleAlert
                width={18}
                height={18}
                color={"#CF2430"}
                strokeWidth={2}
              /></span>
            </div>
            <div className="flex flex-row items-center gap-1">
              <span className="font-bold text-lg text-right text-yellow-600">{loading ? '...' : nonCriticalCount}</span>
              <span className="text-xs text-yellow-600"><TriangleAlert 
              height={18}
              width={18}
              color={"#F5A524"}
              strokeWidth={2}
              /></span>
            </div>
            <div className="flex flex-row items-center gap-1 mt-1">
              
            </div>
          </div>
        </div>
        <Divider
          className="h-[80%] w-0.5 m-1 bg-amber-50 rounded-4xl"
          orientation="vertical"
        />
        <div className="px-1 flex-1">
          <div className="text-lg font-semibold">Neuester Alert</div>
          {loading ? (
            <div className="text-xs text-gray-400">Lade...</div>
          ) : newestAlert ? (
            <div
              className={`max-w-100 py-1 pr-2 pl-1 rounded-2xl flex flex-row gap-2 items-center mb-3 border-l-4 ${getAlertBgClass(newestAlert)}`}
            >
              <CircleAlert
                width={18}
                height={18}
                color={getAlertColor(newestAlert)}
                strokeWidth={2}
              />
              <span className="text-xs">
                <b className="font-bold">
                  Sensor {newestAlert.sensorId}:{' '}
                </b>
                {newestAlert.dataType} {newestAlert.threshold.condition} {newestAlert.threshold.value}!
                <span
                  className="font-semibold"
                  style={{ color: getAlertColor(newestAlert) }}
                >
                  {' '} (Gemessen: {newestAlert.value})
                </span>
                {newestAlert.critical && (
                  <span className="ml-2 px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold">CRITICAL</span>
                )}
                <span className="ml-2 text-[10px] text-gray-400">
                  {new Date(newestAlert.timestamp).toLocaleString()}
                </span>
              </span>
            </div>
          ) : (
            <div className="text-xs text-gray-400">Keine Alerts vorhanden.</div>
          )}
        </div>
        {/* <div className="px-1">
          <div className="text-base">Alle Alerts</div>
          {loading ? (
            <div className="text-sm text-gray-400">Lade...</div>
          ) : alerts.length > 0 ? (
            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
              {alerts.map((alert, idx) => (
                <div key={idx} className="bg-caution/30 py-1 pr-2 pl-1 rounded-2xl flex flex-row gap-2 items-center">
                  <CircleAlert width={16} height={16} color={alert.threshold.color || '#F5A524'} strokeWidth={2} />
                  <span className="text-xs">
                    <b>Sensor {alert.sensorId}:</b> {alert.dataType} {alert.threshold.condition} {alert.threshold.value} (Gemessen: {alert.value})
                    <span className="ml-2 text-[10px] text-gray-400">{new Date(alert.timestamp).toLocaleString()}</span>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-400">Keine Alerts vorhanden.</div>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default Alert;
