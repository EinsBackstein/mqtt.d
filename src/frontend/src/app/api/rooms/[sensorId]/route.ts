import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Path to the directory containing sensor data folders
    const basePath = path.join(process.cwd(), '..', 'sensor-data')
    
    // Get all sensor folders
    const sensorFolders = fs.readdirSync(basePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
    
    // Array to store sensor data
    const sensorsData = []
    
    // Read data for each sensor
    for (const sensorId of sensorFolders) {
      try {
        const sensorJsonPath = path.join(basePath, sensorId, `${sensorId}.json`)
        
        if (fs.existsSync(sensorJsonPath)) {
          const sensorData = JSON.parse(fs.readFileSync(sensorJsonPath, 'utf-8'))
          sensorsData.push(sensorData)
        }
      } catch (error) {
        console.error(`Error reading data for sensor ${sensorId}:`, error)
        // Skip this sensor and continue with others
      }
    }
    
    return NextResponse.json(sensorsData)
  } catch (error) {
    console.error('Error fetching sensors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sensor data' },
      { status: 500 }
    )
  }
}

// POST handler for creating a new sensor
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate the request body
    if (!body.sensorID || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const sensorId = body.sensorID
    const basePath = path.join(process.cwd(), '..', 'sensor-data', sensorId)
    
    // Create sensor folder if it doesn't exist
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true })
      fs.mkdirSync(path.join(basePath, 'configurations'), { recursive: true })
      fs.mkdirSync(path.join(basePath, 'messages'), { recursive: true })
    }
    
    // Write sensor data to file
    fs.writeFileSync(
      path.join(basePath, `${sensorId}.json`),
      JSON.stringify(body, null, 2)
    )
    
    return NextResponse.json(
      { message: 'Sensor created successfully', sensor: body },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating sensor:', error)
    return NextResponse.json(
      { error: 'Failed to create sensor' },
      { status: 500 }
    )
  }
}