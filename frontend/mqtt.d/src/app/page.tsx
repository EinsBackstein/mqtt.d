import AdvancedTemp from '@/components/static/advancedTemp'
import Alert from '@/components/static/alert'
import Trend from '@/components/static/trend'
import React from 'react'

const page = () => {
  return (
    <div>
      <h1 className='text-3xl mt-14 ml-10'>Hallo, Julian!</h1>
      <div className='grid grid-cols-12 grid-rows-8 ml-10 mt-5 gap-4'>
        <Alert />
        <AdvancedTemp />
        <Trend />
      </div>
    </div>
  )
}

export default page