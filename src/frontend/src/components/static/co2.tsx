import { Button } from '@heroui/button';
import React from 'react';
import { MoveRight, RefreshCcw, Settings, TrendingDown, TrendingUp } from 'lucide-react'

const CO2 = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center w-[80%] bg-secondary rounded-4xl max-h-60 ring-1 ring-danger/20 shadow-md shadow-danger/30 p-4">
      <div className="flex flex-col w-full h-full pt-4">
        <div className="flex flex-row items-end gap-4 pb-2">
          <h1 className="text-lg md:text-xl text-left font-semibold text-white">
            ༄ Luftqualität
          </h1>
          <p className="text-xs text-left text-white/20">ID: #LH44_n0W1n</p>
        </div>
        <p className="text-3xl md:text-4xl text-danger font-bold pb-0.5">Schlecht</p>
        <p className="text-sm text-white/35"> Luftqualitäts-Index: 5</p>
        <p className="text-sm text-white/35">CO²-Wert: 1250</p>
        <p className="text-sm text-white/25 pt-0.5">
          +240 ppm seit letzter Messung
        </p>
        <p className="text-sm text-white/25 italic">@ 2025-04-01 23:11:42</p>
      </div>
      <div className="flex flex-col gap-2 mt-4 md:mt-0">
        <Button isIconOnly className="rounded-4xl text-2xl">
          <p>⚙️</p>
        </Button>
        <Button isIconOnly className="rounded-md text-2xl">
          <p>🔄️</p>
        </Button>
      </div>
    </div>
  );
};
export default CO2;