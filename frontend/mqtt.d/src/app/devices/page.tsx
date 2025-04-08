import BaseLayer from '@/components/auto/baseLayer';
import AdvancedTemp from '@/components/static/advancedTemp';
import Pressure from '@/components/static/airpressure';
import CO2 from '@/components/static/co2';
import Humidity from '@/components/static/humidity';
import Brightness from '@/components/static/lightlevel';
import Temperatur from '@/components/static/temp';
import { Settings2 } from 'lucide-react';
import React from 'react';

const page = () => {
  const icon = <Settings2 />;
  const titleTest = 'Test-Display';
  const idTest = 'testid1';
  const valueTest = 23.5;
  const lastValueTest = 26;
  const timeStampTest = '2023-10-01 12:00:00';
  const statusColorTest = 'danger';
  return (
    <div className="w-[80%] ml-4 h-screen grid grid-rows-[auto,1fr]">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mt-4">Device Sensors</h1>
        <p className="text-gray-600">
          Monitor the data from various sensors in real-time.
        </p>
      </header>
      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold">Sensor 1</h2>
          <div className="flex gap-4 mt-2">
            <Pressure />
            <CO2 />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Sensor 2</h2>
          <div className="flex gap-4 mt-2">
            <Temperatur />
            <Brightness />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Sensor 3</h2>
          <div className="flex gap-4 mt-2 max-h-100">
            <AdvancedTemp />
            <BaseLayer
              icon={icon}
              heading={titleTest}
              id={idTest}
              value={valueTest}
              lastValue={lastValueTest}
              timeStamp={timeStampTest}
              statusColor={statusColorTest}
            />
            <Brightness />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Sensor 4</h2>
          <div className="flex gap-4 mt-2 pb-4">
            <Humidity />
          </div>
        </div>
      </section>
    </div>
  );
};

export default page;
