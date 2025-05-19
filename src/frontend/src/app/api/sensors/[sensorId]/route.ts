import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic' // Add this line

export async function GET(request: Request, props: { params: Promise<{ sensorId: string }> }) {
  const params = await props.params;
  const sensorId = params.sensorId;
  try {
    const sensorId = (await props.params).sensorId
    const basePath = path.join(process.cwd(), '..', 'data', sensorId)
    const test = fs.readdirSync(basePath)
    // console.log(test)

    // Rest of your existing code...
    const sensorData = JSON.parse(
      fs.readFileSync(path.join(basePath, `${sensorId}.json`), 'utf-8'
    )
    )

    // Read configurations and messages for each data type
    const dataTypes = sensorData.sensorData
    const result = {
      sensor: sensorData,
      configurations: {} as Record<string, any>,
      messages: {} as Record<string, any>
    }

    for (const dataType of dataTypes) {
      try {
        result.configurations[dataType] = JSON.parse(
          fs.readFileSync(
            path.join(basePath, 'configurations', `${dataType}-config.json`),
            'utf-8'
          )
        )
        result.messages[dataType] = JSON.parse(
          fs.readFileSync(
            path.join(basePath, 'messages', `${dataType}-messages.json`),
            'utf-8'
          )
        )
      } catch (error) {
        console.error(`Error loading data for ${dataType}:`, error)
      }
    }

    // console.log(result)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: `Sensor ${sensorId} not found` },
      { status: 404 }
    )
  }
}
