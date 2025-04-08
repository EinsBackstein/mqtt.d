import { Divider } from '@heroui/divider';
import { OctagonAlert, TriangleAlert, CircleAlert } from 'lucide-react';
import React from 'react';

const Alert = () => {
  return (
    <div className="flex flex-col max-w-[750px] h-[175px]  bg-secondary rounded-4xl ring-1 ring-white/20 shadow-md shadow-white/30 p-4">
      <h1 className="m-2 flex flex-row  items-center  text-3xl text-left font-semibold text-white">
        <OctagonAlert
          width={50}
          height={28}
          color={'#CF2430'}
          strokeWidth={2.4}
        />
        Alerts
      </h1>
      <div className="pb-4 px-4 w-full flex flex-row">
        <div className="max-w-60 flex flex-col items-end px-2">
          <div className="text-xl">Aktuelle Alerts</div>
          <div className="flex gap-2 text-4xl">
            4{' '}
            <TriangleAlert
              width={36}
              height={36}
              color={'#F5A524'}
              strokeWidth={2.4}
            />
          </div>
        </div>
        <Divider
          className="h-full w-0.5 m-2 bg-amber-50 rounded-4xl"
          orientation="vertical"
        />
        <div className="px-2">
          <div className="text-xl">Neuester Alert</div>
          <div className='bg-caution/30 max-w-100 py-1 pr-4 pl-2 rounded-2xl flex flex-row gap-2 items-center'>
          <CircleAlert
              width={32}
              height={32}
              color={'#F5A524'}
              strokeWidth={2.4}
            />
            <span className="text-lg"><b className='font-bold'>Sensor 1: </b>Temperatur zu hoch!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
