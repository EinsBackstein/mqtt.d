// app/api/sensor-data/[sensorId]/route.ts
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: { sensorId: string } }) {
  const { sensorId } = await params
  
  try {
    const basePath = path.join(process.cwd(), '..', 'sensor-data', sensorId, 'messages')
    const dataFilePath = path.join(basePath, `Temperatur-messages.json`)

    // Read and parse the sensor data file
    const rawData = fs.readFileSync(dataFilePath, 'utf-8')
    const sensorData = JSON.parse(rawData)
    // console.log(sensorData)
    // Transform data to match your static format if necessary
    const formattedData = sensorData.map((entry) => ({
      name: entry.timestamp,  // assuming your stored data has timestamp field
      value: Number(entry.payload.dataValue)
    }))

    // console.log(formattedData)
    return NextResponse.json(formattedData.slice(-5))
    
  } catch (error) {
    console.error(`Error fetching data for sensor ${sensorId}:`, error)
    return NextResponse.json(
      { error: `Sensor data for ${sensorId} not found` },
      { status: 404 }
    )
  }
}