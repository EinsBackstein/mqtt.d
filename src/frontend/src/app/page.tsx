"use client";

import AdvancedTemp from '@/components/static/advancedTemp';
import Pressure from '@/components/static/airpressure';
import Alert from '@/components/static/alert';
import AlertCard from '@/components/static/alertTest';
import CO2 from '@/components/static/co2';
import LineChartComponent from '@/components/static/trend';
import Trend from '@/components/static/trend';
import { Button } from '@heroui/button';
import { CircleAlert, RefreshCcw, Settings, TrendingDown, TrendingUp, TriangleAlert } from 'lucide-react';
import React from 'react';

const page = () => {
  return (
    <main className='bg-primary'>
    <div>
      <div className="flex flex-col gap-8 md:gap-6 p-8 md:p-6 bg-neutral">
        <div className="flex flex-col gap-4 md:gap-6">
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <p className="text-xl text-white/50">Willkommen zurück, Julian!</p>
        </div>
     </div>
    </div>
    <div className="h-max p-4 md:p-6 bg-neutral">
      {/* Main Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-6 lg:gap-4 max-w-screen-2xl mx-auto h-full">
        
        {/* Left Column - Alert + CO2 Stack */}
        <div className="lg:col-span-4 flex flex-col gap-4 md:gap-6 h-full">
          <Alert />
          <div className="flex flex-col gap-4 h-full">
            {[1, 2].map((item) => (
              <CO2 key={item}/>
            ))}
          </div>
        </div>

        {/* Right Column - Chart + Actions */}
        <div className="lg:col-span-8 gap-y-8 flex flex-col md:gap-6 relative">
          {/* Chart Container */}
          <div className="rounded-4xl p-4 md:p-6 ">
            <div className="">
              <LineChartComponent />
            </div>
            
            {/* Integrated CO2 Panels */}
            <div className="grid grid-cols-2 gap-4 mt-6 place-items-stretch">
              {[3, 4].map((item) => (
                <CO2 key={item}/>
              ))}
            </div>
          </div>


        </div>
      </div>
    </div>
    </main>
  );
};

export default page;