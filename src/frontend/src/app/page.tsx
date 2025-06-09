'use client';

import SensorDataDisplay from '@/components/auto/testDisplay';
import Alert from '@/components/static/alert';
import LineChartComponent from '@/components/static/trend';
import React, { useEffect, useState } from 'react';

type HomepageSettings = {
  userName: string;
  sensorIds: string[];
  trend?: { sensorId: string; dataType: string; valueCount?: number | 'all' };
};

const DEFAULT_SENSOR_IDS = ['6840', 'ef84'];
const DEFAULT_TREND = { sensorId: '6840', dataType: 'Temperatur', valueCount: 5 };

const Page = () => {
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch homepage settings (id: 1)
  useEffect(() => {
    fetch('/api/user-page/1')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        // Structured logging for config values
        console.group("Homepage config values");
        console.log("userSettings (raw):", data);
        if (data) {
          console.log("userName:", data.userName);
          console.log("sensorIds:", data.sensorIds);
          if (data.trend) {
            console.group("trend");
            console.log("sensorId:", data.trend.sensorId);
            console.log("dataType:", data.trend.dataType);
            console.log("valueCount:", data.trend.valueCount);
            console.groupEnd();
          } else {
            console.log("trend: undefined");
          }
        }
        console.groupEnd();

        if (data && (data.sensorIds?.length || data.trend)) {
          setSettings({
            userName: data.userName || '',
            sensorIds: Array.isArray(data.sensorIds) && data.sensorIds.length > 0 ? data.sensorIds : DEFAULT_SENSOR_IDS,
            trend: data.trend || DEFAULT_TREND,
          });
        } else {
          setSettings({
            userName: '',
            sensorIds: DEFAULT_SENSOR_IDS,
            trend: DEFAULT_TREND,
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setSettings({
          userName: '',
          sensorIds: DEFAULT_SENSOR_IDS,
          trend: DEFAULT_TREND,
        });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-white">Lade Dashboard...</div>;
  }

  // Fallback if no sensors
  const sensorIds = settings?.sensorIds?.length ? settings.sensorIds : DEFAULT_SENSOR_IDS;
  const trend = settings?.trend || DEFAULT_TREND;

  return (
    <main className="bg-bg-neutral">
      <div>
        <div className="flex flex-col gap-8 md:gap-6 p-8 md:p-6 bg-neutral">
          <div className="flex flex-col gap-4 md:gap-6">
            <h1 className="text-4xl font-bold text-white">Dashboard</h1>
            <p className="text-xl text-white/50">
              Willkommen zurück, {settings?.userName ? settings.userName : 'Julian'}!
            </p>
          </div>
        </div>
      </div>
      <div className="h-max p-4 md:p-6 bg-neutral">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-6 lg:gap-4 max-w-screen-2xl mx-auto h-full">
          {/* Left Column - Static Alert + Sensor */}
          <div className="lg:col-span-4 flex flex-col gap-4 md:gap-6 h-full">
            <Alert />
            <div className="flex flex-col gap-4 h-full">
              {sensorIds[0] && (
                <SensorDataDisplay
                  htmlId={false}
                  notId={false}
                  verticalId={true}
                  key={sensorIds[0]}
                  sensorId={sensorIds[0]}
                />
              )}
            </div>
          </div>

          {/* Right Column - Chart + Sensor Panel*/}
          <div className="lg:col-span-8 gap-y-8 flex flex-col md:gap-6 relative">
            {/* Chart Container */}
            <div className="rounded-4xl ">
              <div>
                {/* Trend chart, dynamic by user config */}
                <LineChartComponent
                  sensorId={trend.sensorId}
                  dataType={trend.dataType}
                  valueCount={trend.valueCount}
                />
              </div>
              <div className="grid grid-cols-1 items-center gap-4 mt-6 place-items-stretch">
                {sensorIds[1] && (
                  <SensorDataDisplay
                    verticalId={false}
                    htmlId={true}
                    notId={false}
                    sensorId={sensorIds[1]}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
