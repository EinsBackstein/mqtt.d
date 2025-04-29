"use client"
import { Button } from '@heroui/button'
import React from 'react'

const AdvancedTemp = () => {
  const minTemp = -20;
  const maxTemp = 20;
  const range = maxTemp - minTemp;
  const currentTemp = 3.5;
  const fillPercentage = ((currentTemp - minTemp) / range) * 100;
  const clampedFillPercentage = Math.min(Math.max(fillPercentage, 0), 100);
  const steps = Array.from({ length: 7 }, (_, i) => Math.round(minTemp + i * ((maxTemp - minTemp) / 6)));

  return (
    <div className="flex flex-col md:flex-row items-center justify-center w-full md:w-[450px] max-h-[200px] bg-secondary rounded-4xl ring-1 ring-info/20 shadow-md shadow-info/30 p-4">
      <div className="flex flex-col w-full h-full pt-4">
        <div className="flex flex-row items-end gap-4 pb-2">
          <h1 className="text-xl md:text-2xl text-left font-semibold text-white">
            🌡️ Temperatur
          </h1>
          <p className="text-xs text-left text-white/20">ID: #MV1g3t$Be4tn</p>
        </div>
        <p className="text-3xl md:text-4xl text-info font-bold pb-0.5">3.5°C ↘</p>
        <p className="text-sm text-white/35"> -1.2°C seit letzter Messung</p>
        <p className="text-sm text-white/25 italic pb-2">@ 2025-04-01 23:11:42</p>
        <div className="relative w-full h-3 bg-gray-500 rounded-full mt-2">
          <div className="absolute h-full rounded-l-full bg-info/90" style={{ width: `${clampedFillPercentage}%` }}></div>
          <div
            className="absolute top-[-4px] bottom-[-4px] w-[8px] bg-info rounded-full"
            style={{ left: `calc(${clampedFillPercentage}% - 4px)` }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/40 mt-1">
          {steps.map((value) => (
            <span key={value}>{value}°C</span>
          ))}
        </div>
      </div>
      <div className="flex gap-2 mt-4 md:mt-0">
        <Button isIconOnly className="rounded-4xl text-2xl">
          <p>⚙️</p>
        </Button>
        <Button isIconOnly className="rounded-md text-2xl">
          <p>🔄️</p>
        </Button>
      </div>
    </div>
  )
}

export default AdvancedTemp
