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
          
          // Check if there are message files for this sensor to extract clientType
          const messagesDir = path.join(basePath, sensorId, 'messages')
          if (fs.existsSync(messagesDir)) {
            const messageFiles = fs.readdirSync(messagesDir)
            
            for (const file of messageFiles) {
              if (file.endsWith('-messages.json')) {
                const messagesPath = path.join(messagesDir, file)
                const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf-8'))
                
                // Take clientType from the first message if available
                if (messages && messages.length > 0 && messages[0].payload) {
                  sensorData.clientType = messages[0].payload.clientType
                  break
                }
              }
            }
          }
          
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