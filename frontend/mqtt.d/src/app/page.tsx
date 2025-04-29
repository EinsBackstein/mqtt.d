import AdvancedTemp from '@/components/static/advancedTemp';
import Pressure from '@/components/static/airpressure';
import Alert from '@/components/static/alert';
import CO2 from '@/components/static/co2';
import Trend from '@/components/static/trend';
import React from 'react';

const page = () => {
  return (
    <div className="w-full sm:w-full md:w-full lg:w-full overflow-hidden h-auto sm:h-screen grid grid-rows-[auto,1fr]">
      <h1 className="text-3xl mt-2 ml-10">Hallo, Julian!</h1>
      <br />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
        {/* Alert Component */}
        <div className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 row-span-1">
          <Alert />
        </div>

        {/* Pressure Component */}
        <div className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 row-span-1">
          <Pressure />
        </div>

        {/* CO2 Component */}
        <div className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 row-start-2 col-start-1">
          <CO2 />
        </div>

        {/* AdvancedTemp Component */}
        <div className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2 flex items-end row-start-3 col-start-1">
          <AdvancedTemp />
        </div>

        {/* Trend Component */}
        <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 row-start-2 row-span-4 col-start-1">
          <Trend />
        </div>
      </div>
    </div>
  );
};

export default page;
