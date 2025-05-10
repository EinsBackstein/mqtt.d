import React from 'react'
import { SensorForm } from '@/components/addSensor'

const page = () => {
  return (
    <div className='m-auto flex flex-col items-center justify-center w-250 min-h-screen p-4'>
      <SensorForm />
    </div>
  )
}

export default page