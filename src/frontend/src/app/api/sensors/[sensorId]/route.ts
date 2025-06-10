import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

// Deep merge helper
function deepMerge(target: any, source: any) {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      if (!target[key]) target[key] = {}
      deepMerge(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}

// GET /api/sensors/[sensorId]?dataType=...
export async function GET(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  const sensorId = params.sensorId
  const url = new URL(request.url)
  const dataType = url.searchParams.get('dataType')

  try {
    const basePath = path.join(process.cwd(), '..', 'data', sensorId)
    const sensorFile = path.join(basePath, `${sensorId}.json`)
    if (!fs.existsSync(sensorFile)) {
      return NextResponse.json({ error: `Sensor ${sensorId} not found` }, { status: 404 })
    }
    const sensorData = JSON.parse(fs.readFileSync(sensorFile, 'utf-8'))

    if (dataType) {
      const messagesFile = path.join(basePath, 'messages', `${dataType}-messages.json`)
      const messages = fs.existsSync(messagesFile)
        ? JSON.parse(fs.readFileSync(messagesFile, 'utf-8'))
        : []
      return NextResponse.json({
        sensor: sensorData,
        messages: { [dataType]: messages },
      })
    }

    const dataTypes = sensorData.sensorData as string[]
    const result = {
      sensor: sensorData,
      configurations: {} as Record<string, any>,
      messages: {} as Record<string, any>,
    }

    for (const dt of dataTypes) {
      try {
        result.configurations[dt] = JSON.parse(
          fs.readFileSync(path.join(basePath, 'configurations', `${dt}-config.json`), 'utf-8'),
        )
        result.messages[dt] = JSON.parse(
          fs.readFileSync(path.join(basePath, 'messages', `${dt}-messages.json`), 'utf-8'),
        )
      } catch {
        // skip missing/broken files
      }
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: `Sensor ${sensorId} not found` },
      { status: 404 },
    )
  }
}

// PATCH /api/sensors/[sensorId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { sensorId: string } }
) {
  const sensorId = params.sensorId

  try {
    const body = await req.json()
    console.log(`[PATCH] Received body for sensor ${sensorId}:`, JSON.stringify(body, null, 2))

    const { sensor } = body
    if (!sensor) {
      console.error(`[PATCH] Missing sensor object in request body for sensor ${sensorId}`)
      return NextResponse.json({ error: 'Missing sensor object', debug: body }, { status: 400 })
    }

    const basePath = path.join(process.cwd(), '..', 'data', sensorId)
    const sensorFile = path.join(basePath, `${sensorId}.json`)
    const configDir = path.join(basePath, 'configurations')
    const messagesDir = path.join(basePath, 'messages')

    if (!fs.existsSync(sensorFile)) {
      console.error(`[PATCH] Sensor file not found: ${sensorFile}`)
      return NextResponse.json({ error: 'Sensor not found', debug: { sensorFile } }, { status: 404 })
    }

    // 1. Update main sensor file if basic info is present
    let updatedSensorData = null
    if (
      'sensorName' in sensor ||
      'sensorDescription' in sensor ||
      'sensorData' in sensor
    ) {
      const existing = JSON.parse(fs.readFileSync(sensorFile, 'utf-8'))
      const updated = deepMerge({ ...existing }, {
        ...(sensor.sensorName && { sensorName: sensor.sensorName }),
        ...(sensor.sensorDescription && { sensorDescription: sensor.sensorDescription }),
        ...(sensor.sensorData && { sensorData: sensor.sensorData }),
      })
      fs.writeFileSync(sensorFile, JSON.stringify(updated, null, 2))
      updatedSensorData = updated
      console.log(`[PATCH] Updated sensor file: ${sensorFile}`)
    }

    // 2. Update config file if config for a dataType is present
    if ('config' in sensor && 'dataType' in sensor) {
      if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true })
      const configFile = path.join(configDir, `${sensor.dataType}-config.json`)
      fs.writeFileSync(configFile, JSON.stringify(sensor.config, null, 2))
      console.log(`[PATCH] Updated config file: ${configFile}`)
    }

    // 3. Create config/messages files for new types if sensorData changed
    if ('sensorData' in sensor) {
      const existing = updatedSensorData || JSON.parse(fs.readFileSync(sensorFile, 'utf-8'))
      const prevTypes = Array.isArray(existing.sensorData) ? existing.sensorData.map(String) : []
      const newTypes = Array.isArray(sensor.sensorData) ? sensor.sensorData.map(String) : []
      const addedTypes = newTypes.filter((t: any) => !prevTypes.includes(t))

      const defaultConfig = (dataType: string) => ({
        dataType,
        name: dataType,
        description: '',
        unit: '',
        maxAgeHours: 24,
        grenzwerte: [],
      })
      const defaultMessages: any[] = []

      if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true })
      if (!fs.existsSync(messagesDir)) fs.mkdirSync(messagesDir, { recursive: true })

      for (const type of addedTypes) {
        const cfgFile = path.join(configDir, `${type}-config.json`)
        if (!fs.existsSync(cfgFile)) {
          fs.writeFileSync(cfgFile, JSON.stringify(defaultConfig(type), null, 2))
          console.log(`[PATCH] Created config file for type ${type}: ${cfgFile}`)
        }
        const msgFile = path.join(messagesDir, `${type}-messages.json`)
        if (!fs.existsSync(msgFile)) {
          fs.writeFileSync(msgFile, JSON.stringify(defaultMessages, null, 2))
          console.log(`[PATCH] Created messages file for type ${type}: ${msgFile}`)
        }
      }
    }

    return NextResponse.json({ message: 'Sensor/config updated successfully' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[PATCH] Error for sensor ${sensorId}:`, msg, err)
    return NextResponse.json({ error: msg, stack: err instanceof Error ? err.stack : undefined }, { status: 500 })
  }
}
