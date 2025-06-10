import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

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
  { params }: { params: Record<string, string> }
) {
  const sensorId = params.sensorId

  try {
    const { sensor } = await req.json()
    if (!sensor) {
      return NextResponse.json({ error: 'Missing sensor object' }, { status: 400 })
    }

    const basePath = path.join(process.cwd(), '..', 'data', sensorId)
    const sensorFile = path.join(basePath, `${sensorId}.json`)
    const configDir = path.join(basePath, 'configurations')
    const messagesDir = path.join(basePath, 'messages')

    if (!fs.existsSync(sensorFile)) {
      return NextResponse.json({ error: 'Sensor not found' }, { status: 404 })
    }

    const existing = JSON.parse(fs.readFileSync(sensorFile, 'utf-8'))
    const updated = { ...existing, ...sensor }
    fs.writeFileSync(sensorFile, JSON.stringify(updated, null, 2))

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
      }
      const msgFile = path.join(messagesDir, `${type}-messages.json`)
      if (!fs.existsSync(msgFile)) {
        fs.writeFileSync(msgFile, JSON.stringify(defaultMessages, null, 2))
      }
    }

    return NextResponse.json({ message: 'Sensor updated successfully' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
