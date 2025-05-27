'use client';

import { useState } from "react";
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
import { MultiSelect } from "@/components/ui/mutliselect"; // You may need to adjust import path
import SensorDataDisplay from "@/components/auto/testDisplay";
import { SensorMultiSelect } from "./ui/sensorMultiSelect";

type Option = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
};



export default function AddCustomSensorPage({
  isOpen,
  onOpenChange,
  onSuccess,
  availableSensors, // [{ sensorID: string, sensorName: string }]
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  availableSensors: Array<{ sensorID: string; sensorName: string }>;
}) {
  const [pageName, setPageName] = useState("");
  const [selectedSensorIds, setSelectedSensorIds] = useState<string[]>([]);

  const handleSave = async () => {
    if (!pageName || selectedSensorIds.length === 0) {
      alert("Bitte einen Namen und mindestens einen Sensor wählen.");
      return;
    }
    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('customSensorPages') || '[]');
    existing.push({
      pageName,
      sensorIds: selectedSensorIds,
      id: Date.now(), // unique id
    });
    localStorage.setItem('customSensorPages', JSON.stringify(existing));
    onSuccess();
    handleClose();
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
        onClick={e => e.stopPropagation()} // <-- Add this line
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
      </DialogContent>
    </Dialog>
  );
}