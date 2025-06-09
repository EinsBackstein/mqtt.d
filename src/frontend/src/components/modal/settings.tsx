'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SensorMultiSelect } from "@/components/ui/sensorMultiSelect";
import { usePathname, useRouter } from 'next/navigation';

// Helper to fetch sensor datatypes
async function fetchSensorDataTypes(sensorId: string): Promise<string[]> {
  if (!sensorId) return [];
  try {
    const res = await fetch(`/api/sensors/${sensorId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.sensor?.sensorData) ? data.sensor.sensorData : [];
  } catch {
    return [];
  }
}

export default function SettingsModal({
  isOpen,
  onOpenChange,
  availableSensors,
  userSettings,
  setUserSettings,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  availableSensors: Array<{ sensorID: string; sensorName: string }>;
  userSettings: { userName: string; sensorIds: string[]; trend?: { sensorId: string; dataType: string; valueCount?: number | "all" } };
  setUserSettings: (settings: { userName: string; sensorIds: string[]; trend?: { sensorId: string; dataType: string; valueCount?: number | "all" } }) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Structured logging for config values
  console.group("SettingsModal config values");
  console.log("userSettings (raw):", userSettings);
  console.log("userName:", userSettings.userName);
  console.log("sensorIds:", userSettings.sensorIds);
  if (userSettings.trend) {
    console.group("trend");
    console.log("sensorId:", userSettings.trend.sensorId);
    console.log("dataType:", userSettings.trend.dataType);
    console.log("valueCount:", userSettings.trend.valueCount);
    console.groupEnd();
  } else {
    console.log("trend: undefined");
  }
  console.groupEnd();

  const [userName, setUserName] = useState(userSettings.userName || "");
  const [sensorIds, setSensorIds] = useState<string[]>(userSettings.sensorIds || []);
  const [trendSensorId, setTrendSensorId] = useState(userSettings.trend?.sensorId || "");
  const [trendDataType, setTrendDataType] = useState(userSettings.trend?.dataType || "");
  const [trendDataTypes, setTrendDataTypes] = useState<string[]>([]);
  const [trendValueCount, setTrendValueCount] = useState<number | "all">(userSettings.trend?.valueCount ?? 20);
  const [saving, setSaving] = useState(false);

  // When modal opens, set fields to config values
  useEffect(() => {
    setUserName(userSettings.userName || "");
    setSensorIds(userSettings.sensorIds || []);
    setTrendSensorId(userSettings.trend?.sensorId || "");
    setTrendDataType(userSettings.trend?.dataType || "");
    setTrendValueCount(userSettings.trend?.valueCount ?? 20);
  }, [userSettings, isOpen]);

  // Fetch datatypes for selected trend sensor
  useEffect(() => {
    if (trendSensorId) {
      fetchSensorDataTypes(trendSensorId).then(setTrendDataTypes);
    } else {
      setTrendDataTypes([]);
    }
  }, [trendSensorId]);

  const handleSave = async () => {
    setSaving(true);
    const pageData = {
      id: 1,
      pageName: "Homepage",
      userName,
      sensorIds,
      trend: trendSensorId && trendDataType
        ? { sensorId: trendSensorId, dataType: trendDataType, valueCount: trendValueCount }
        : undefined,
    };
    await fetch('/api/user-page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pageData),
    });
    setUserSettings({ userName, sensorIds, trend: pageData.trend });
    setSaving(false);
    onOpenChange(false);
    if (pathname === "/") {
      window.location.reload();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background/95" onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Einstellungen</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="userName" className="text-right">Name</label>
            <Input
              id="userName"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              className="col-span-3"
              placeholder="Ihr Name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="sensorSelect" className="text-right">Sensoren</label>
            <div className="col-span-3">
              <SensorMultiSelect
                id="sensorSelect"
                options={availableSensors.map((s) => ({
                  value: s.sensorID,
                  label: `${s.sensorName} (${s.sensorID})`,
                }))}
                selected={sensorIds}
                onChange={setSensorIds}
                placeholder="Sensoren auswählen"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="trendSensor" className="text-right">Trend</label>
            <div className="col-span-3 flex flex-col gap-2">
              <select
                id="trendSensor"
                className="w-full rounded border px-2 py-1"
                value={trendSensorId}
                onChange={e => {
                  setTrendSensorId(e.target.value);
                  setTrendDataType(""); // reset dataType when sensor changes
                }}
              >
                <option value="">Sensor wählen</option>
                {availableSensors.map(s => (
                  <option key={s.sensorID} value={s.sensorID}>
                    {s.sensorName} ({s.sensorID})
                  </option>
                ))}
              </select>
              <select
                id="trendDataType"
                className="w-full rounded border px-2 py-1"
                value={trendDataType}
                onChange={e => setTrendDataType(e.target.value)}
                disabled={!trendSensorId || trendDataTypes.length === 0}
              >
                <option value="">Datentyp wählen</option>
                {trendDataTypes.map(dt => (
                  <option key={dt} value={dt}>{dt}</option>
                ))}
              </select>
              <div className="flex items-center gap-2 mt-2">
                <label htmlFor="trendValueCount" className="text-sm text-gray-300">Anzahl Werte:</label>
                <Input
                  id="trendValueCount"
                  type="number"
                  min={1}
                  max={1000}
                  value={trendValueCount === "all" ? "" : trendValueCount}
                  onChange={e => {
                    const val = e.target.value;
                    setTrendValueCount(val === "" ? 1 : Math.max(1, Math.min(1000, Number(val))));
                  }}
                  className="w-20"
                  placeholder="z.B. 20"
                  disabled={trendValueCount === "all"}
                />
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={trendValueCount === "all"}
                    onChange={e => setTrendValueCount(e.target.checked ? "all" : 20)}
                  />
                  Alle anzeigen
                </label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}