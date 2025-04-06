'use client';

import { Button } from '@heroui/button';
import React from 'react';

const Pressure = () => {
  return (
    <div className="flex flex-row items-center justify-center w-[450px] h-[180px] bg-secondary rounded-4xl ring-1 ring-white/20 shadow-md shadow-white/30 p-4">
      <div className="flex flex-col w-full h-full pt-4">
        <div className="flex flex-row items-end gap-4 pb-2">
          <h1 className="text-xl text-left font-semibold text-white">
            🗿 Luftdruck
          </h1>
          <p className="text-xs text-left text-white/20">ID: #MayBeeF1</p>
        </div>
        <p className="text-3xl text-white/40 font-bold pb-0.5">Hoch</p>
        <p className="text-sm text-white/35"> > 1035 hPa </p>
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

export default Pressure;
