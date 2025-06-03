'use client';

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDown, ArrowUp, CircleAlert, OctagonAlert, TriangleAlert, X } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

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

export default function AlertOverviewModal({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showOnlyLatest, setShowOnlyLatest] = useState(false);

  // Sorting state
  const [sortBy, setSortBy] = useState<'timestamp' | 'sensorId' | 'critical'>('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (!isOpen) return;
    const fetchAlerts = async () => {
      try {
        const res = await fetch("/api/alerts");
        if (res.ok) {
          const data = await res.json();
          setAlerts(Array.isArray(data) ? data : []);
        }
      } catch {
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Filter alerts by search
  const filteredAlerts = alerts.filter(
    (alert) =>
      alert.sensorId.toLowerCase().includes(search.toLowerCase()) ||
      alert.dataType.toLowerCase().includes(search.toLowerCase())
  );

  // Optionally show only the latest alert per sensor
  const latestAlertsPerSensor = Object.values(
    filteredAlerts.reduce((acc, alert) => {
      if (
        !acc[alert.sensorId] ||
        new Date(alert.timestamp) > new Date(acc[alert.sensorId].timestamp)
      ) {
        acc[alert.sensorId] = alert;
      }
      return acc;
    }, {} as Record<string, AlertType>)
  );

  // --- Sorting logic ---
  function sortAlerts(alerts: AlertType[]) {
    return [...alerts].sort((a, b) => {
      if (sortBy === 'timestamp') {
        const aTime = new Date(a.timestamp).getTime();
        const bTime = new Date(b.timestamp).getTime();
        return sortDir === 'asc' ? aTime - bTime : bTime - aTime;
      }
      if (sortBy === 'sensorId') {
        if (a.sensorId < b.sensorId) return sortDir === 'asc' ? -1 : 1;
        if (a.sensorId > b.sensorId) return sortDir === 'asc' ? 1 : -1;
        return 0;
      }
      if (sortBy === 'critical') {
        // critical first if desc, non-critical first if asc
        if ((a.critical ? 1 : 0) < (b.critical ? 1 : 0)) return sortDir === 'asc' ? -1 : 1;
        if ((a.critical ? 1 : 0) > (b.critical ? 1 : 0)) return sortDir === 'asc' ? 1 : -1;
        return 0;
      }
      return 0;
    });
  }

  const displayAlerts = sortAlerts(showOnlyLatest ? latestAlertsPerSensor : filteredAlerts);

  // Dismiss all alerts (for demo: clears all, in real app, should POST to backend)
  const handleClearAll = async () => {
    setLoading(true);
    await fetch('/api/alerts', { method: 'DELETE' });
    setAlerts([]);
    setLoading(false);
  };

  // Add this handler to stop propagation on modal content
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[600px] bg-white text-black dark:bg-neutral-900 dark:text-neutral-100 transition-colors max-h-[90vh] overflow-y-auto"
        onClick={handleModalClick}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <OctagonAlert width={28} height={28} color="#CF2430" strokeWidth={2.2} />
            Alerts Übersicht
          </DialogTitle>
          <DialogDescription>
            Übersicht aller aktuellen System-Alerts. Suche, filtere, sortiere oder lösche Alerts.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-2">
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Sensor-ID oder Typ suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button
              variant={showOnlyLatest ? "default" : "outline"}
              onClick={() => setShowOnlyLatest((v) => !v)}
              className="text-xs px-3 py-1"
            >
              {showOnlyLatest ? "Alle anzeigen" : "Nur neueste pro Sensor"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearAll}
              className="text-xs px-3 py-1"
              title="Alle Alerts löschen"
            >
              <X size={16} /> Alle löschen
            </Button>
          </div>
          {/* --- Sorting controls --- */}
          <div className="flex gap-2 items-center">
            <span className="text-xs">Sortieren:</span>
            <Select
              value={`${sortBy}_${sortDir}`}
              onValueChange={val => {
                const [by, dir] = val.split('_');
                setSortBy(by as 'timestamp' | 'sensorId' | 'critical');
                setSortDir(dir as 'asc' | 'desc');
              }}
            >
              <SelectTrigger className="w-[170px] text-xs bg-neutral-800 text-white border rounded px-2 py-1 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp_asc">
                  Zeit <ArrowUp className="inline w-3 h-3" />
                </SelectItem>
                <SelectItem value="timestamp_desc">
                  Zeit <ArrowDown className="inline w-3 h-3" />
                </SelectItem>
                <SelectItem value="sensorId_asc">
                  ID <ArrowUp className="inline w-3 h-3" />
                </SelectItem>
                <SelectItem value="sensorId_desc">
                  ID <ArrowDown className="inline w-3 h-3" />
                </SelectItem>
                <SelectItem value="critical_asc">
                  Priorität <ArrowUp className="inline w-3 h-3" />
                </SelectItem>
                <SelectItem value="critical_desc">
                  Priorität <ArrowDown className="inline w-3 h-3" />
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* --- End sorting controls --- */}
          <div className="flex flex-row gap-4 items-center">
            <span className="text-base font-semibold">
              Aktuelle Alerts: {loading ? "..." : displayAlerts.length}
            </span>
            <TriangleAlert width={20} height={20} color="#F5A524" strokeWidth={2} />
          </div>
          <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto mt-2">
            {loading ? (
              <div className="text-sm text-gray-400">Lade...</div>
            ) : displayAlerts.length === 0 ? (
              <div className="text-sm text-gray-400">Keine Alerts vorhanden.</div>
            ) : (
              displayAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`py-1 pr-2 pl-1 rounded-2xl flex flex-row gap-2 items-center border-l-4
                    ${alert.critical
                      ? 'bg-red-200 dark:bg-red-900/40 border-red-600'
                      : 'bg-yellow-100 dark:bg-yellow-900/40 border-yellow-400'}
                  `}
                >
                  <CircleAlert
                    width={16}
                    height={16}
                    color={alert.critical ? '#CF2430' : '#F5A524'} // tailwind danger/caution
                    strokeWidth={2}
                  />
                  <span className="text-xs">
                    <b>Sensor {alert.sensorId}:</b> {alert.dataType} {alert.threshold.condition} {alert.threshold.value}{' '}
                    <span
                      className="font-semibold"
                      style={{ color: alert.critical ? '#CF2430' : '#F5A524' }}
                    >
                      (Gemessen: {alert.value})
                    </span>
                    {alert.critical && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold">CRITICAL</span>
                    )}
                    <span className="ml-2 text-[10px] text-gray-400">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}