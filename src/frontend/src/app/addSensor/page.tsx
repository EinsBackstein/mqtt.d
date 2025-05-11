import React from 'react'
import { SensorForm } from '@/components/addSensor'

const page = () => {
  return (
    <div className='m-auto flex flex-col items-center justify-center min-w-380 min-h-screen p-14'>
      <SensorForm />
    </div>
  )
}

export default page