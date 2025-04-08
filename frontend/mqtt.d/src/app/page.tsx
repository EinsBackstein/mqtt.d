import AdvancedTemp from '@/components/static/advancedTemp'
import Alert from '@/components/static/alert'
import Trend from '@/components/static/trend'
import React from 'react'

const page = () => {
  return (
    <div>
      <h1 className='text-3xl mt-14 ml-10'>Hallo, Julian!</h1>
      <div className=''>
        {/* <div><Alert /></div> */}
        <AdvancedTemp />
        <Trend />
      </div>
    </div>
  )
}

export default page