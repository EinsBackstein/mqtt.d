'use client'

import React, { useEffect, useState } from 'react'
import SensorDataDisplay from '@/components/auto/testDisplay'
import { Skeleton } from '@/components/ui/skeleton'

interface Sensor {
  sensorID: string
  sensorName?: string
  clientType?: string // The type of device (ESP8266, ESP32, etc.)
  location?: {
    room: string
    floor: string
    description: string
  }
}

interface GroupedByDeviceType {
  [deviceType: string]: {
    deviceType: string
    sensors: string[] // Array of sensorIDs
  }
}

const DevicesPage = () => {
  const [groupedByDeviceType, setGroupedByDeviceType] = useState<GroupedByDeviceType>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const response = await fetch(`/api/devices`)
        if (!response.ok) {
          throw new Error('Failed to fetch sensors')
        }
        
        const data = await response.json()
        
        // Group sensors by device type
        const grouped: GroupedByDeviceType = {}
        
        data.forEach((sensor: Sensor) => {
          const deviceType = sensor.clientType || 'Unknown Device'
          
          if (!grouped[deviceType]) {
            grouped[deviceType] = {
              deviceType,
              sensors: []
            }
          }
          
          grouped[deviceType].sensors.push(sensor.sensorID)
        })
        
        setGroupedByDeviceType(grouped)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }
    
    fetchSensors()
  }, [])
  
  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Sensors by Device Type</h1>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(item => (
            <div key={item} className="border rounded-lg p-2">
              <Skeleton className="h-6 w-32 mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Sensors by Device Type</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    )
  }
  
  if (Object.keys(groupedByDeviceType).length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Sensors by Device Type</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No device type data available for sensors.
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Sensors by Device Type</h1>
      <div className="grid grid-cols-1 gap-6">
        {Object.entries(groupedByDeviceType).map(([deviceType, deviceInfo]) => (
          <div key={deviceType} className="border rounded-lg px-4 py-2 shadow-sm">
            <h2 className="text-lg font-semibold border-b pb-2">
              {deviceInfo.deviceType}
            </h2>
            
            <div className="space-y-1 mt-4">
              <h3 className="text-md font-medium">Sensors of this type:</h3>
              {deviceInfo.sensors.map(sensorId => (
                <SensorDataDisplay notId={true} htmlId={false} verticalId={false} key={sensorId} sensorId={sensorId} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DevicesPage