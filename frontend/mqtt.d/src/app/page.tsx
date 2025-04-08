import AdvancedTemp from '@/components/static/advancedTemp'
import Pressure from '@/components/static/airpressure'
import Alert from '@/components/static/alert'
import CO2 from '@/components/static/co2'
import Trend from '@/components/static/trend'
import React from 'react'

const page = () => {
  return (
    <div className='w-[80%] overflow-hidden h-screen grid grid-rows-[auto,1fr]'>
      <h1 className='text-3xl mt-14 ml-10'>Hallo, Julian!</h1>
      <br />
      <div className='grid grid-cols-6 grid-rows-6 gap-10 p-4'>
        <div className='col-span-3 row-span-1'>
          <Alert />
        </div>
        <div className='col-span-2 row-span-1 justify-end'>
          <Pressure />
        </div>
        <div className='col-span-2 row-start-2 col-start-1'>
          <CO2 />
        </div>
        <div className='col-span-2 flex items-end row-start-3  col-start-1'>
          <AdvancedTemp />
        </div>
        <div className='col-span-4 row-start-2 row-span-4 col-start-3'>
          <Trend />
        </div>
      </div>
    </div>
  )
}

export default page