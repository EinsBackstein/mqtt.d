'use client';

import { Button } from '@heroui/button';
import React from 'react';

const Temperatur = () => {
  return (
    <div className="flex flex-row items-center justify-center w-[450px] h-[180px] bg-secondary rounded-4xl ring-1 ring-success/20 shadow-md shadow-success/30 p-4">
      <div className="flex flex-col w-full h-full pt-4">
        <div className="flex flex-row items-end gap-4 pb-2">
          <h1 className="text-xl text-left font-semibold text-white">
            🌡️ Temperatur
          </h1>
          <p className="text-xs text-left text-white/20">ID: #OP81_wdc</p>
        </div>
        <p className="text-3xl text-success font-bold pb-0.5">23.5°C ↘</p>
        <p className="text-sm text-white/35"> -1.2°C seit letzter Messung</p>
        <p className="text-sm text-white/25 italic">@ 2025-04-01 23:11:42</p>
      </div>
      <div>
        <Button isIconOnly className=" rounded-4xl text-2xl">
          <p>⚙️</p>
        </Button>
        <Button isIconOnly className="rounded-md text-2xl">
          <p>🔄️</p>
        </Button>
      </div>
    </div>
  );
};

export default Temperatur;
