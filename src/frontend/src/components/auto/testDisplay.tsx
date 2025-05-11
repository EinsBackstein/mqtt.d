'use client'
import { useEffect, useState } from 'react'
import BaseLayer from './baseLayer'
import { Thermometer, Sun, CloudRain, Gauge, Wind } from 'lucide-react'
import type { SensorConfig, SensorData } from '@/lib/types'

export default function SensorDataDisplay({ sensorId }: { sensorId: string }) {
  const [sensorData, setSensorData] = useState<SensorData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/sensors/${sensorId}`)
        if (!response.ok) throw new Error('Sensor not found')
        const data = await response.json()
        setSensorData(data)
      } catch (error) {
        console.error('Error fetching sensor data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [sensorId])

  const getIcon = (dataType: string) => {
    switch (dataType) {
      case 'Temperatur': return <Thermometer />
      case 'Helligkeit': return <Sun />
      case 'Luftfeuchtigkeit': return <CloudRain />
      case 'Luftdruck': return <Gauge />
      case 'Luftqualität': return <Wind />
      default: return <div>📡</div>
    }
  }

  const calculateStatusColor = (config: SensorConfig, latestValue: number) => {
    // console.log(config.grenzwerte[0])
    if (!config.grenzwerte) return '#FFFFFF'
    const activeThresholds = config.grenzwerte.filter(t => {
      if (t.condition === 'über') return latestValue > t.value
      if (t.condition === 'unter') return latestValue < t.value
      return latestValue === t.value
    })
    // console.log(activeThresholds[0].color)
    return activeThresholds[0]?.color
  }

  if (loading) return <div>Loading sensor data...</div>
  if (!sensorData) return <div>Sensor not found</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {sensorData.sensor.sensorData.map((dataType) => {
        const config = sensorData.configurations[dataType]
        const messages = sensorData.messages[dataType]
        const latest = messages?.[messages.length - 1]
        const previous = messages?.[messages.length - 2]

        if (!latest || !config) return null

        const statusColor = calculateStatusColor(config, latest.value)
        // console.log(statusColor)
        return (
          <BaseLayer
            key={dataType}
            icon={getIcon(dataType)}
            heading={dataType}
            id={sensorId}
            value={latest.value}
            lastValue={previous?.value}
            timeStamp={latest.timestamp}
            statusColor={String(statusColor)}
          />
        )
      })}
    </div>
  )
}