'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SensorDataDisplay from "@/components/auto/testDisplay";
import { SensorMultiSelect } from "./ui/sensorMultiSelect";
import { ArrowDownToLine, ArrowUpToLine, FoldVertical } from "lucide-react";


type Option = {
  value: string;
  label: string;
};

export default function AddCustomSensorPage({
  isOpen,
  onOpenChange,
  onSuccess,
  availableSensors,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  availableSensors: Array<{ sensorID: string; sensorName: string }>;
}) {
  const [pageName, setPageName] = useState("");
  const [selectedSensorIds, setSelectedSensorIds] = useState<string[]>([]);
  const [customPages, setCustomPages] = useState<any[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [showPages, setShowPages] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // Fetch all custom pages
  const fetchPages = async () => {
    setLoadingPages(true);
    const res = await fetch('/api/user-page/list');
    if (res.ok) {
      setCustomPages(await res.json());
    } else {
      setCustomPages([]);
    }
    setLoadingPages(false);
  };

  useEffect(() => {
    if (isOpen) fetchPages();
  }, [isOpen]);

  const handleSave = async () => {
    if (!pageName || selectedSensorIds.length === 0) {
      alert("Bitte einen Namen und mindestens einen Sensor wählen.");
      return;
    }
    const pageData = {
      pageName,
      sensorIds: selectedSensorIds,
      id: Date.now(),
    };

    const res = await fetch('/api/user-page', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pageData),
    });

    if (res.ok) {
      await fetchPages();
      onSuccess();
      handleClose();
    } else {
      alert('Fehler beim Speichern!');
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/user-page/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchPages();
      setDeleteTarget(null);
    } else {
      alert('Fehler beim Löschen!');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setPageName("");
    setSelectedSensorIds([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[1000px] bg-background/95"
        onClick={e => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Eigene Sensorseite erstellen</DialogTitle>
          <DialogDescription>
            Wählen Sie die Sensoren aus, die auf Ihrer Seite angezeigt werden sollen.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pageName" className="text-right">
              Seitenname
            </Label>
            <Input
              id="pageName"
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              className="col-span-3"
              placeholder="Meine Sensorseite"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sensorSelect" className="text-right">
              Sensoren
            </Label>
            <div className="col-span-3">
              <SensorMultiSelect
                id="sensorSelect"
                options={availableSensors.map((s) => ({
                  value: s.sensorID,
                  label: `${s.sensorName} (${s.sensorID})`,
                }))}
                selected={selectedSensorIds}
                onChange={setSelectedSensorIds}
                placeholder="Sensoren auswählen"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Abbrechen
          </Button>
          <Button type="button" onClick={handleSave}>
            Speichern
          </Button>
        </div>
        {/* Vorschau der ausgewählten Sensoren */}
        {selectedSensorIds.length > 0 && (
          <div className="mt-6 space-y-4 overflow-y-scroll max-h-96">
            <h3 className="font-semibold">Vorschau:</h3>
            {selectedSensorIds.map((sensorId) => (
              <SensorDataDisplay
                key={sensorId}
                sensorId={sensorId}
                notId={false}
                htmlId={false}
                verticalId={false}
              />
            ))}
          </div>
        )}
        {/* List of existing custom pages (collapsible) */}
        <div className="mt-8">
          <button
            type="button"
            className="flex items-center gap-2 font-semibold mb-2 text-left hover:underline"
            onClick={() => setShowPages((v) => !v)}
          >
            <span>Bestehende Seiten:</span>
            <span className="text-xs">
              {showPages ? <ArrowDownToLine /> : <ArrowUpToLine /> }
            </span>
          </button>
          {showPages && (
            loadingPages ? (
              <div>Lade Seiten...</div>
            ) : customPages.length === 0 ? (
              <div className="text-neutral-400">Keine Seiten vorhanden.</div>
            ) : (
              <ul className="space-y-2">
                {customPages.map((page) => (
                  <li key={page.id} className="flex items-center justify-between bg-neutral-800 rounded px-4 py-2">
                    <span>{page.pageName}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteTarget(page)}
                    >
                      Löschen
                    </Button>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>

        {/* Custom confirmation dialog */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-neutral-900 rounded-lg p-6 shadow-lg w-full max-w-sm">
              <div className="font-semibold mb-2">Seite löschen?</div>
              <div className="mb-4 text-neutral-300">
                Möchten Sie <span className="font-bold">{deleteTarget.pageName}</span> wirklich löschen?
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                  Abbrechen
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(deleteTarget.id)}
                >
                  Löschen
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}