'use client'

import React, { useEffect, useState } from 'react'
import SensorDataDisplay from '@/components/auto/testDisplay'
import { Skeleton } from '@/components/ui/skeleton'

interface Sensor {
  sensorID: string
  sensorName?: string
  sensorTyp?: string
  location: {
    room: string
    floor: string
    description: string
  }
}

interface GroupedByLocation {
  [locationKey: string]: {
    floor: string
    room: string
    description: string
    sensors: string[] // Array of sensorIDs
  }
}

const SensorRoomsPage = () => {
  // Removed unused sensors state
  const [groupedByLocation, setGroupedByLocation] = useState<GroupedByLocation>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        // Change this line from /api/rooms/ to /api/sensors
        const response = await fetch(`/api/rooms`)
        if (!response.ok) {
          throw new Error('Failed to fetch sensors')
        }
        
        const data = await response.json()
        // Removed setSensors as sensors state is no longer used
        
        // Group sensors by unique location
        const grouped: GroupedByLocation = {}
        
        data.forEach((sensor: Sensor) => {
          const floor = sensor.location?.floor || 'Unknown Floor'
          const room = sensor.location?.room || 'Unknown Room'
          const description = sensor.location?.description || 'No description'
          
          // Create a unique key for each location
          const locationKey = `${floor}-${room}`
          
          if (!grouped[locationKey]) {
            grouped[locationKey] = {
              floor,
              room,
              description,
              sensors: []
            }
          }
          
          grouped[locationKey].sensors.push(sensor.sensorID)
        })
        
        setGroupedByLocation(grouped)
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
        <h1 className="text-2xl font-bold mb-6">Sensor Locations</h1>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4].map(loc => (
            <div key={loc} className="border rounded-lg p-2">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-4" />
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
        <h1 className="text-2xl font-bold mb-6">Sensor Locations</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    )
  }
  
  if (Object.keys(groupedByLocation).length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Sensor Locations</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No location data available for sensors.
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Sensor Locations</h1>
      <div className="grid grid-cols-1 gap-6">
        {Object.entries(groupedByLocation).map(([locationKey, locationInfo]) => (
          <div key={locationKey} className="border rounded-lg px-4 py-2 shadow-sm">
            <h2 className="text-lg font-semibold border-b pb-2">
              {locationInfo.room} (Floor: {locationInfo.floor})
            </h2>
            <p className="text-sm text-muted mt-2 mb-4">{locationInfo.description}</p>
            
            <div className="space-y-1">
              <h3 className="text-md font-medium">Sensors in this location:</h3>
              {locationInfo.sensors.map(sensorId => (
                <SensorDataDisplay notId={true} htmlId={false} verticalId={false} key={sensorId} sensorId={sensorId} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SensorRoomsPage